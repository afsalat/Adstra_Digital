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
