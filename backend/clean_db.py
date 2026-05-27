import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from apis.attendance.models import Attendance
from apis.user.models import CustomUser

# Find all Attendance rows whose user_id is not in CustomUser
valid_user_ids = set(CustomUser.objects.values_list('id', flat=True))
orphaned = Attendance.objects.exclude(user_id__in=valid_user_ids)
print("Found orphaned attendance records count:", orphaned.count())
if orphaned.exists():
    deleted_count, _ = orphaned.delete()
    print("Deleted orphaned records:", deleted_count)
else:
    print("No orphaned records found.")
