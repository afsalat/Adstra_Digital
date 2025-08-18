from django.db import models
from backend import settings
from apis.invoice.models import Invoice, Client


class Transaction(models.Model):
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='transactions',
        null=True,
        blank=True,
        help_text="Related invoice (optional, mainly for receipts)"
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    purpose = models.TextField(null=True, blank=True, help_text="Purpose/description")
    payment_mode = models.CharField(
        max_length=50,
        choices=[
            ('cash', 'Cash'),
            ('bank_transfer', 'Bank Transfer'),
            ('upi', 'UPI'),
            ('cheque', 'Cheque'),
            ('other', 'Other'),
        ]
    )
    reference_no = models.CharField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who received or paid"
    )
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.get_transaction_type_display()} ₹{self.amount} for {self.client.name}"
