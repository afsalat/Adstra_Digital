from django.urls import path
from apis.user.views import login_view, logout_view, update_work_report
from .views import listAttendance, addAttendance, validation

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/<int:user_id>/', logout_view, name='logout'),
    path('work_report/<int:user_id>/', update_work_report, name="work-report"),
    path('list-attendance/', listAttendance, name="List-Attendence"),
    path('add-attendance/', addAttendance, name="add-Attendance"),
    path('validate/<int:uid>', validation, name="validattion")
]
