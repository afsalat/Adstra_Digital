import secrets
import string
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view
from .models import CustomUser
from django.contrib.auth.hashers import check_password
from apis.attendance.models import Attendance
from django.utils import timezone
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from datetime import time
from utils.jwt_helper import generate_jwt
from django.views.decorators.cache import never_cache
from datetime import timedelta
import traceback



@api_view(["POST"])
@permission_classes([AllowAny])
def adduser(request):
    try:
        data = request.data.copy()

        # Generate a random password
        characters = string.ascii_letters + string.digits + string.punctuation
        generated_password = ''.join(secrets.choice(characters) for _ in range(10))
        data['password'] = make_password(generated_password)

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

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
                        print(f"Email sending failed: {mail_err}")

                import threading
                email_thread = threading.Thread(target=send_email_task)
                email_thread.start()

            return Response({
                "message": "User created successfully",
                "generated_password": generated_password,
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(pk=user_id)
        user.delete()
        return Response({"message": "User deleted successfully."}, status=204)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)



# GET /listusers/ - list users
@api_view(["GET"])
@permission_classes([AllowAny])
@never_cache
def listusers(request):
    try:
        # Optimization: Filter by active users only and fetch only the fields defined in UserSerializer
        users = CustomUser.objects.all().only(
            'id', 'username', 'joining_date', 'phone', 'email', 'address', 'designation', 'fullname', 'is_active'
        ).order_by('fullname')
        
        serializer = UserSerializer(users, many=True)
        return Response({"users": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# PUT /updateuser/<id>/ - update user
@api_view(["PUT"])
@permission_classes([AllowAny])
def updateuser(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        data = request.data.copy()
        if 'password' in data:
            data['password'] = make_password(data['password'])

        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully", "user": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# PUT /updateuser/<id>/ - update user (activate/deactivate or other fields)
@api_view(["PUT"])
@permission_classes([AllowAny])
def activeNinactive(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        data = request.data.copy()


        # Handle is_active: convert to boolean properly
        if 'is_active' in data:
            is_active_value = str(data['is_active']).lower()
            data['is_active'] = is_active_value in ['true', '1']

        # Apply the update using serializer
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "User Status changed successfully",
                "user": serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# POST /login/ - user login & check-in
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        location = request.data.get('location', '')

        user = CustomUser.objects.filter(username=username).first()
        if not user:
            return Response({"error": "User not found"}, status=404)
        serial_user = UserSerializer(user)

        if check_password(password, user.password):
            token = generate_jwt(user.id)

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

        return Response({"error": "Invalid password"}, status=400)

    except Exception as e:
        print("error:", traceback.format_exc())
        return Response({"error": str(e)}, status=500)




@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request, user_id):
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

        return Response({
            "message": "Logout successful, checkout recorded",
            "status": attendance.status,
            "salary_cut": salary_cut
        }, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)




@api_view(["POST"])
@permission_classes([AllowAny])
def update_work_report(request, user_id):
    try:
        work_report = request.data.get("work_report", "").strip()

        if not work_report:
            return Response({"error": "Work report is required"}, status=400)

        today = timezone.now().date()
        attendance, created = Attendance.objects.get_or_create(user=user_id, date=today)

        attendance.work_report = work_report
        attendance.save()

        return Response({"message": "Work report submitted successfully"}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)

        # Generate a new random password
        characters = string.ascii_letters + string.digits + string.punctuation
        new_password = ''.join(secrets.choice(characters) for _ in range(10))

        user.password = make_password(new_password)
        user.save()

        # Send the new password via email in background
        email = user.email
        if email:
            def send_reset_email():
                try:
                    send_mail(
                        subject="Your Adstra Digital Password Has Been Reset",
                        message=(
                            f"Hello {user.fullname},\n\n"
                            f"Your password has been reset by an administrator.\n\n"
                            f"Username: {user.username}\n"
                            f"New Password: {new_password}\n\n"
                            f"Please change your password after logging in."
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except Exception as mail_err:
                    print(f"Password reset email failed: {mail_err}")

            import threading
            threading.Thread(target=send_reset_email).start()

        return Response({
            "message": "Password reset successfully",
            "generated_password": new_password,
        }, status=status.HTTP_200_OK)

    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
