from django.db import migrations, models
from django.db.models.functions import Lower


class Migration(migrations.Migration):

    dependencies = [
        ("leads", "0005_salesteamconfig"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="targetcustomer",
            constraint=models.UniqueConstraint(
                fields=("phone",),
                condition=~models.Q(phone=""),
                name="target_unique_nonblank_phone",
            ),
        ),
        migrations.AddConstraint(
            model_name="targetcustomer",
            constraint=models.UniqueConstraint(
                fields=("whatsapp_number",),
                condition=~models.Q(whatsapp_number=""),
                name="target_unique_nonblank_whatsapp",
            ),
        ),
        migrations.AddConstraint(
            model_name="targetcustomer",
            constraint=models.UniqueConstraint(
                Lower("email"),
                condition=~models.Q(email=""),
                name="target_unique_nonblank_email_ci",
            ),
        ),
        migrations.AddConstraint(
            model_name="lead",
            constraint=models.UniqueConstraint(
                fields=("phone",),
                condition=~models.Q(phone=""),
                name="lead_unique_nonblank_phone",
            ),
        ),
        migrations.AddConstraint(
            model_name="lead",
            constraint=models.UniqueConstraint(
                fields=("whatsapp_number",),
                condition=~models.Q(whatsapp_number=""),
                name="lead_unique_nonblank_whatsapp",
            ),
        ),
        migrations.AddConstraint(
            model_name="lead",
            constraint=models.UniqueConstraint(
                Lower("email"),
                condition=~models.Q(email=""),
                name="lead_unique_nonblank_email_ci",
            ),
        ),
    ]
