from datetime import datetime, timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apis.leads.models import Lead, LeadActivity, LeadCall, LeadFollowUp, TargetCustomer, TargetCustomerList
from apis.user.models import CustomUser


class LeadMyProfileAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.employee = CustomUser.objects.create_user(
            username="profile-user", email="profile-user@example.com",
            fullname="Profile User", role="employee",
            custom_permissions=["lead.view_my_profile", "lead.follow_up", "lead.edit"],
        )
        cls.other = CustomUser.objects.create_user(
            username="profile-other", email="profile-other@example.com",
            fullname="Profile Other", role="employee",
        )
        cls.manager = CustomUser.objects.create_user(
            username="profile-manager", email="profile-manager@example.com",
            fullname="Profile Manager", role="manager",
            custom_permissions=["lead.view_all", "lead.view_my_profile"],
        )
        cls.assigned = Lead.objects.create(
            lead_type="SERVICE", customer_name="Assigned to me", phone="9876000001",
            service="SEO", assigned_to=cls.employee, created_by=cls.other,
        )
        cls.assigned._save_workflow_stage("ASSIGNED")
        cls.created = Lead.objects.create(
            lead_type="SERVICE", customer_name="Created by me", phone="9876000002",
            service="CRM", assigned_to=cls.other, created_by=cls.employee,
        )
        cls.hidden = Lead.objects.create(
            lead_type="SERVICE", customer_name="Other user lead", phone="9876000003",
            service="ERP", assigned_to=cls.other, created_by=cls.other,
        )
        LeadActivity.objects.create(
            lead=cls.assigned, actor=cls.employee, activity_type="EMAIL", title="My email",
        )
        LeadActivity.objects.create(
            lead=cls.assigned, actor=cls.other, activity_type="EMAIL", title="Another user's email",
        )
        cls.own_target_list = TargetCustomerList.objects.create(
            name="My targets", created_by=cls.employee,
        )
        cls.own_target = TargetCustomer.objects.create(
            customer_list=cls.own_target_list,
            customer_name="My target contact",
            phone="9876000010",
            assigned_to=cls.employee,
        )
        hidden_target_list = TargetCustomerList.objects.create(
            name="Hidden targets", created_by=cls.other,
        )
        TargetCustomer.objects.create(
            customer_list=hidden_target_list,
            customer_name="Hidden target contact",
            phone="9876000011",
            assigned_to=cls.other,
        )

    def setUp(self):
        self.client = APIClient()

    def test_permission_is_required(self):
        self.client.force_authenticate(self.other)
        response = self.client.get("/api/lead-my-profile/")
        self.assertEqual(response.status_code, 403)

    def test_profile_contains_only_authenticated_users_data(self):
        self.client.force_authenticate(self.employee)
        response = self.client.get("/api/lead-my-profile/?page_size=10")
        self.assertEqual(response.status_code, 200, response.data)
        ids = {lead["id"] for lead in response.data["leads"]["results"]}
        self.assertEqual(ids, {self.assigned.id})
        self.assertEqual(response.data["leads"]["count"], 1)
        self.assertEqual(response.data["overview"]["emails_sent"], 1)
        self.assertEqual([item["title"] for item in response.data["recent_activity"]], ["My email"])
        self.assertEqual(
            {lead["id"] for lead in response.data["telecalling_leads"]},
            {self.assigned.id},
        )
        self.assertEqual(
            {item["id"] for item in response.data["target_lists"]},
            {self.own_target_list.id},
        )
        self.assertEqual(
            response.data["target_lists"][0]["contacts"][0]["id"],
            self.own_target.id,
        )

    def test_view_all_does_not_widen_profile_scope(self):
        manager_lead = Lead.objects.create(
            lead_type="SERVICE", customer_name="Manager own", phone="9876000004",
            service="Consulting", created_by=self.manager,
        )
        self.client.force_authenticate(self.manager)
        response = self.client.get("/api/lead-my-profile/")
        self.assertEqual(response.status_code, 200, response.data)
        ids = {lead["id"] for lead in response.data["leads"]["results"]}
        self.assertEqual(ids, {manager_lead.id})

    def test_created_follow_up_and_task_appear_in_work_queue(self):
        self.client.force_authenticate(self.employee)
        due_at = timezone.now() + timedelta(days=1)

        follow_up = self.client.post(
            f"/api/leads/{self.assigned.id}/follow-ups/",
            {
                "follow_up_type": "PHONE",
                "scheduled_at": due_at.isoformat(),
                "purpose": "Call tomorrow",
            },
            format="json",
        )
        self.assertEqual(follow_up.status_code, 201, follow_up.data)
        task = self.client.post(
            f"/api/leads/{self.assigned.id}/tasks/",
            {
                "title": "Prepare call notes",
                "task_type": "FOLLOW_UP",
                "priority": "MEDIUM",
                "due_at": due_at.isoformat(),
            },
            format="json",
        )
        self.assertEqual(task.status_code, 201, task.data)

        profile = self.client.get("/api/lead-my-profile/?page_size=10")
        self.assertEqual(profile.status_code, 200, profile.data)
        self.assertEqual([item["purpose"] for item in profile.data["follow_ups"]], ["Call tomorrow"])
        self.assertEqual([item["title"] for item in profile.data["tasks"]], ["Prepare call notes"])

    def test_performance_report_is_self_scoped_and_aggregated(self):
        LeadCall.objects.create(
            lead=self.assigned, caller=self.employee, started_at=timezone.now(),
            outcome="CONNECTED",
        )
        LeadCall.objects.create(
            lead=self.hidden, caller=self.other, started_at=timezone.now(),
            outcome="BUSY",
        )
        self.client.force_authenticate(self.employee)
        response = self.client.get("/api/lead-my-profile/")
        self.assertEqual(response.status_code, 200, response.data)
        report = response.data["performance_report"]
        self.assertEqual(report["summary"]["total_leads"], 1)
        self.assertEqual(report["summary"]["assigned_leads"], 1)
        self.assertEqual(report["summary"]["created_leads"], 0)
        self.assertEqual(report["engagement"]["calls"], 1)
        self.assertEqual(report["call_outcomes"], [{"outcome": "CONNECTED", "count": 1}])
        self.assertEqual(report["activity_breakdown"], [{"activity_type": "EMAIL", "count": 1}])

    def test_performance_daily_activity_is_zero_filled_for_local_30_day_period(self):
        old_activity = LeadActivity.objects.create(
            lead=self.assigned, actor=self.employee, activity_type="CALL", title="Old call",
        )
        LeadActivity.objects.filter(pk=old_activity.pk).update(created_at=timezone.now() - timedelta(days=40))
        self.client.force_authenticate(self.employee)
        report = self.client.get("/api/lead-my-profile/").data["performance_report"]
        rows = report["daily_activity"]
        self.assertEqual(len(rows), 30)
        self.assertEqual(str(rows[0]["date"]), str(report["period"]["start"]))
        self.assertEqual(str(rows[-1]["date"]), str(report["period"]["end"]))
        self.assertEqual(sum(row["emails"] for row in rows), 1)
        self.assertEqual(sum(row["calls"] for row in rows), 0)

    def test_performance_report_filters_company_stage_activity_and_date(self):
        LeadActivity.objects.create(
            lead=self.created, actor=self.employee, activity_type="CALL", title="Created lead call",
        )
        self.client.force_authenticate(self.employee)
        today = timezone.localdate()
        response = self.client.get(
            "/api/lead-my-profile/",
            {
                "report_start": str(today), "report_end": str(today),
                "report_company": "Assigned to me", "report_stage": "ASSIGNED",
                "report_activity_type": "EMAIL",
            },
        )
        self.assertEqual(response.status_code, 200, response.data)
        report = response.data["performance_report"]
        self.assertEqual(report["summary"]["total_leads"], 1)
        self.assertEqual([item["title"] for item in report["activities"]], ["My email"])
        self.assertEqual(report["activity_breakdown"], [{"activity_type": "EMAIL", "count": 1}])
        self.assertEqual(report["applied_filters"]["company"], "Assigned to me")
        self.assertEqual(report["applied_filters"]["stage"], "ASSIGNED")
        self.assertEqual(report["applied_filters"]["activity_type"], "EMAIL")
        self.assertEqual([row["id"] for row in report["leads"]], [self.assigned.id])
        self.assertEqual(sum(row["count"] for row in report["stage_distribution"]), 1)
        self.assertEqual(sum(row["count"] for row in report["priority_distribution"]), 1)
        self.assertEqual(sum(row["count"] for row in report["source_distribution"]), 1)
        self.assertEqual(report["engagement"]["calls"], 0)
        self.assertEqual(report["engagement"]["meetings"], 0)

    def test_performance_report_date_range_constrains_every_lead_surface(self):
        old_activity = LeadActivity.objects.create(
            lead=self.created, actor=self.employee, activity_type="NOTE", title="Outside period",
        )
        LeadActivity.objects.filter(pk=old_activity.pk).update(created_at=timezone.now() - timedelta(days=60))
        self.assigned.target_customer = self.own_target
        self.assigned.save(update_fields=["target_customer"])
        self.client.force_authenticate(self.employee)
        today = timezone.localdate()
        response = self.client.get(
            "/api/lead-my-profile/",
            {"report_start": str(today), "report_end": str(today)},
        )
        self.assertEqual(response.status_code, 200, response.data)
        report = response.data["performance_report"]
        self.assertEqual(report["summary"]["total_leads"], 1)
        self.assertEqual([row["id"] for row in report["leads"]], [self.assigned.id])
        self.assertEqual(sum(row["count"] for row in report["stage_distribution"]), 1)
        self.assertEqual(sum(row["count"] for row in report["priority_distribution"]), 1)
        self.assertEqual(sum(row["count"] for row in report["source_distribution"]), 1)
        self.assertEqual(report["targets"], {"total_lists": 1, "total_contacts": 1, "do_not_call": 0})
        self.assertNotIn("Outside period", {row["title"] for row in report["activities"]})

    def test_performance_report_filters_cannot_widen_self_scope(self):
        self.client.force_authenticate(self.employee)
        response = self.client.get("/api/lead-my-profile/", {"report_company": "Other user lead"})
        self.assertEqual(response.status_code, 200, response.data)
        report = response.data["performance_report"]
        self.assertEqual(report["summary"]["total_leads"], 0)
        self.assertEqual(report["leads"], [])
        self.assertEqual(report["activities"], [])

    def test_performance_report_rejects_invalid_dates_and_excessive_window(self):
        self.client.force_authenticate(self.employee)
        invalid = self.client.get("/api/lead-my-profile/?report_start=10-08-2026")
        self.assertEqual(invalid.status_code, 400)
        self.assertIn("YYYY-MM-DD", invalid.data["error"])
        reversed_range = self.client.get("/api/lead-my-profile/?report_start=2026-08-10&report_end=2026-08-09")
        self.assertEqual(reversed_range.status_code, 400)
        self.assertIn("on or before", reversed_range.data["error"])
        too_long = self.client.get("/api/lead-my-profile/?report_start=2025-01-01&report_end=2026-08-10")
        self.assertEqual(too_long.status_code, 400)
        self.assertIn("366 days", too_long.data["error"])

    def test_performance_report_payload_contains_complete_export_data(self):
        LeadActivity.objects.create(
            lead=self.assigned, actor=self.employee, activity_type="NOTE", title="Export detail",
            description="Included in the complete report payload",
        )
        self.client.force_authenticate(self.employee)
        report = self.client.get("/api/lead-my-profile/").data["performance_report"]
        self.assertEqual({row["id"] for row in report["leads"]}, {self.assigned.id})
        self.assertEqual({row["title"] for row in report["activities"]}, {"My email", "Export detail"})
        self.assertIn("companies", report["filter_options"])
        self.assertIn("stages", report["filter_options"])
        self.assertIn("activity_types", report["filter_options"])
        self.assertEqual(len(report["daily_activity"]), 30)

    def test_telecalling_schedule_is_self_scoped_distinct_and_date_filtered(self):
        selected = timezone.localdate() + timedelta(days=1)
        selected_at = timezone.make_aware(datetime.combine(selected, datetime.min.time())) + timedelta(hours=10)
        for purpose in ("Primary call", "Duplicate reminder"):
            LeadFollowUp.objects.create(
                lead=self.assigned, assigned_to=self.employee, created_by=self.employee,
                follow_up_type="PHONE", scheduled_at=selected_at, purpose=purpose,
            )
        LeadFollowUp.objects.create(
            lead=self.hidden, assigned_to=self.other, created_by=self.other,
            follow_up_type="PHONE", scheduled_at=selected_at, purpose="Hidden call",
        )
        self.client.force_authenticate(self.employee)
        response = self.client.get(f"/api/lead-my-profile/?schedule_date={selected}")
        self.assertEqual(response.status_code, 200, response.data)
        schedule = response.data["telecalling_schedule"]
        self.assertEqual(str(schedule["date"]), str(selected))
        self.assertEqual(schedule["scheduled_lead_ids"], [self.assigned.id])
        self.assertEqual(len(schedule["scheduled_items"]), 1)
        self.assertNotIn(self.hidden.id, schedule["scheduled_lead_ids"])

    def test_telecalling_schedule_rejects_invalid_date(self):
        self.client.force_authenticate(self.employee)
        response = self.client.get("/api/lead-my-profile/?schedule_date=10-08-2026")
        self.assertEqual(response.status_code, 400)
        self.assertIn("YYYY-MM-DD", response.data["error"])

    def test_telecalling_schedule_reports_completed_overdue_and_unscheduled(self):
        overdue_at = timezone.now() - timedelta(hours=2)
        LeadFollowUp.objects.create(
            lead=self.assigned, assigned_to=self.employee, created_by=self.employee,
            follow_up_type="PHONE", scheduled_at=overdue_at, purpose="Overdue call", status="OVERDUE",
        )
        LeadCall.objects.create(
            lead=self.assigned, caller=self.employee, started_at=timezone.now(), outcome="CONNECTED",
        )
        self.client.force_authenticate(self.employee)
        schedule = self.client.get("/api/lead-my-profile/").data["telecalling_schedule"]
        self.assertIn(self.assigned.id, schedule["overdue_lead_ids"])
        self.assertIn(self.assigned.id, schedule["completed_lead_ids"])
        self.assertNotIn(self.created.id, schedule["unscheduled_lead_ids"])
        self.assertNotIn(self.assigned.id, schedule["unscheduled_lead_ids"])

    def test_overdue_item_can_be_rescheduled_without_creating_a_duplicate(self):
        overdue = LeadFollowUp.objects.create(
            lead=self.assigned, assigned_to=self.employee, created_by=self.employee,
            follow_up_type="PHONE", scheduled_at=timezone.now() - timedelta(hours=3),
            purpose="Missed call", notes="Ask about budget", status="OVERDUE",
        )
        self.client.force_authenticate(self.employee)
        current = self.client.get("/api/lead-my-profile/").data["telecalling_schedule"]
        active_item = next(item for item in current["active_phone_items"] if item["lead_id"] == self.assigned.id)
        self.assertEqual(active_item["id"], overdue.id)

        selected = timezone.localdate() + timedelta(days=1)
        new_time = timezone.make_aware(datetime.combine(selected, datetime.min.time())) + timedelta(hours=11)
        updated = self.client.post(
            f"/api/leads/{self.assigned.id}/follow-ups/",
            {
                "id": overdue.id, "follow_up_type": "PHONE", "status": "SCHEDULED",
                "scheduled_at": new_time.isoformat(), "purpose": "Rescheduled call",
                "notes": "Ask about budget",
            },
            format="json",
        )
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertEqual(LeadFollowUp.objects.filter(lead=self.assigned, follow_up_type="PHONE").count(), 1)
        refreshed = self.client.get(f"/api/lead-my-profile/?schedule_date={selected}").data["telecalling_schedule"]
        self.assertIn(self.assigned.id, refreshed["scheduled_lead_ids"])
        self.assertNotIn(self.assigned.id, refreshed["overdue_lead_ids"])
        self.assertEqual(refreshed["scheduled_items"][0]["id"], overdue.id)
