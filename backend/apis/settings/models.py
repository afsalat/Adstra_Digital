from django.db import models

class CompanySettings(models.Model):
    name = models.CharField(max_length=255, default="Adstra Digital")
    logo_text = models.CharField(max_length=255, default="Adstra Digital", blank=True)
    certification_text = models.CharField(max_length=255, default="ISO 9001:2015 & IAF Certified", blank=True)
    address = models.TextField(default="Husna Complex, 1st Floor, Nadakkavu, Kozhikode, Kerala - 673011")
    gstin = models.CharField(max_length=50, default="32CMJPK3035L1Z2")
    lut_no = models.CharField(max_length=100, default="AD320224004945V", blank=True)
    mobile = models.CharField(max_length=100, default="+91 974 477 9574 | 956 756 8185")
    email = models.EmailField(default="info.adstradigital@gmail.com")
    
    # Financial/Bank Details
    bank_name = models.CharField(max_length=255, default="HDFC Bank")
    account_no = models.CharField(max_length=100, default="50200091927202")
    ifsc = models.CharField(max_length=50, default="HDFC0001595")
    branch = models.CharField(max_length=255, default="Sulthan Bathery")
    
    # Invoice Number Prefixes (include year if desired, e.g. INV-AD-2026)
    invoice_prefix = models.CharField(max_length=50, default="INV-AD-2026", blank=True)
    proforma_prefix = models.CharField(max_length=50, default="PI-AD-2026", blank=True)
    invoice_next_number = models.IntegerField(default=1)
    proforma_next_number = models.IntegerField(default=1)

    # Default Terms
    terms_conditions = models.TextField(default="1. Goods once sold will not be taken back.\n2. Payment should be made by cash or cheque in favor of Adstra Digital.\n3. Interest @ 18% p.a. will be charged if payment is not made within the due date.")

    def __str__(self):
        return "Company Settings"

    class Meta:
        verbose_name = "Company Settings"
        verbose_name_plural = "Company Settings"
