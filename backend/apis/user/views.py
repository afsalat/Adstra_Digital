import secrets
import string
import logging
import threading
from datetime import time
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django.views.decorators.cache import never_cache
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle

from .models import CustomUser
from .serializers import UserSerializer
from apis.attendance.models import Attendance
from utils.jwt_helper import generate_jwt
from utils.permissions import PERMISSIONS, ROLE_PERMISSIONS, require_permission, has_permission
from utils.logging_helper import log_action

logger = logging.getLogger(__name__)

SELF_UPDATE_FIELDS = {'password', 'phone', 'email', 'address', 'fullname'}
ADMIN_UPDATE_FIELDS = SELF_UPDATE_FIELDS | {'username', 'designation', 'department', 'is_team_lead', 'is_active', 'role', 'custom_permissions'}
PERMISSION_FIELDS = {'role', 'custom_permissions'}


class LoginRateThrottle(ScopedRateThrottle):
    scope = 'login'


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def adduser(request):
    denial = require_permission(request, "users.create")
    if denial:
        return denial
    try:
        data = request.data.copy()
        if PERMISSION_FIELDS & set(data) and not has_permission(request.user, "users.manage_permissions"):
            return Response({"error": "Permission denied.", "required_permission": "users.manage_permissions"}, status=status.HTTP_403_FORBIDDEN)

        # Generate a random password
        characters = string.ascii_letters + string.digits + string.punctuation
        generated_password = ''.join(secrets.choice(characters) for _ in range(10))
        data['password'] = generated_password

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            new_user = serializer.save()
            log_action(request.user, "User Created", f"Created user {new_user.username}", request)

            # Send the password to the user's email in background
            email = data.get('email')
            if email:
                def send_email_task():
                    try:
                        send_mail(
                            subject="Your Adstra Digital Account Credentials",
                            message=(
                                f"Hello {data.get('fullname')},\n\n"
                                f"Your Wiseway account has been created.\n\n"
                                f"Username: {data.get('username')}\n"
                                f"Password: {generated_password}\n\n"
                                f"Please change your password after first login."
                            ),
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[email],
                            fail_silently=False,
                        )
                    except Exception as mail_err:
                        logger.error(f"Email sending failed: {mail_err}")

                email_thread = threading.Thread(target=send_email_task)
                email_thread.start()

            return Response({
                "message": "User created successfully. Credentials sent to email.",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            logger.warning(f"User creation validation failed: {serializer.errors}")
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        logger.exception("Unexpected error in adduser")
        return Response({"error": "Unable to create user."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    denial = require_permission(request, "users.delete")
    if denial:
        return denial
    try:
        user = CustomUser.objects.get(pk=user_id)
        if user.is_superuser and not request.user.is_superuser:
            return Response({"error": "Only superusers can delete superusers."}, status=status.HTTP_403_FORBIDDEN)
        user.is_active = False
        user.save(update_fields=['is_active'])
        log_action(request.user, "User Deactivated", f"Deactivated user {user.username}", request)
        return Response({"message": "User deactivated successfully."}, status=204)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)



# GET /listusers/ - list users
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@never_cache
def listusers(request):
    denial = require_permission(request, "users.view")
    if denial:
        return denial
    try:
        users = CustomUser.objects.all().only(
            'id', 'username', 'joining_date', 'phone', 'email', 'address', 'designation',
            'department', 'role', 'custom_permissions', 'fullname', 'is_active', 'is_staff',
            'is_superuser', 'is_team_lead'
        ).order_by('fullname')
        
        serializer = UserSerializer(users, many=True)
        return Response({"users": serializer.data}, status=status.HTTP_200_OK)
    except Exception:
        logger.exception("Unable to list users")
        return Response({"error": "Unable to list users."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# PUT /updateuser/<id>/ - update user
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def updateuser(request, user_id):
    is_self_update = str(request.user.id) == str(user_id)
    required_permission = "users.update_self" if is_self_update else "users.update"
    denial = require_permission(request, required_permission)
    if denial:
        return denial
    try:
        user = CustomUser.objects.get(id=user_id)
        allowed_fields = ADMIN_UPDATE_FIELDS if has_permission(request.user, "users.update") else SELF_UPDATE_FIELDS
        data = {key: value for key, value in request.data.items() if key in allowed_fields}

        if not data:
            return Response({"error": "No permitted fields supplied."}, status=status.HTTP_400_BAD_REQUEST)

        if PERMISSION_FIELDS & set(data) and not has_permission(request.user, "users.manage_permissions"):
            return Response({"error": "Permission denied.", "required_permission": "users.manage_permissions"}, status=status.HTTP_403_FORBIDDEN)

        if user.is_superuser and not request.user.is_superuser and not is_self_update:
            return Response({"error": "Only superusers can update superusers."}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(request.user, "User Updated", f"Updated user {user.username}", request)
            return Response({"message": "User updated successfully", "user": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Error updating user {user_id}")
        return Response({"error": "Unable to update user."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# PUT /updateuser/<id>/ - update user (activate/deactivate or other fields)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def activeNinactive(request, user_id):
    denial = require_permission(request, "users.deactivate")
    if denial:
        return denial
    try:
        user = CustomUser.objects.get(id=user_id)
        if 'is_active' not in request.data:
            return Response({"error": "is_active is required."}, status=status.HTTP_400_BAD_REQUEST)

        is_active_value = str(request.data['is_active']).lower()
        data = {'is_active': is_active_value in ['true', '1']}
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(request.user, "User Status Changed", f"Changed status for {user.username} to {data['is_active']}", request)
            return Response({
                "message": "User Status changed successfully",
                "user": serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Error changing status for user {user_id}")
        return Response({"error": "Unable to change user status."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# POST /login/ - user login & check-in
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        location = request.data.get('location', '')

        user = CustomUser.objects.filter(username=username).first()
        if not user or not user.is_active:
            return Response({"error": "Invalid username or password"}, status=400)
        serial_user = UserSerializer(user)

        if check_password(password, user.password):
            token = generate_jwt(user.id)
            log_action(user, "Login", "User logged in successfully", request)

            today = timezone.now().date()
            attendance, created = Attendance.objects.get_or_create(user=user, date=today)

            if created:
                attendance.checkin = timezone.now()
                attendance.location = location
                attendance.save()
                checkin_status = "Check-in recorded"
            else:
                checkin_status = "Already checked in today"

            return Response({
                "message": f"Login successful, {checkin_status}",
                "token": token,
                "user": serial_user.data
            }, status=200)

        return Response({"error": "Invalid username or password"}, status=400)

    except Exception:
        logger.exception("Login failed")
        return Response({"error": "Login failed"}, status=500)




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request, user_id):
    if str(request.user.id) == str(user_id):
        denial = require_permission(request, "attendance.self")
    else:
        denial = require_permission(request, "attendance.update_any")
    if denial:
        return denial
    try:
        today = timezone.now().date()
        attendance = Attendance.objects.filter(user=user_id, date=today).first()

        if not attendance:
            return Response({"error": "No check-in record found"}, status=404)
        if attendance.checkout:
            return Response({"error": "Checkout already recorded for today"}, status=400)
        if not attendance.work_report or attendance.work_report.strip() == "":
            return Response({"error": "Work report not submitted"}, status=400)

        attendance.checkout = timezone.now()

        # Define rules
        checkin_time = attendance.checkin.time() if attendance.checkin else None
        if checkin_time:
            if checkin_time <= time(9, 30):
                attendance.status = "Present"
                salary_cut = 0
            elif time(9, 30) < checkin_time < time(10, 30):
                attendance.status = "Present"
                late_minutes = ((checkin_time.hour * 60 + checkin_time.minute) - (9 * 60 + 30))
                salary_cut = late_minutes  # 1 INR per minute
            elif time(10, 30) <= checkin_time < time(13, 0):
                attendance.status = "Half Day"
                salary_cut = 0
            else:
                attendance.status = "Absent"
                salary_cut = 0
        else:
            attendance.status = "Check-in missing"
            salary_cut = 0

        attendance.salary_cut = salary_cut
        attendance.save()
        log_action(request.user, "Logout", "User logged out and checked out", request)

        return Response({
            "message": "Logout successful, checkout recorded",
            "status": attendance.status,
            "salary_cut": salary_cut
        }, status=200)

    except Exception:
        logger.exception(f"Logout failed for user {user_id}")
        return Response({"error": "Unable to logout."}, status=500)




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_work_report(request, user_id):
    if str(request.user.id) != str(user_id) and not has_permission(request.user, "attendance.update_any"):
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
    if str(request.user.id) == str(user_id):
        denial = require_permission(request, "attendance.self")
    else:
        denial = require_permission(request, "attendance.update_any")
    if denial:
        return denial
    try:
        work_report = request.data.get("work_report", "").strip()

        if not work_report:
            return Response({"error": "Work report is required"}, status=400)

        today = timezone.now().date()
        attendance, created = Attendance.objects.get_or_create(user=user_id, date=today)

        attendance.work_report = work_report
        attendance.save()

        return Response({"message": "Work report submitted successfully"}, status=200)

    except Exception:
        logger.exception(f"Work report update failed for user {user_id}")
        return Response({"error": "Unable to submit work report."}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_password(request, user_id):
    denial = require_permission(request, "users.reset_password")
    if denial:
        return denial
    try:
        user = CustomUser.objects.get(id=user_id)

        # Generate a new random password
        characters = string.ascii_letters + string.digits + string.punctuation
        new_password = ''.join(secrets.choice(characters) for _ in range(10))

        user.set_password(new_password)
        user.save(update_fields=['password'])
        log_action(request.user, "Password Reset", f"Reset password for user {user.username}", request)

        # Send the new password via email in background
        email = user.email
        if email:
            def send_reset_email():
                try:
                    send_mail(
                        subject="Your Adstra Digital Password Has Been Reset",
                        message=(
                            f"Hello {user.fullname},\n\n"
                            f"Your password for Adstra Digital has been reset by an administrator.\n\n"
                            f"New Password: {new_password}\n\n"
                            f"Please log in and change your password immediately."
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except Exception as mail_err:
                    logger.error(f"Password reset email failed: {mail_err}")

            email_thread = threading.Thread(target=send_reset_email)
            email_thread.start()

        return Response({"message": "Password reset successfully. New password sent to email."}, status=200)

    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception:
        logger.exception(f"Error resetting password for user {user_id}")
        return Response({"error": "Unable to reset password."}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({"user": UserSerializer(request.user).data}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def role_permissions(request):
    denial = require_permission(request, "users.manage_permissions")
    if denial:
        return denial
    return Response({
        "roles": ROLE_PERMISSIONS,
        "permissions": PERMISSIONS,
    }, status=status.HTTP_200_OK)
