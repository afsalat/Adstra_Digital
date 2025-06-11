from django.db import models
from django.utils import timezone
from apis.user.models import CustomUser

class Attendance(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    checkin = models.DateTimeField(blank=True, null=True)
    checkout = models.DateTimeField(blank=True, null=True)
    work_report = models.TextField(blank=True, null=True)
    validation = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='Present', null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.status}"
