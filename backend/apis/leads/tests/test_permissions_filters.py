from django.test import TestCase

from apis.leads.models import Lead
from apis.leads.selectors import apply_lead_filters, lead_queryset_for
from apis.user.models import CustomUser


class LeadVisibilityAndFilterTests(TestCase):
    def setUp(self):
        self.manager = CustomUser.objects.create_user(
            username="manager",
            email="manager@example.com",
            fullname="Manager",
            role="manager",
        )
        self.employee = CustomUser.objects.create_user(
            username="employee",
            email="employee@example.com",
            fullname="Employee",
            role="employee",
        )
        self.other = CustomUser.objects.create_user(
            username="other",
            email="other@example.com",
            fullname="Other",
            role="employee",
        )
        self.own = Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Own",
            phone="9876543210",
            service="SEO",
            priority="HIGH",
            source="referral",
            assigned_to=self.employee,
            created_by=self.manager,
        )
        self.hidden = Lead.objects.create(
            lead_type="PRODUCT",
            customer_name="Hidden",
            phone="9876543211",
            product="CRM",
            priority="LOW",
            source="website",
            assigned_to=self.other,
            created_by=self.manager,
        )

    def test_own_and_all_visibility(self):
        self.assertEqual(list(lead_queryset_for(self.employee)), [self.own])
        self.assertEqual(set(lead_queryset_for(self.manager).values_list("id", flat=True)), {self.own.id, self.hidden.id})

    def test_filters_and_safe_ordering(self):
        queryset = apply_lead_filters(
            lead_queryset_for(self.manager),
            {"priority": "HIGH", "source": "referral", "ordering": "-created_at"},
        )
        self.assertEqual(list(queryset), [self.own])
        unsafe = apply_lead_filters(lead_queryset_for(self.manager), {"ordering": "customer__password"})
        self.assertEqual(unsafe.count(), 2)


class TeamLeadVisibilityTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.team_lead = CustomUser.objects.create_user(
            username="sales-lead",
            email="sales-lead@example.com",
            fullname="Sales Lead",
            role="team_lead",
            department="Sales",
            is_team_lead=True,
        )
        cls.sales_member = CustomUser.objects.create_user(
            username="sales-member",
            email="sales-member@example.com",
            fullname="Sales Member",
            role="employee",
            department="sales",
        )
        cls.delivery_member = CustomUser.objects.create_user(
            username="delivery-member",
            email="delivery-member@example.com",
            fullname="Delivery Member",
            role="employee",
            department="Delivery",
        )
        cls.all_viewer = CustomUser.objects.create_user(
            username="auditor",
            email="auditor@example.com",
            fullname="Auditor",
            role="employee",
            custom_permissions=["lead.view_all"],
        )
        cls.team_assigned = Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Team assigned",
            phone="9876500001",
            service="SEO",
            assigned_to=cls.sales_member,
            created_by=cls.delivery_member,
        )
        cls.team_created = Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Team created",
            phone="9876500002",
            service="SEO",
            assigned_to=cls.delivery_member,
            created_by=cls.sales_member,
        )
        cls.own = Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Team lead own",
            phone="9876500003",
            service="SEO",
            created_by=cls.team_lead,
        )
        cls.outside = Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Outside",
            phone="9876500004",
            service="SEO",
            assigned_to=cls.delivery_member,
            created_by=cls.delivery_member,
        )

    def test_team_lead_scope_includes_own_and_same_department_only(self):
        visible = set(lead_queryset_for(self.team_lead).values_list("id", flat=True))
        self.assertEqual(
            visible,
            {self.team_assigned.id, self.team_created.id, self.own.id},
        )

    def test_explicit_view_all_overrides_employee_own_scope(self):
        visible = set(lead_queryset_for(self.all_viewer).values_list("id", flat=True))
        self.assertEqual(
            visible,
            {self.team_assigned.id, self.team_created.id, self.own.id, self.outside.id},
        )
