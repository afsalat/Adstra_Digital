from django.urls import path
from apis.user.views import login_view, logout_view, update_work_report

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/<int:user_id>/', logout_view, name='logout'),
    path('work_report/', update_work_report, name="work-report")
]
