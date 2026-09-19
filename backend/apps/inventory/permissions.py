from rest_framework import permissions

class CanManageInventory(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.role in ['Admin', 'Executive', 'Inventory', 'Purchase', 'Sales']:
            return True
        return False
