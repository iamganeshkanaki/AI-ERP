from django.contrib import admin
from .models import Project, ProjectMilestone, ProjectTask

class MilestoneInline(admin.TabularInline):
    model = ProjectMilestone
    extra = 1

class TaskInline(admin.TabularInline):
    model = ProjectTask
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_code', 'name', 'customer', 'status', 'budget', 'spent_amount', 'project_manager')
    list_filter = ('status', 'start_date')
    search_fields = ('project_code', 'name')
    inlines = [MilestoneInline, TaskInline]

@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'due_date', 'status', 'amount')
    list_filter = ('status',)

@admin.register(ProjectTask)
class ProjectTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assigned_to', 'status', 'priority', 'due_date')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'project__name')
