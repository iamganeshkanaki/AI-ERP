from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Invoice, VendorInvoice, Payment, ChartOfAccounts, GeneralLedger

class FinanceService:
    @staticmethod
    def calculate_invoice_totals(invoice: Invoice):
        subtotal = Decimal('0.00')
        tax_total = Decimal('0.00')

        for item in invoice.items.all():
            line_sub = item.quantity * item.unit_price
            line_tax = (line_sub * (item.tax_rate / Decimal('100.0'))).quantize(Decimal('0.01'))
            item.tax_amount = line_tax
            item.total_amount = line_sub + line_tax
            item.save(update_fields=['tax_amount', 'total_amount'])

            subtotal += line_sub
            tax_total += line_tax

        invoice.subtotal = subtotal
        invoice.tax_amount = tax_total
        invoice.total_amount = subtotal + tax_total - invoice.discount_amount
        invoice.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])
        return invoice

    @staticmethod
    @transaction.atomic
    def process_customer_payment(invoice_id, amount, payment_method='Bank_Transfer', reference_number='', notes=''):
        invoice = Invoice.objects.select_for_update().get(id=invoice_id)
        pay_amount = Decimal(str(amount))

        if pay_amount <= Decimal('0.00'):
            raise ValidationError("Payment amount must be greater than zero.")

        if pay_amount > invoice.balance_due:
            raise ValidationError(f"Payment amount (₹{pay_amount}) exceeds remaining balance due (₹{invoice.balance_due}).")

        # Create Payment record
        payment_num = f"PAY-IN-{timezone.now().strftime('%Y%m%d')}-{Payment.objects.count() + 1:04d}"
        payment = Payment.objects.create(
            payment_number=payment_num,
            payment_type='Inward',
            customer=invoice.customer,
            invoice=invoice,
            amount=pay_amount,
            payment_date=timezone.now().date(),
            payment_method=payment_method,
            reference_number=reference_number,
            notes=notes
        )

        # Update invoice paid_amount & status
        invoice.paid_amount += pay_amount
        if invoice.paid_amount >= invoice.total_amount:
            invoice.status = 'Paid'
        else:
            invoice.status = 'Partially_Paid'
        invoice.save(update_fields=['paid_amount', 'status'])

        # Update customer current balance
        customer = invoice.customer
        customer.current_balance = max(Decimal('0.00'), customer.current_balance - pay_amount)
        customer.save(update_fields=['current_balance'])

        # Record GL Double Entry: Debit Bank, Credit Accounts Receivable
        bank_acc, _ = ChartOfAccounts.objects.get_or_create(
            code='1010', defaults={'name': 'Main Operating Bank Account', 'account_type': 'Asset'}
        )
        ar_acc, _ = ChartOfAccounts.objects.get_or_create(
            code='1200', defaults={'name': 'Accounts Receivable', 'account_type': 'Asset'}
        )

        GeneralLedger.objects.create(
            transaction_date=payment.payment_date,
            account=bank_acc,
            debit=pay_amount,
            credit=Decimal('0.00'),
            reference_type='Payment',
            reference_number=payment.payment_number,
            description=f"Receipt against Invoice {invoice.invoice_number}"
        )
        GeneralLedger.objects.create(
            transaction_date=payment.payment_date,
            account=ar_acc,
            debit=Decimal('0.00'),
            credit=pay_amount,
            reference_type='Payment',
            reference_number=payment.payment_number,
            description=f"Settlement of Invoice {invoice.invoice_number}"
        )

        return payment

    @staticmethod
    def get_overdue_invoices():
        today = timezone.now().date()
        overdue = Invoice.objects.filter(
            due_date__lt=today,
            status__in=['Sent', 'Partially_Paid', 'Draft']
        )
        # Update their status to Overdue
        overdue.update(status='Overdue')
        return Invoice.objects.filter(status='Overdue')
