from django.db import migrations, models


def backfill_roles(apps, schema_editor):
    CustomUser = apps.get_model("user", "CustomUser")
    for user in CustomUser.objects.all():
        if user.is_superuser:
            user.role = "super_admin"
        elif user.is_staff:
            user.role = "admin"
        elif getattr(user, "is_team_lead", False):
            user.role = "team_lead"
        else:
            user.role = "employee"
        user.custom_permissions = user.custom_permissions or []
        user.save(update_fields=["role", "custom_permissions"])


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0004_customuser_department_customuser_is_team_lead"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="role",
            field=models.CharField(
                choices=[
                    ("super_admin", "Super Admin"),
                    ("admin", "Admin"),
                    ("manager", "Manager"),
                    ("accountant", "Accountant"),
                    ("team_lead", "Team Lead"),
                    ("employee", "Employee"),
                ],
                default="employee",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="customuser",
            name="custom_permissions",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(backfill_roles, migrations.RunPython.noop),
    ]
