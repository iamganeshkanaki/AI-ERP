from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, ProjectMilestone, ProjectTask
from .serializers import ProjectSerializer, ProjectMilestoneSerializer, ProjectTaskSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('customer', 'project_manager').prefetch_related('milestones', 'tasks').all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'customer', 'project_manager']
    search_fields = ['project_code', 'name', 'description']
    ordering_fields = ['start_date', 'budget', 'spent_amount']

class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    queryset = ProjectMilestone.objects.select_related('project').all()
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'status']
    ordering_fields = ['due_date']

class ProjectTaskViewSet(viewsets.ModelViewSet):
    queryset = ProjectTask.objects.select_related('project', 'milestone', 'assigned_to').all()
    serializer_class = ProjectTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to']
    search_fields = ['title', 'project__name']
    ordering_fields = ['due_date', 'priority', 'created_at']
