from decimal import Decimal
from django.db.models import Sum, Count, F
from django.utils import timezone
from apps.sales.models import SalesOrder
from apps.purchase.models import PurchaseOrder
from apps.finance.models import Invoice, Payment
from apps.inventory.models import Stock, Product
from apps.approvals.models import ApprovalRequest
from apps.users.models import Employee

class ReportingService:
    @staticmethod
    def get_executive_kpis():
        today = timezone.now().date()
        current_year = today.year

        # Sales KPIs
        total_sales_revenue = Invoice.objects.filter(
            status__in=['Sent', 'Partially_Paid', 'Paid']
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        total_collected = Payment.objects.filter(payment_type='Inward').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        open_ar_balance = Invoice.objects.filter(
            status__in=['Sent', 'Partially_Paid', 'Overdue']
        ).aggregate(
            total=Sum(F('total_amount') - F('paid_amount'))
        )['total'] or Decimal('0.00')

        overdue_invoices_count = Invoice.objects.filter(status='Overdue').count()

        # Procurement KPIs
        total_procurement = PurchaseOrder.objects.filter(
            status__in=['Approved', 'Received', 'Sent']
        ).aggregate(total=Sum('grand_total'))['total'] or Decimal('0.00')

        # Inventory KPIs
        low_stock_items = Stock.objects.filter(
            quantity__lte=F('product__reorder_level')
        ).count()

        # Pending Approvals
        pending_approvals = ApprovalRequest.objects.filter(status='Pending').count()

        # Active headcount
        total_employees = Employee.objects.filter(status='Active').count()

        return {
            'financial': {
                'total_billed_revenue': float(total_sales_revenue),
                'total_collected_cash': float(total_collected),
                'open_ar_receivables': float(open_ar_balance),
                'overdue_invoices_count': overdue_invoices_count,
            },
            'procurement': {
                'total_spend_committed': float(total_procurement),
            },
            'operations': {
                'low_stock_alert_count': low_stock_items,
                'pending_approvals_count': pending_approvals,
                'active_workforce_count': total_employees,
            },
            'generated_at': timezone.now().isoformat()
        }

    @staticmethod
    def get_action_center_summary():
        """Aggregates all immediate action items for the ERP dashboard."""
        today = timezone.now().date()

        pending_pos = PurchaseOrder.objects.filter(status='Pending_Approval').values(
            'id', 'po_number', 'vendor__name', 'grand_total', 'order_date'
        )[:5]

        pending_sos = SalesOrder.objects.filter(status='Pending_Approval').values(
            'id', 'order_number', 'customer__name', 'grand_total', 'order_date'
        )[:5]

        overdue_invs = Invoice.objects.filter(status='Overdue').values(
            'id', 'invoice_number', 'customer__name', 'total_amount', 'due_date'
        )[:5]

        critical_approvals = ApprovalRequest.objects.filter(status='Pending').values(
            'id', 'module', 'reference_title', 'amount', 'created_at'
        )[:5]

        return {
            'pending_purchase_orders': list(pending_pos),
            'pending_sales_orders': list(pending_sos),
            'overdue_invoices': list(overdue_invs),
            'pending_approvals': list(critical_approvals),
        }
