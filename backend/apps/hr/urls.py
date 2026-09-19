from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendanceViewSet, LeaveRequestViewSet,
    PayrollRecordViewSet, ExpenseClaimViewSet
)

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet, basename='hr-attendance')
router.register(r'leaves', LeaveRequestViewSet, basename='hr-leave')
router.register(r'payroll', PayrollRecordViewSet, basename='hr-payroll')
router.register(r'expenses', ExpenseClaimViewSet, basename='hr-expense')
router.register(r'', LeaveRequestViewSet, basename='hr-default')

urlpatterns = [
    path('', include(router.urls)),
]
