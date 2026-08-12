from datetime import date

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class LegacyLeadMigrationTests(TransactionTestCase):
    migrate_from = ("leads", "0001_initial")
    migrate_to = ("leads", "0002_targetcustomerlist_remove_lead_contact_name_and_more")

    def setUp(self):
        super().setUp()
        self.executor = MigrationExecutor(connection)
        self.executor.migrate([self.migrate_from])
        old_apps = self.executor.loader.project_state([self.migrate_from]).apps
        LegacyLead = old_apps.get_model("leads", "Lead")
        self.legacy_id = LegacyLead.objects.create(
            company_name=None,
            contact_name="Legacy Contact",
            email=None,
            phone=None,
            service_interest=None,
            source="referral",
            status="contacted",
            priority="high",
            expected_value="45000.00",
            next_follow_up=date(2026, 8, 10),
            notes="Legacy requirement notes",
        ).id
        self.executor = MigrationExecutor(connection)
        self.executor.migrate([self.migrate_to])
        self.apps = self.executor.loader.project_state([self.migrate_to]).apps

    def tearDown(self):
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
        super().tearDown()

    def test_legacy_fields_and_stage_are_preserved(self):
        Lead = self.apps.get_model("leads", "Lead")
        lead = Lead.objects.get(pk=self.legacy_id)
        self.assertEqual(lead.contact_person, "Legacy Contact")
        self.assertEqual(lead.customer_name, "Legacy Contact")
        self.assertEqual(lead.current_stage, "CONTACT_ATTEMPTED")
        self.assertEqual(lead.priority, "HIGH")
        self.assertEqual(str(lead.estimated_value), "45000.00")
        self.assertEqual(lead.service, "Legacy / unspecified service")
        self.assertEqual(lead.requirement_summary, "Legacy requirement notes")
        self.assertEqual(lead.next_follow_up_at.hour, 3)
        self.assertEqual(lead.next_follow_up_at.minute, 30)
        self.assertTrue(lead.lead_number.startswith("LD-"))

