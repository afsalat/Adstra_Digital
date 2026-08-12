from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("leads", "0006_contact_identity_constraints"),
    ]

    operations = [
        migrations.AddField(
            model_name="targetcustomerlist",
            name="scope_date",
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
    ]
