from django.db import models
from django.conf import settings

class Client(models.Model):
    company_name = models.CharField(max_length=300, null=True, blank=True)
    name = models.CharField(max_length=255)
    address = models.TextField(null=True, blank=True)
    gstin = models.CharField(max_length=50, null=True, blank=True)
    lut = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    contact = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.name

class Proposal(models.Model):
    proposal_no = models.CharField(max_length=50, unique=True)
    date = models.DateField(auto_now_add=True)
    reference = models.CharField(max_length=255, null=True, blank=True)
    company_name = models.CharField(max_length=300, null=True, blank=True)
    purpose = models.CharField(max_length=255, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_in_words = models.TextField(null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('sent', 'Sent'), ('approved', 'Approved')],
        default='draft',
        null=True,
        blank=True
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Proposal #{self.proposal_no} - {self.client.name if self.client else 'Unknown'}"


class ProposalRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]

    lead = models.OneToOneField(
        'leads.Lead',
        on_delete=models.CASCADE,
        related_name='proposal_request',
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='proposal_requests',
    )
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']

    def __str__(self):
        return f"Proposal request for {self.lead.lead_number}"

class ProposalSection(models.Model):
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=50, null=True, blank=True)
    alignment = models.CharField(max_length=50, null=True, blank=True)
    content = models.TextField(null=True, blank=True)

class ProposalService(models.Model):
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='services')
    description = models.TextField(null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Client)
def sync_client_to_social_profile(sender, instance, **kwargs):
    try:
        from apis.social.services import sync_proposal_clients
        sync_proposal_clients()
    except Exception:
        pass
