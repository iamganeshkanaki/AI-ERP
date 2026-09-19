from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceTicketViewSet, WarrantyRecordViewSet

router = DefaultRouter()
router.register(r'tickets', ServiceTicketViewSet, basename='service-ticket')
router.register(r'warranties', WarrantyRecordViewSet, basename='service-warranty')
router.register(r'', ServiceTicketViewSet, basename='service-default')

urlpatterns = [
    path('', include(router.urls)),
]
