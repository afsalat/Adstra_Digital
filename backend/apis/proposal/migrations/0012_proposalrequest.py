from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('leads', '0008_leadmeeting_map_link'),
        ('proposal', '0011_alter_proposalsection_proposal'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ProposalRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notes', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('rejected', 'Rejected')], db_index=True, default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('lead', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='proposal_request', to='leads.lead')),
                ('requested_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='proposal_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-updated_at', '-id']},
        ),
    ]
