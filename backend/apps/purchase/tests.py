from decimal import Decimal
from django.test import TestCase
from apps.purchase.models import Vendor, PurchaseOrder
from apps.purchase.services import PurchaseService
from apps.users.models import User

class PurchaseWorkflowTests(TestCase):
    def setUp(self):
        self.approver = User.objects.create_user(
            email='procurelead@apexglobals.com',
            password='Password123!',
            role='Purchase'
        )
        self.vendor = Vendor.objects.create(
            vendor_code='VND-SUP-01',
            name='Precision Hydraulics Ltd',
            email='sales@precisionhydraulics.com'
        )
        self.po = PurchaseOrder.objects.create(
            po_number='PO-2026-901',
            vendor=self.vendor,
            order_date='2026-09-19',
            status='Pending_Approval',
            grand_total=Decimal('150000.00')
        )

    def test_approve_purchase_order(self):
        po = PurchaseService.approve_purchase_order(self.po.id, self.approver)
        self.assertEqual(po.status, 'Approved')
        self.assertEqual(po.approved_by, self.approver)
        self.assertIsNotNone(po.approved_at)
