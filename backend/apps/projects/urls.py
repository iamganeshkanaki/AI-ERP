from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectMilestoneViewSet, ProjectTaskViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'milestones', ProjectMilestoneViewSet, basename='project-milestone')
router.register(r'tasks', ProjectTaskViewSet, basename='project-task')
router.register(r'', ProjectViewSet, basename='project-default')

urlpatterns = [
    path('', include(router.urls)),
]
