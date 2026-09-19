from decimal import Decimal
from django.test import TestCase
from apps.crm.models import Customer
from apps.sales.models import SalesOrder
from apps.sales.services import SalesService

class SalesOrderWorkflowTests(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            customer_code='CUST-TEST-01',
            name='Test Client Corp',
            email='test@clientcorp.com',
            credit_limit=Decimal('50000.00'),
            current_balance=Decimal('10000.00')
        )
        self.order = SalesOrder.objects.create(
            order_number='SO-2026-001',
            customer=self.customer,
            order_date='2026-09-19',
            grand_total=Decimal('25000.00'),
            status='Draft'
        )

    def test_confirm_order_within_credit_limit(self):
        order, approved = SalesService.confirm_sales_order(self.order.id)
        self.assertTrue(approved)
        self.assertEqual(order.status, 'Confirmed')

    def test_order_exceeding_credit_limit_requires_approval(self):
        self.order.grand_total = Decimal('65000.00')
        self.order.save()
        order, approved = SalesService.confirm_sales_order(self.order.id)
        self.assertFalse(approved)
        self.assertEqual(order.status, 'Pending_Approval')
