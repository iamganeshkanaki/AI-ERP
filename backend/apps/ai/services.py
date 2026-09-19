from decimal import Decimal
from django.utils import timezone
from .models import AIConversation, AIMessage, AIAuditLog
from apps.inventory.models import Product, Stock
from apps.crm.models import Customer
from apps.purchase.models import PurchaseOrder
from apps.purchase.services import PurchaseService
from apps.reports.services import ReportingService
from apps.approvals.models import ApprovalRequest

class AIAgentService:
    @staticmethod
    def execute_tool(tool_name: str, args: dict, user):
        """Executes authorized ERP tools directly against Django models/services."""
        log = AIAuditLog(
            user=user,
            prompt=args.get('_prompt', ''),
            tool_name=tool_name,
            tool_arguments=args,
            authorized=False
        )

        try:
            if tool_name == 'query_stock':
                sku = args.get('sku')
                product = Product.objects.get(sku=sku)
                stocks = Stock.objects.filter(product=product).select_related('warehouse')
                stock_data = [
                    {'warehouse': s.warehouse.name, 'quantity': float(s.quantity), 'available': float(s.available_quantity)}
                    for s in stocks
                ]
                result = {
                    'sku': product.sku,
                    'name': product.name,
                    'reorder_level': float(product.reorder_level),
                    'stocks': stock_data
                }
                log.authorized = True
                log.execution_result = result
                log.save()
                return result

            elif tool_name == 'check_customer_credit':
                code = args.get('customer_code')
                cust = Customer.objects.get(customer_code=code)
                result = {
                    'customer_code': cust.customer_code,
                    'name': cust.name,
                    'credit_limit': float(cust.credit_limit),
                    'current_balance': float(cust.current_balance),
                    'available_credit': float(cust.credit_limit - cust.current_balance),
                    'status': cust.status
                }
                log.authorized = True
                log.execution_result = result
                log.save()
                return result

            elif tool_name == 'get_pending_approvals':
                approvals = ApprovalRequest.objects.filter(status='Pending')[:10]
                result = [
                    {'id': str(a.id), 'module': a.module, 'title': a.reference_title, 'amount': float(a.amount or 0)}
                    for a in approvals
                ]
                log.authorized = True
                log.execution_result = {'pending_approvals': result}
                log.save()
                return result

            elif tool_name == 'approve_purchase_order':
                if user.role not in ['Admin', 'Executive', 'Purchase']:
                    raise PermissionError("Role not permitted to approve purchase orders.")
                po_number = args.get('po_number')
                po = PurchaseOrder.objects.get(po_number=po_number)
                updated_po = PurchaseService.approve_purchase_order(po.id, user)
                result = {'status': 'Approved', 'po_number': updated_po.po_number, 'approved_at': str(updated_po.approved_at)}
                log.authorized = True
                log.execution_result = result
                log.save()
                return result

            elif tool_name == 'get_executive_kpis':
                result = ReportingService.get_executive_kpis()
                log.authorized = True
                log.execution_result = result
                log.save()
                return result

            else:
                result = {'error': f"Unknown tool: {tool_name}"}
                log.execution_result = result
                log.save()
                return result

        except Exception as e:
            log.execution_result = {'error': str(e)}
            log.save()
            raise e

    @staticmethod
    def handle_user_query(conversation_id, prompt: str, user):
        """Processes user prompt, performs intent triage, and executes relevant tools."""
        conv = AIConversation.objects.get(id=conversation_id, user=user)
        
        # Save user message
        AIMessage.objects.create(
            conversation=conv,
            role='user',
            content=prompt
        )

        prompt_lower = prompt.lower()
        tool_name = None
        tool_args = {'_prompt': prompt}
        response_text = ""

        if "stock" in prompt_lower or "inventory" in prompt_lower:
            # Check if an SKU is provided
            words = prompt.replace(',', ' ').split()
            sku_found = next((w for w in words if w.startswith('SKU-') or w.isupper() and len(w) > 3), None)
            if sku_found:
                tool_name = 'query_stock'
                tool_args['sku'] = sku_found

        elif "credit" in prompt_lower or "customer" in prompt_lower:
            words = prompt.replace(',', ' ').split()
            code_found = next((w for w in words if w.startswith('CUST-')), None)
            if code_found:
                tool_name = 'check_customer_credit'
                tool_args['customer_code'] = code_found

        elif "approval" in prompt_lower or "pending" in prompt_lower:
            tool_name = 'get_pending_approvals'

        elif "kpi" in prompt_lower or "revenue" in prompt_lower or "overview" in prompt_lower:
            tool_name = 'get_executive_kpis'

        tool_result = None
        if tool_name:
            try:
                tool_result = AIAgentService.execute_tool(tool_name, tool_args, user)
                response_text = f"I executed the tool `{tool_name}` to inspect live ERP records:\n\n{tool_result}"
            except Exception as e:
                response_text = f"Tool execution error: {str(e)}"
        else:
            response_text = (
                f"Nexus Copilot is analyzing your query: '{prompt}'. "
                "I am integrated with ERP modules (CRM, Sales, Procurement, Inventory, Finance, and Approvals). "
                "You can ask me to check stock for a specific SKU, verify customer credit limits, list pending approvals, or show executive KPIs."
            )

        # Save assistant message
        assistant_msg = AIMessage.objects.create(
            conversation=conv,
            role='assistant',
            content=response_text,
            tool_calls=[{'tool': tool_name, 'args': tool_args}] if tool_name else None,
            tool_results=[tool_result] if tool_result else None
        )

        return assistant_msg
