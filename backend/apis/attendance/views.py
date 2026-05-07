import logging
from django.utils.timezone import localdate
from django.views.decorators.cache import never_cache
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Attendance
from .serializers import AttendanceSerializer
from utils.pagination import StandardResultsSetPagination
from utils.permissions import has_permission, require_permission

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@never_cache
def listAttendance(request):
    try:
        today = localdate()
        page = request.query_params.get("page", "1")
        filter_date = request.query_params.get("date", None)
        start_date = request.query_params.get("start_date", None)
        end_date = request.query_params.get("end_date", None)

        # Optimization: Use select_related to fetch user data in a single query if serializer needs it
        # and filter only necessary fields if possible.
        base_queryset = Attendance.objects.select_related('user').all()

        user_id = request.query_params.get("user_id", None)
        if has_permission(request.user, "attendance.view_all"):
            pass
        elif has_permission(request.user, "attendance.self"):
            user_id = request.user.id  # Regular users can only see their own records
        else:
            return require_permission(request, "attendance.view_all")
            
        if user_id:
            base_queryset = base_queryset.filter(user_id=user_id)

        if start_date and end_date:
            queryset = base_queryset.filter(
                date__gte=start_date, 
                date__lte=end_date
            ).order_by("-date", "-id")
        elif filter_date:
            queryset = base_queryset.filter(date=filter_date).order_by("-id")
        elif page == "1":
            queryset = base_queryset.filter(date=today).order_by("-id")
        else:
            queryset = base_queryset.exclude(date=today).order_by("-date", "-id")

        # Check for export flag
        if request.query_params.get("export") == "true":
            denial = require_permission(request, "attendance.export")
            if denial:
                return denial
            serializer = AttendanceSerializer(queryset, many=True)
            return Response({"users": serializer.data})

        paginator = StandardResultsSetPagination()
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = AttendanceSerializer(result_page, many=True)

        return paginator.get_paginated_response({"users": serializer.data})

    except Exception:
        logger.exception("Error listing attendance")
        return Response({"error": "Unable to list attendance."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def addAttendance(request):
    if has_permission(request.user, "attendance.create_any"):
        pass
    elif has_permission(request.user, "attendance.self"):
        # Check if user is trying to add attendance for themselves (though login usually handles this)
        if str(request.data.get('user')) != str(request.user.id):
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
    else:
        return require_permission(request, "attendance.create_any")

    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    logger.warning(f"Add attendance validation failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def validation(request, uid):
    denial = require_permission(request, "attendance.validate")
    if denial:
        return denial
    try:
        attendance_record = Attendance.objects.get(id=uid)
        data = request.data.copy()
        logger.debug(f"Validation update for record {uid}: {data}")
        
        serializer = AttendanceSerializer(attendance_record, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "successfully completed"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Attendance.DoesNotExist:
        return Response({"error": "Record not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Error in attendance validation for record {uid}")
        return Response({"error": "Unable to validate attendance."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def updateAttendance(request, uid):
    try:
        record = Attendance.objects.get(id=uid)
        if record.user_id == request.user.id:
            denial = require_permission(request, "attendance.self")
        else:
            denial = require_permission(request, "attendance.update_any")
        if denial:
            return denial
        serializer = AttendanceSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Attendance.DoesNotExist:
        return Response({"error": "Attendance record not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Error updating attendance record {uid}")
        return Response({"error": "Unable to update attendance."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
