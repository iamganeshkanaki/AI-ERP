from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import PurchaseOrder, GoodsReceipt

class PurchaseService:
    @staticmethod
    def calculate_po_totals(po: PurchaseOrder):
        subtotal = Decimal('0.00')
        tax_total = Decimal('0.00')

        for item in po.items.all():
            line_sub = item.quantity * item.unit_price
            line_tax = (line_sub * (item.tax_rate / Decimal('100.0'))).quantize(Decimal('0.01'))
            item.tax_amount = line_tax
            item.total_amount = line_sub + line_tax
            item.save(update_fields=['tax_amount', 'total_amount'])

            subtotal += line_sub
            tax_total += line_tax

        po.subtotal = subtotal
        po.tax_total = tax_total
        po.grand_total = subtotal + tax_total
        po.save(update_fields=['subtotal', 'tax_total', 'grand_total'])
        return po

    @staticmethod
    @transaction.atomic
    def approve_purchase_order(po_id: str, approver_user):
        po = PurchaseOrder.objects.select_for_update().get(id=po_id)
        if po.status not in ['Draft', 'Pending_Approval']:
            raise ValidationError(f"PO cannot be approved from current state '{po.status}'")

        # Business Rule: Approver must have role Admin, Executive, or Purchase_Manager
        if approver_user.role not in ['Admin', 'Executive', 'Purchase']:
            raise ValidationError("You do not possess procurement signing authority for this order.")

        po.status = 'Approved'
        po.approved_by = approver_user
        po.approved_at = timezone.now()
        po.save(update_fields=['status', 'approved_by', 'approved_at'])
        return po

    @staticmethod
    @transaction.atomic
    def process_goods_receipt(po_id: str, warehouse_id: str, received_by_user, remarks=''):
        from apps.inventory.models import Warehouse, Stock, StockMovement
        po = PurchaseOrder.objects.select_for_update().get(id=po_id)
        warehouse = Warehouse.objects.get(id=warehouse_id)

        grn_number = f"GRN-{po.po_number.replace('PO-', '')}"
        grn = GoodsReceipt.objects.create(
            grn_number=grn_number,
            purchase_order=po,
            warehouse=warehouse,
            receipt_date=timezone.now(),
            received_by=received_by_user,
            remarks=remarks,
            status='Verified'
        )

        # Update received quantity and stock in warehouse
        for item in po.items.all():
            item.received_quantity = item.quantity
            item.save(update_fields=['received_quantity'])

            stock, _ = Stock.objects.get_or_create(
                product=item.product,
                warehouse=warehouse,
                defaults={'quantity': Decimal('0.00')}
            )
            stock.quantity += item.quantity
            stock.save(update_fields=['quantity'])

            StockMovement.objects.create(
                product=item.product,
                warehouse=warehouse,
                movement_type='Inward',
                quantity=item.quantity,
                reference_number=grn.grn_number,
                notes=f"Inward receipt against PO {po.po_number}"
            )

        po.status = 'Received'
        po.save(update_fields=['status'])
        return grn
