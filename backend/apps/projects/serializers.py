from rest_framework import serializers
from .models import Project, ProjectMilestone, ProjectTask

class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectTaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    project_code = serializers.CharField(source='project.project_code', read_only=True)

    class Meta:
        model = ProjectTask
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    manager_name = serializers.CharField(source='project_manager.get_full_name', read_only=True)
    burn_rate_percentage = serializers.FloatField(read_only=True)
    milestones_count = serializers.IntegerField(source='milestones.count', read_only=True)
    open_tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'burn_rate_percentage', 'milestones_count', 'open_tasks_count']

    def get_open_tasks_count(self, obj):
        return obj.tasks.exclude(status='Done').count()
