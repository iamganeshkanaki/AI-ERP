from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import SalesOrder, SalesOrderItem, DeliveryNote

class SalesService:
    @staticmethod
    def calculate_order_totals(sales_order: SalesOrder):
        """Calculates line-item taxes, subtotal, and grand total for a sales order."""
        subtotal = Decimal('0.00')
        tax_total = Decimal('0.00')

        for item in sales_order.items.all():
            line_subtotal = item.quantity * item.unit_price
            line_tax = (line_subtotal * (item.tax_rate / Decimal('100.0'))).quantize(Decimal('0.01'))
            item.tax_amount = line_tax
            item.total_amount = line_subtotal + line_tax
            item.save(update_fields=['tax_amount', 'total_amount'])

            subtotal += line_subtotal
            tax_total += line_tax

        sales_order.subtotal = subtotal
        sales_order.tax_total = tax_total
        sales_order.grand_total = subtotal + tax_total - sales_order.discount_total
        sales_order.save(update_fields=['subtotal', 'tax_total', 'grand_total'])
        return sales_order

    @staticmethod
    @transaction.atomic
    def confirm_sales_order(order_id: str):
        """Validates credit limit and transitions order to Confirmed."""
        order = SalesOrder.objects.select_for_update().get(id=order_id)
        if order.status not in ['Draft', 'Pending_Approval']:
            raise ValidationError(f"Order cannot be confirmed from status '{order.status}'")

        customer = order.customer
        # Check credit limit rule
        if (customer.current_balance + order.grand_total) > customer.credit_limit:
            order.status = 'Pending_Approval'
            order.notes += "\n[System Rule]: Order total exceeds customer credit limit. Requires executive approval."
            order.save(update_fields=['status', 'notes'])
            return order, False  # requires approval

        order.status = 'Confirmed'
        order.save(update_fields=['status'])
        return order, True

    @staticmethod
    @transaction.atomic
    def create_delivery_dispatch(order_id: str, carrier='', tracking_number=''):
        order = SalesOrder.objects.select_for_update().get(id=order_id)
        delivery_num = f"DN-{order.order_number.replace('SO-', '')}"
        
        from django.utils import timezone
        delivery = DeliveryNote.objects.create(
            delivery_number=delivery_num,
            sales_order=order,
            dispatch_date=timezone.now(),
            carrier=carrier,
            tracking_number=tracking_number,
            status='In_Transit'
        )
        order.status = 'Processing'
        order.save(update_fields=['status'])
        return delivery
