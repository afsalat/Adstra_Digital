import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.invoice.models import Invoice

print("Checking Invoices...")
invoices = Invoice.objects.all()
for inv in invoices:
    print(f"Invoice: {inv.invoice_no}, Proposal: {inv.proposal}, Client: {inv.client}")
