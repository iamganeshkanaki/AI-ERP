from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .services import ReportingService

class ExecutiveDashboardKPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        kpis = ReportingService.get_executive_kpis()
        return Response(kpis)

class ActionCenterSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        action_data = ReportingService.get_action_center_summary()
        return Response(action_data)
