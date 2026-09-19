from decimal import Decimal
from django.test import TestCase
from apps.crm.models import Customer
from apps.finance.models import Invoice, Payment, GeneralLedger
from apps.finance.services import FinanceService

class FinanceWorkflowTests(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            customer_code='CUST-FIN-01',
            name='Orion Advanced Systems',
            email='finance@orionsys.com',
            current_balance=Decimal('100000.00')
        )
        self.invoice = Invoice.objects.create(
            invoice_number='INV-2026-009',
            customer=self.customer,
            issue_date='2026-09-01',
            due_date='2026-09-30',
            status='Sent',
            total_amount=Decimal('50000.00'),
            paid_amount=Decimal('0.00')
        )

    def test_process_customer_payment(self):
        payment = FinanceService.process_customer_payment(
            self.invoice.id, Decimal('50000.00'), 'Bank_Transfer', 'UTR-991823'
        )
        self.assertEqual(payment.amount, Decimal('50000.00'))
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.status, 'Paid')
        self.assertEqual(self.invoice.paid_amount, Decimal('50000.00'))
        
        # Check General Ledger entries generated
        gl_entries = GeneralLedger.objects.filter(reference_number=payment.payment_number)
        self.assertEqual(gl_entries.count(), 2)
