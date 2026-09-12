from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leads", "0007_targetcustomerlist_scope_date"),
    ]

    operations = [
        migrations.AddField(
            model_name="leadmeeting",
            name="map_link",
            field=models.URLField(blank=True),
        ),
    ]
