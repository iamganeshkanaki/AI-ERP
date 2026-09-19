from rest_framework import permissions

class IsAdminOrExecutive(permissions.BasePermission):
    """Allows access only to Admin or Executive users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_superuser or request.user.role in ['Admin', 'Executive', 'SuperAdmin'])
        )

class RoleBasedPermission(permissions.BasePermission):
    """
    Checks if request.user has one of the allowed roles defined on the ViewSet.
    Example: required_roles = ['Admin', 'Finance_Manager', 'Accountant']
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.is_superuser or getattr(request.user, 'role', '') == 'Admin':
            return True

        required_roles = getattr(view, 'required_roles', None)
        if not required_roles:
            return True

        user_role = getattr(request.user, 'role', '')
        return user_role in required_roles
