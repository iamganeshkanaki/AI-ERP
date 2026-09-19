from django.urls import path
from .views import ExecutiveDashboardKPIView, ActionCenterSummaryView

urlpatterns = [
    path('dashboard-kpis/', ExecutiveDashboardKPIView.as_view(), name='report-dashboard-kpis'),
    path('action-center/', ActionCenterSummaryView.as_view(), name='report-action-center'),
]
