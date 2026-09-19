from rest_framework import permissions

class CanManageCRM(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.role in ['Admin', 'Executive', 'Sales']:
            return True
        return False
