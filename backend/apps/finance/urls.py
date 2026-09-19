from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChartOfAccountsViewSet, InvoiceViewSet, InvoiceItemViewSet,
    VendorInvoiceViewSet, PaymentViewSet, GeneralLedgerViewSet
)

router = DefaultRouter()
router.register(r'accounts', ChartOfAccountsViewSet, basename='finance-account')
router.register(r'invoices', InvoiceViewSet, basename='finance-invoice')
router.register(r'invoice-items', InvoiceItemViewSet, basename='finance-invoice-item')
router.register(r'bills', VendorInvoiceViewSet, basename='finance-bill')
router.register(r'payments', PaymentViewSet, basename='finance-payment')
router.register(r'ledger', GeneralLedgerViewSet, basename='finance-ledger')
router.register(r'', InvoiceViewSet, basename='finance-default')

urlpatterns = [
    path('', include(router.urls)),
]
