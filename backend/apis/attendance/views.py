from utils.pagination import StandardResultsSetPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from .models import Attendance
from django.utils import timezone
from .serializers import AttendanceSerializer
from django.views.decorators.cache import never_cache
from rest_framework.permissions import AllowAny
import traceback
from django.utils.timezone import localdate


@api_view(["GET"])
@permission_classes([AllowAny])
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
            serializer = AttendanceSerializer(queryset, many=True)
            return Response({"users": serializer.data})

        paginator = StandardResultsSetPagination()
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = AttendanceSerializer(result_page, many=True)

        return paginator.get_paginated_response({"users": serializer.data})

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(["POST"])
@permission_classes([AllowAny])
def addAttendance(request):
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(["PUT"])
@permission_classes([AllowAny])
def validation(request, uid):
    try:
        user = Attendance.objects.get(id=uid)
        data = request.data.copy()
        print(data)
        if not user:
            return Response({"message": "user not founded"})
        serializer = AttendanceSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "successfully completed"}, status=status.HTTP_200_OK)
    except Exception as e:

        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)