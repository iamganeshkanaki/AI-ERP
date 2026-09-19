from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, LeadViewSet, OpportunityViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='crm-customer')
router.register(r'leads', LeadViewSet, basename='crm-lead')
router.register(r'opportunities', OpportunityViewSet, basename='crm-opportunity')

urlpatterns = [
    path('', include(router.urls)),
]
