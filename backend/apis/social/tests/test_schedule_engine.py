from datetime import date, datetime, timedelta, timezone as dt_timezone
from types import SimpleNamespace

from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from apis.social.models import (
    ContentPlan,
    KeyDate,
    PostApprovalHistory,
    ProductionVendor,
    SocialClientProfile,
    SocialPost,
)
from apis.social.schedule_engine import ScheduleContext, build_schedule
from apis.user.models import CustomUser

STAGE_ORDER = ['script', 'script_approval', 'designing', 'team_review', 'client_review']


class ScheduleEngineTests(TestCase):
    """Working-day deadlines: holidays, learned durations, late-plan compression and shoot constraints."""

    def setUp(self):
        cache.clear()
        self.client_profile = SocialClientProfile.objects.create(name='Coastal Cafe', slug='coastal-cafe')

    def _schedule(self, publish, anchor=date(2027, 1, 4), post_type='reel', method='in_house', **kw):
        return build_schedule(ScheduleContext(self.client_profile.id), post_type=post_type, method=method,
                              publish=publish, anchor=anchor, **kw)

    def assertInOrder(self, deadlines):
        dates = [deadlines[s] for s in STAGE_ORDER]
        self.assertEqual(dates, sorted(dates))

    def test_deadlines_skip_sundays_and_office_holidays(self):
        KeyDate.objects.create(date=date(2027, 3, 20), title='Office offsite', office_closed=True)
        s = self._schedule(date(2027, 3, 22))  # Monday
        self.assertEqual(s['deadlines']['client_review'], date(2027, 3, 19))  # Sat 20 is closed, Sun 21 off
        for d in s['deadlines'].values():
            if d != date(2027, 3, 22):
                self.assertNotEqual(d.weekday(), 6)
                self.assertNotEqual(d, date(2027, 3, 20))
        self.assertInOrder(s['deadlines'])

    def test_learns_stage_durations_from_history(self):
        start = datetime(2026, 9, 7, 9, 0, tzinfo=dt_timezone.utc)  # Monday
        for i in range(5):
            post = SocialPost.objects.create(client_profile=self.client_profile, post_type='image', status='team_review')
            for action, src, dst, at in [
                ('created', '', '', start),
                ('Submitted', 'script', 'script_approval', start + timedelta(days=1)),
                ('Approved', 'script_approval', 'designing', start + timedelta(days=1, hours=12)),
                ('Design done', 'designing', 'team_review', start + timedelta(days=7, hours=12)),  # 5 working days
            ]:
                h = PostApprovalHistory.objects.create(post=post, action=action, actor_name='x', from_stage=src, to_stage=dst)
                PostApprovalHistory.objects.filter(id=h.id).update(timestamp=at)
        ctx = ScheduleContext(self.client_profile.id)
        days, source, detail = ctx.stage_days('designing', 'image', 'in_house')
        self.assertEqual(source, 'learned')
        self.assertEqual(days, 3)  # 5 samples blend the learned 5 days with the 1-day default
        self.assertIn('5 past posts', detail)

    def test_planned_late_compresses_then_flags_at_risk(self):
        anchor = date(2027, 3, 1)  # Monday
        tight = self._schedule(date(2027, 3, 8), anchor=anchor)
        self.assertEqual(tight['status'], 'tight')
        self.assertGreaterEqual(tight['deadlines']['script'], anchor)
        self.assertLessEqual(tight['deadlines']['client_review'], date(2027, 3, 6))
        self.assertInOrder(tight['deadlines'])
        self.assertGreater(tight['squeeze_pct'], 0)

        risky = self._schedule(date(2027, 3, 3), anchor=anchor)
        self.assertEqual(risky['status'], 'at_risk')
        self.assertTrue(risky['notes'])

    def test_shoot_day_constrains_script_and_edit(self):
        shoot = SimpleNamespace(date=date(2027, 3, 10))
        s = self._schedule(date(2027, 3, 27), method='shoot', shoot=shoot)
        self.assertLessEqual(s['deadlines']['script_approval'], date(2027, 3, 9))
        self.assertGreater(s['deadlines']['designing'], shoot.date)
        late = self._schedule(date(2027, 3, 27), method='shoot', shoot=SimpleNamespace(date=date(2027, 3, 25)))
        self.assertEqual(late['status'], 'at_risk')

    def test_vendor_turnaround_drives_outsourced_design_time(self):
        vendor = ProductionVendor.objects.create(name='Anchor Team', turnaround_days=7)
        days, source, _ = ScheduleContext(self.client_profile.id).stage_days('designing', 'video', 'outsourced', vendor)
        self.assertEqual((days, source), (7, 'vendor'))

    def test_plan_override_and_api_endpoints(self):
        user = CustomUser.objects.create_user('planner', 'planner@example.com', 'pw')
        api = APIClient()
        api.force_authenticate(user)
        plan = ContentPlan.objects.create(client_profile=self.client_profile, month=date(2027, 3, 1),
                                          lead_days={'overrides': {'designing': 6}, 'workdays': [0, 1, 2, 3, 4]})
        res = api.post('/api/social/plan-items/preview_schedule/',
                       {'plan': plan.id, 'post_type': 'image', 'planned_date': '2027-03-26'}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        design = next(b for b in res.data['schedule']['breakdown'] if b['stage'] == 'designing')
        self.assertEqual((design['days'], design['source']), (6, 'override'))
        self.assertTrue(all(date.fromisoformat(d).weekday() < 5 for k, d in res.data['deadlines'].items() if k != 'publish'))
        res = api.get(f'/api/social/plans/{plan.id}/schedule_insights/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['working_days_in_month'], 23)
