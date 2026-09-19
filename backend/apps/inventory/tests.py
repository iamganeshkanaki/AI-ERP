from decimal import Decimal
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.users.models import Company, Branch
from apps.inventory.models import Warehouse, ProductCategory, Product, Stock
from apps.inventory.services import InventoryService

class InventoryServiceTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Apex Globals", code="APX")
        self.branch = Branch.objects.create(company=self.company, name="Plant 1", code="PLT-1")
        self.warehouse = Warehouse.objects.create(code="WH-MAIN", name="Central Depot", branch=self.branch)
        self.category = ProductCategory.objects.create(name="Electronics", code="ELEC")
        self.product = Product.objects.create(
            sku="SKU-MICRO-01",
            name="Micro Controller Board",
            category=self.category,
            unit_price=Decimal("1200.00"),
            cost_price=Decimal("800.00"),
            reorder_level=Decimal("10.00")
        )

    def test_inward_and_outward_movements(self):
        # Inward receipt
        InventoryService.record_movement(
            self.product.id, self.warehouse.id, 'Inward', Decimal('50.00'), 'GRN-101'
        )
        stock = Stock.objects.get(product=self.product, warehouse=self.warehouse)
        self.assertEqual(stock.quantity, Decimal('50.00'))

        # Outward dispatch
        InventoryService.record_movement(
            self.product.id, self.warehouse.id, 'Outward', Decimal('20.00'), 'SO-501'
        )
        stock.refresh_from_db()
        self.assertEqual(stock.quantity, Decimal('30.00'))

    def test_outward_insufficient_stock_raises_error(self):
        with self.assertRaises(ValidationError):
            InventoryService.record_movement(
                self.product.id, self.warehouse.id, 'Outward', Decimal('100.00'), 'SO-FAIL'
            )
