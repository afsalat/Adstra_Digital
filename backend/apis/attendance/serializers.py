from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(source='user.fullname', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'fullname', 'date', 'checkin', 'checkout', 'location',
                  'status', 'work_report', 'salary_cut', 'validation']
