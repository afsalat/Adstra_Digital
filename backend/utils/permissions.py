from functools import wraps

from rest_framework import status
from rest_framework.response import Response


PERMISSIONS = {
    "users.view": "View users",
    "users.create": "Create users",
    "users.update": "Update users",
    "users.update_self": "Update own profile",
    "users.deactivate": "Activate or deactivate users",
    "users.delete": "Delete users",
    "users.reset_password": "Reset user passwords",
    "users.manage_permissions": "Manage user roles and permissions",
    "attendance.view_all": "View all attendance",
    "attendance.create_any": "Create attendance for any user",
    "attendance.update_any": "Update attendance for any user",
    "attendance.validate": "Validate attendance",
    "attendance.export": "Export attendance",
    "attendance.self": "Manage own attendance",
    "clients.view": "View clients",
    "clients.create": "Create clients",
    "clients.update": "Update clients",
    "clients.delete": "Delete clients",
    "proposals.view": "View proposals",
    "proposals.create": "Create proposals",
    "proposals.update": "Update proposals",
    "proposals.delete": "Delete proposals",
    "invoices.view": "View invoices",
    "invoices.create": "Create invoices",
    "invoices.update": "Update invoices",
    "invoices.delete": "Delete invoices",
    "invoices.restore": "Restore invoices",
    "invoices.payments": "Manage invoice payments",
    "transactions.view": "View transactions",
    "transactions.create": "Create transactions",
    "transactions.delete": "Delete transactions",
    "transactions.restore": "Restore transactions",
    "settings.view": "View company settings",
    "settings.update": "Update company settings",
    "backup.export": "Export backup",
    "backup.import": "Import backup",
}


ROLE_PERMISSIONS = {
    "super_admin": ["*"],
    "admin": ["*"],
    "manager": [
        "users.view",
        "users.create",
        "users.update",
        "users.update_self",
        "attendance.view_all",
        "attendance.create_any",
        "attendance.update_any",
        "attendance.validate",
        "attendance.export",
        "clients.view",
        "clients.create",
        "clients.update",
        "clients.delete",
        "proposals.view",
        "proposals.create",
        "proposals.update",
        "proposals.delete",
        "invoices.view",
        "invoices.create",
        "invoices.update",
        "transactions.view",
        "transactions.create",
        "settings.view",
    ],
    "accountant": [
        "users.update_self",
        "clients.view",
        "proposals.view",
        "invoices.view",
        "invoices.create",
        "invoices.update",
        "invoices.delete",
        "invoices.restore",
        "invoices.payments",
        "transactions.view",
        "transactions.create",
        "transactions.delete",
        "transactions.restore",
        "settings.view",
    ],
    "team_lead": [
        "users.view",
        "users.update_self",
        "attendance.view_all",
        "attendance.create_any",
        "attendance.update_any",
        "attendance.validate",
        "attendance.self",
    ],
    "employee": [
        "users.update_self",
        "attendance.self",
    ],
}


ROLE_CHOICES = tuple((role, role.replace("_", " ").title()) for role in ROLE_PERMISSIONS)


def normalize_permissions(permissions):
    if not permissions:
        return []
    valid_codes = set(PERMISSIONS) | {"*"}
    return sorted({code for code in permissions if code in valid_codes})


def effective_permissions(user):
    if not user or not getattr(user, "is_authenticated", False):
        return []

    # EXPLICIT SUPERUSER CHECK
    is_super = getattr(user, "is_superuser", False)
    is_staff = getattr(user, "is_staff", False)
    
    if is_super or is_staff or getattr(user, "role", "") == "super_admin":
        return ["*"]

    role_permissions = ROLE_PERMISSIONS.get(getattr(user, "role", "employee"), [])
    custom_permissions = getattr(user, "custom_permissions", []) or []
    
    if "*" in role_permissions or "*" in custom_permissions:
        return ["*"]
        
    return normalize_permissions([*role_permissions, *custom_permissions])


def has_permission(user, permission_code):
    if not user or not getattr(user, "is_authenticated", False):
        return False
        
    # Superuser/Staff/SuperAdmin Bypass
    if (getattr(user, "is_superuser", False) or 
        getattr(user, "is_staff", False) or 
        getattr(user, "role", "") == "super_admin"):
        return True
        
    permissions = effective_permissions(user)
    return "*" in permissions or permission_code in permissions


def permission_denied(permission_code):
    return Response(
        {"error": "Permission denied.", "required_permission": permission_code},
        status=status.HTTP_403_FORBIDDEN,
    )


def require_permission(request, permission_code):
    if has_permission(request.user, permission_code):
        return None
    print(f"DEBUG: Permission denied for user {request.user} on {permission_code}")
    return permission_denied(permission_code)


def permission_required(permission_code):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            denial = require_permission(request, permission_code)
            if denial:
                return denial
            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator
