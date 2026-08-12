from django.test import TestCase

from apis.leads.import_export import export_leads_csv, import_target_customers
from apis.leads.models import Lead, TargetCustomerList
from apis.user.models import CustomUser


class LeadImportExportTests(TestCase):
    def setUp(self):
        self.manager = CustomUser.objects.create_user(
            username="manager",
            email="manager@example.com",
            fullname="Manager",
            role="manager",
        )
        self.target_list = TargetCustomerList.objects.create(name="Campaign", created_by=self.manager)

    def test_csv_import_skips_duplicates_and_preserves_do_not_call(self):
        content = (
            "customer_name,phone,email,do_not_call\r\n"
            "First,9876543210,FIRST@EXAMPLE.COM,true\r\n"
            "Duplicate,+91 98765 43210,first@example.com,false\r\n"
        ).encode("utf-8")
        result = import_target_customers(content, customer_list=self.target_list, actor=self.manager)
        self.assertEqual(result["created_count"], 1)
        self.assertEqual(result["duplicate_count"], 1)
        customer = self.target_list.customers.get()
        self.assertTrue(customer.do_not_call)
        self.assertEqual(customer.email, "first@example.com")

    def test_csv_import_allows_optional_contact_info(self):
        content = (
            "customer_name,company_name\r\n"
            "Kozhikode Store,Adstra Digital Ltd\r\n"
        ).encode("utf-8")
        result = import_target_customers(content, customer_list=self.target_list, actor=self.manager)
        self.assertEqual(result["created_count"], 1)
        self.assertEqual(result["error_count"], 0)
        customer = self.target_list.customers.get()
        self.assertEqual(customer.customer_name, "Kozhikode Store")
        self.assertEqual(customer.phone, "")
        self.assertEqual(customer.email, "")

    def test_export_escapes_spreadsheet_formulas(self):
        Lead.objects.create(
            lead_type="SERVICE",
            customer_name="=HYPERLINK(\"bad\")",
            phone="9876543210",
            service="SEO",
            created_by=self.manager,
        )
        csv_text = export_leads_csv(Lead.objects.all(), actor=self.manager)
        self.assertIn("'=HYPERLINK", csv_text)

    def test_export_leads_excel_generates_valid_workbook(self):
        from apis.leads.import_export import export_leads_excel
        Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Test Customer",
            phone="9876543210",
            service="ERP",
            created_by=self.manager,
        )
        excel_bytes = export_leads_excel(Lead.objects.all(), actor=self.manager)
        self.assertTrue(len(excel_bytes) > 1000)
        self.assertTrue(excel_bytes.startswith(b"PK"))
