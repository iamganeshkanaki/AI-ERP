from decimal import Decimal
from django.db import transaction, models
from django.core.exceptions import ValidationError
from .models import Product, Warehouse, Stock, StockMovement

class InventoryService:
    @staticmethod
    @transaction.atomic
    def record_movement(product_id, warehouse_id, movement_type, quantity, reference_number, target_warehouse_id=None, notes=''):
        qty = Decimal(str(quantity))
        if qty <= Decimal('0.00'):
            raise ValidationError("Quantity must be greater than zero.")

        product = Product.objects.get(id=product_id)
        source_warehouse = Warehouse.objects.get(id=warehouse_id)

        source_stock, _ = Stock.objects.select_for_update().get_or_create(
            product=product,
            warehouse=source_warehouse,
            defaults={'quantity': Decimal('0.00'), 'reserved_quantity': Decimal('0.00')}
        )

        target_warehouse = None
        if target_warehouse_id:
            target_warehouse = Warehouse.objects.get(id=target_warehouse_id)

        if movement_type == 'Inward':
            source_stock.quantity += qty
            source_stock.save(update_fields=['quantity'])

        elif movement_type == 'Outward':
            if source_stock.quantity < qty:
                raise ValidationError(f"Insufficient stock for SKU {product.sku}. Available: {source_stock.quantity}, requested: {qty}")
            source_stock.quantity -= qty
            source_stock.save(update_fields=['quantity'])

        elif movement_type == 'Transfer':
            if not target_warehouse:
                raise ValidationError("Target warehouse required for stock transfer.")
            if source_stock.quantity < qty:
                raise ValidationError(f"Insufficient stock for transfer at source warehouse.")

            target_stock, _ = Stock.objects.select_for_update().get_or_create(
                product=product,
                warehouse=target_warehouse,
                defaults={'quantity': Decimal('0.00'), 'reserved_quantity': Decimal('0.00')}
            )

            source_stock.quantity -= qty
            source_stock.save(update_fields=['quantity'])

            target_stock.quantity += qty
            target_stock.save(update_fields=['quantity'])

        elif movement_type == 'Adjustment':
            source_stock.quantity = qty  # set directly
            source_stock.save(update_fields=['quantity'])

        movement = StockMovement.objects.create(
            product=product,
            warehouse=source_warehouse,
            target_warehouse=target_warehouse,
            movement_type=movement_type,
            quantity=qty,
            reference_number=reference_number,
            notes=notes
        )
        return movement

    @staticmethod
    def get_low_stock_alerts():
        """Returns all products where current stock in any warehouse <= reorder_level."""
        low_stocks = Stock.objects.select_related('product', 'warehouse').filter(
            quantity__lte=models.F('product__reorder_level')
        )
        return low_stocks
