from django.urls import path
from . import views

urlpatterns = [
    path('add-user/', views.adduser, name="create_user"),
    path('update-user/<int:user_id>', views.updateuser, name="update_user"),
    path('user-list/', views.listusers, name="list_user"),
    path('active-inactive/<int:user_id>', views.activeNinactive, name="active_inactive"),
    path('delete-user/<user_id>/',  views.delete_user, name="delete_user"),
    path('login/', views.login_view, name="login"),
    path('logout/<int:user_id>/', views.logout_view, name="logout"),
    path('work_report/<int:user_id>/', views.update_work_report, name="work_report")
]
