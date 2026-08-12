import logging
from functools import wraps

from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


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
    "lead.view_own": "View own leads",
    "lead.view_all": "View all leads",
    "lead.view_my_profile": "View own lead profile",
    "lead.create": "Create leads",
    "lead.edit": "Edit leads",
    "lead.assign": "Assign leads",
    "lead.reassign": "Reassign leads",
    "lead.import": "Import leads",
    "lead.export": "Export leads",
    "lead.send_email": "Send lead emails",
    "lead.call": "Record lead calls",
    "lead.follow_up": "Manage lead follow-ups",
    "lead.schedule_meeting": "Schedule lead meetings",
    "lead.complete_demo": "Complete product demos",
    "lead.capture_requirement": "Capture lead requirements",
    "lead.technical_review": "Perform technical reviews",
    "lead.create_cost_estimate": "Create lead cost estimates",
    "lead.approve_cost_estimate": "Approve lead cost estimates",
    "lead.create_proposal": "Create lead proposals",
    "lead.create_quotation": "Create lead quotations",
    "lead.convert": "Convert leads",
    "lead.reject": "Reject leads",
    "lead.reopen": "Reopen leads",
    "lead.delete": "Delete leads",
    "lead.view_reports": "View lead reports",
    "lead.manage_settings": "Manage lead settings",
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
    "blogs.view": "View blog posts",
    "blogs.create": "Create blog posts",
    "blogs.update": "Update blog posts",
    "blogs.delete": "Delete blog posts",
    "blogs.keywords": "Manage blog interlinks",
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
        "lead.view_own",
        "lead.view_all",
        "lead.create",
        "lead.edit",
        "lead.assign",
        "lead.reassign",
        "lead.import",
        "lead.export",
        "lead.send_email",
        "lead.call",
        "lead.follow_up",
        "lead.schedule_meeting",
        "lead.complete_demo",
        "lead.capture_requirement",
        "lead.technical_review",
        "lead.create_cost_estimate",
        "lead.approve_cost_estimate",
        "lead.create_proposal",
        "lead.create_quotation",
        "lead.convert",
        "lead.reject",
        "lead.reopen",
        "lead.delete",
        "lead.view_reports",
        "lead.manage_settings",
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
        "blogs.view",
        "blogs.create",
        "blogs.update",
        "blogs.delete",
        "blogs.keywords",
    ],
    "accountant": [
        "users.update_self",
        "clients.view",
        "lead.view_own",
        "lead.create_cost_estimate",
        "lead.approve_cost_estimate",
        "lead.create_proposal",
        "lead.create_quotation",
        "lead.view_reports",
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
        "lead.view_own",
        "lead.create",
        "lead.edit",
        "lead.assign",
        "lead.reassign",
        "lead.import",
        "lead.export",
        "lead.send_email",
        "lead.call",
        "lead.follow_up",
        "lead.schedule_meeting",
        "lead.complete_demo",
        "lead.capture_requirement",
        "lead.technical_review",
        "lead.create_cost_estimate",
        "lead.create_proposal",
        "lead.create_quotation",
        "lead.convert",
        "lead.reject",
        "lead.reopen",
        "lead.view_reports",
    ],
    "employee": [
        "users.update_self",
        "attendance.self",
        "lead.view_own",
        "lead.create",
        "lead.edit",
        "lead.export",
        "lead.send_email",
        "lead.call",
        "lead.follow_up",
        "lead.schedule_meeting",
        "lead.complete_demo",
        "lead.capture_requirement",
        "lead.view_reports",
    ],
    "sales_and_marketing": [
        "users.update_self",
        "attendance.self",
        "lead.view_own",
        "lead.view_all",
        "lead.create",
        "lead.edit",
        "lead.assign",
        "lead.reassign",
        "lead.import",
        "lead.export",
        "lead.call",
        "lead.follow_up",
        "lead.schedule_meeting",
        "lead.complete_demo",
        "lead.capture_requirement",
        "lead.technical_review",
        "lead.create_cost_estimate",
        "lead.create_proposal",
        "lead.create_quotation",
        "lead.convert",
        "lead.reject",
        "lead.reopen",
        "lead.view_reports",
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

    # EXPLICIT SUPERUSER / SUPER ADMIN CHECK
    is_super = getattr(user, "is_superuser", False)
    role = getattr(user, "role", "")
    
    if is_super or role in {"super_admin", "admin"}:
        return ["*"]

    role_permissions = ROLE_PERMISSIONS.get(role or "employee", [])
    custom_permissions = getattr(user, "custom_permissions", []) or []
    
    if "*" in role_permissions or "*" in custom_permissions:
        return ["*"]
        
    return normalize_permissions([*role_permissions, *custom_permissions])


def has_permission(user, permission_code):
    if not user or not getattr(user, "is_authenticated", False):
        return False
        
    # Superuser/SuperAdmin/Admin Bypass
    if getattr(user, "is_superuser", False) or getattr(user, "role", "") in {"super_admin", "admin"}:
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
    logger.warning("Permission denied for user '%s' on '%s'", request.user, permission_code)
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
