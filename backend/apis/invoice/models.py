from django.db import models
from django.conf import settings
from apis.proposal.models import Client, Proposal, ProposalService

import datetime

class Invoice(models.Model):
    invoice_no = models.CharField(max_length=100, unique=True, null=True, blank=True)
    proposal = models.ForeignKey(Proposal, on_delete=models.SET_NULL, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_in_words = models.TextField(null=True, blank=True)
    reference = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('unpaid', 'Unpaid'), ('partially_paid', 'Partially Paid'), ('paid', 'Paid'), ('cancelled', 'Cancelled')],
        default='unpaid'
    )
    # Razorpay Payment Fields
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    
    # Financial breakdown fields
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    additional_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    is_proforma = models.BooleanField(default=False)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.invoice_no:
            self.invoice_no = self.generate_invoice_number(self.is_proforma)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{'Proforma' if self.is_proforma else 'Invoice'} #{self.invoice_no} - {self.client.name if self.client else 'N/A'}"

    @property
    def balance_due(self):
        # Calculate total paid from non-deleted transactions
        from apis.transactions.models import Transaction
        from decimal import Decimal
        total_paid = Transaction.objects.filter(
            invoice=self, 
            is_deleted=False
        ).aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
        
        # Ensure total_amount is also Decimal
        total = Decimal(str(self.total_amount or '0.00'))
        return max(Decimal('0.00'), total - total_paid)

    @classmethod
    def generate_invoice_number(cls, is_proforma=False):
        from apis.settings.models import CompanySettings
        settings_obj = CompanySettings.objects.first()

        # Get prefix and next number from settings
        if is_proforma:
            base_prefix = (settings_obj.proforma_prefix if settings_obj and settings_obj.proforma_prefix else "PI-AD-2026")
            min_number = settings_obj.proforma_next_number if settings_obj else 1
        else:
            base_prefix = (settings_obj.invoice_prefix if settings_obj and settings_obj.invoice_prefix else "INV-AD-2026")
            min_number = settings_obj.invoice_next_number if settings_obj else 1

        prefix = f"{base_prefix}-"
        last_invoice = cls.objects.filter(invoice_no__startswith=prefix).order_by('-id').first()

        if last_invoice and last_invoice.invoice_no:
            try:
                parts = last_invoice.invoice_no.split('-')
                last_number = int(parts[-1])
                new_number = max(last_number + 1, min_number)
            except (IndexError, ValueError):
                new_number = min_number
        else:
            new_number = min_number

        return f"{prefix}{str(new_number).zfill(4)}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.TextField(null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def save(self, *args, **kwargs):
        base_amount = (self.quantity or 0) * (self.rate or 0)
        gst_amount = base_amount * (self.gst or 0) / 100
        self.amount = base_amount + gst_amount
        super().save(*args, **kwargs)



def create_invoice_from_proposal(proposal):
    invoice = Invoice.objects.create(
        invoice_no=Invoice.generate_invoice_number(),
        proposal=proposal,
        client=proposal.client,
        total_amount=proposal.total_amount,
        total_in_words=proposal.total_in_words,
        notes=proposal.notes,
        created_by=proposal.created_by
    )

    services = ProposalService.objects.filter(proposal=proposal)
    for service in services:
        InvoiceItem.objects.create(
            invoice=invoice,
            description=service.description,
            quantity=service.quantity,
            rate=service.rate,
            gst=service.gst,
        )

    return invoice



