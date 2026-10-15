from datetime import date

from django.test import TestCase
from rest_framework.test import APIClient

from apis.social.models import ContentPlan, ContentPlanItem, SocialClientProfile, SocialPost
from apis.user.models import CustomUser


class ContentPlanningTests(TestCase):
    """Monthly plan: deliverables -> slots -> client sign-off -> scripts -> month close (carry-over or billing)."""

    def setUp(self):
        self.user = CustomUser.objects.create_user('planner', 'planner@example.com', 'pw', fullname='Plan Lead')
        self.api = APIClient()
        self.api.force_authenticate(self.user)
        self.carry = SocialClientProfile.objects.create(name='Coastal Cafe', slug='coastal-cafe', carry_over_policy='carry_over')
        self.billing = SocialClientProfile.objects.create(name='Hill Homes', slug='hill-homes', carry_over_policy='adjust_billing')

    def _plan(self, client, month='2027-03', quotas=None):
        res = self.api.post('/api/social/plans/', {'client_profile': client.id, 'month': month}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        plan_id = res.data['id']
        res = self.api.post(f'/api/social/plans/{plan_id}/set_quotas/', {'quotas': quotas or [
            {'post_type': 'reel', 'quantity': 4, 'unit_price': 2000},
            {'post_type': 'image', 'quantity': 10, 'unit_price': 500},
        ]}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        return plan_id

    def _deliver(self, plan_id, post_type, n):
        for item in ContentPlanItem.objects.filter(plan_id=plan_id, post_type=post_type)[:n]:
            self.api.post(f'/api/social/plan-items/{item.id}/start_script/', {}, format='json')
            item.refresh_from_db()
            item.post.status = 'published'
            item.post.save()

    def test_generate_slots_spreads_quota_and_tags_pillars(self):
        plan_id = self._plan(self.carry)
        res = self.api.post(f'/api/social/plans/{plan_id}/generate_slots/', {}, format='json')
        self.assertEqual(res.data['created_count'], 14)
        reel_dates = [i['planned_date'] for i in res.data['items'] if i['post_type'] == 'reel']
        self.assertEqual(len(set(reel_dates)), 4)
        self.assertTrue(all(i['pillar'] for i in res.data['items']))
        # Running it again only fills gaps
        res = self.api.post(f'/api/social/plans/{plan_id}/generate_slots/', {}, format='json')
        self.assertEqual(res.data['created_count'], 0)

    def test_start_script_creates_post_in_script_stage(self):
        plan_id = self._plan(self.carry)
        item = ContentPlanItem.objects.create(plan_id=plan_id, post_type='reel', title='Barista tips', planned_date=date(2027, 3, 20))
        res = self.api.post(f'/api/social/plan-items/{item.id}/start_script/', {'tz_offset': -330}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        post = SocialPost.objects.get(id=res.data['created_post_id'])
        self.assertEqual(post.status, 'script')
        self.assertEqual(post.title, 'Barista tips')
        self.assertEqual(post.scheduled_at.isoformat(), '2027-03-20T13:30:00+00:00')  # 19:00 IST
        self.assertEqual(res.data['stage'], 'script')
        # Publish Sat 20 Mar: client OK Fri 19 (1-day buffer), then 2 + 1 + 3 + 1 working days back
        self.assertEqual(res.data['deadlines']['client_review'], '2027-03-19')
        self.assertEqual(res.data['deadlines']['designing'], '2027-03-16')
        self.assertEqual(res.data['deadlines']['script'], '2027-03-11')
        self.assertEqual(res.data['schedule']['status'], 'ok')
        res = self.api.post(f'/api/social/plan-items/{item.id}/start_script/', {}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_client_signoff_via_public_link(self):
        plan_id = self._plan(self.carry)
        self.api.post(f'/api/social/plans/{plan_id}/generate_slots/', {}, format='json')
        self.api.post(f'/api/social/plans/{plan_id}/send_to_client/')
        token = ContentPlan.objects.get(id=plan_id).client_approval_token
        anon = APIClient()
        res = anon.get(f'/api/social/plan-review/{token}/')
        self.assertEqual(len(res.data['items']), 14)
        res = anon.post(f'/api/social/plan-review/{token}/', {'action': 'request_changes', 'notes': 'Only 3 reels please'}, format='json')
        self.assertEqual(res.data['status'], 'changes_requested')
        res = anon.post(f'/api/social/plan-review/{token}/', {'action': 'approve'}, format='json')
        self.assertEqual(res.status_code, 409)

    def test_close_month_carries_shortfall_to_next_month(self):
        plan_id = self._plan(self.carry)
        self.api.post(f'/api/social/plans/{plan_id}/generate_slots/', {}, format='json')
        self._deliver(plan_id, 'reel', 3)
        self._deliver(plan_id, 'image', 10)
        res = self.api.post(f'/api/social/plans/{plan_id}/close_month/')
        self.assertEqual(res.data['status'], 'closed')
        self.assertEqual(res.data['close_summary']['billing']['deduction'], '0')
        nxt = ContentPlan.objects.get(client_profile=self.carry, month=date(2027, 4, 1))
        reel = nxt.quotas.get(post_type='reel')
        self.assertEqual((reel.quantity, reel.carried_in, reel.target), (4, 1, 5))
        self.assertEqual(nxt.items.filter(is_carry_over=True).count(), 1)

    def test_close_month_reduces_bill_without_carry_over(self):
        plan_id = self._plan(self.billing)
        self.api.post(f'/api/social/plans/{plan_id}/generate_slots/', {}, format='json')
        self._deliver(plan_id, 'reel', 3)
        self._deliver(plan_id, 'image', 10)
        res = self.api.post(f'/api/social/plans/{plan_id}/close_month/')
        self.assertEqual(res.data['close_summary']['billing']['deduction'], '2000.00')
        self.assertEqual(res.data['close_summary']['dropped_items'], 1)
        self.assertFalse(ContentPlan.objects.filter(client_profile=self.billing, month=date(2027, 4, 1)).exists())

    def test_per_month_policy_override(self):
        plan_id = self._plan(self.billing)
        self.api.patch(f'/api/social/plans/{plan_id}/', {'carry_over_policy': 'carry_over'}, format='json')
        res = self.api.get(f'/api/social/plans/{plan_id}/')
        self.assertEqual(res.data['effective_policy'], 'carry_over')

    def test_next_month_copies_customised_quantities(self):
        plan_id = self._plan(self.billing, quotas=[{'post_type': 'video', 'quantity': 3, 'unit_price': 3000}])
        res = self.api.post('/api/social/plans/', {'client_profile': self.billing.id, 'month': '2027-04', 'source': 'previous'}, format='json')
        self.assertEqual([(q['post_type'], q['quantity']) for q in res.data['quotas']], [('video', 3)])
        self.assertNotEqual(res.data['id'], plan_id)

    def test_idea_bank_fills_a_day(self):
        plan_id = self._plan(self.carry)
        idea = self.api.post('/api/social/ideas/', {'title': 'Meet the team', 'post_type': 'reel', 'client_profile': self.carry.id}, format='json').data
        res = self.api.post(f"/api/social/ideas/{idea['id']}/use/", {'plan_id': plan_id, 'planned_date': '2027-03-12'}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual((res.data['title'], res.data['planned_date'], res.data['production_method']), ('Meet the team', '2027-03-12', 'ai_generated'))
        self.assertEqual(self.api.get('/api/social/ideas/', {'client_id': self.carry.id}).data, [])

    def test_workload_and_overview_endpoints(self):
        plan_id = self._plan(self.carry)
        self.api.post(f'/api/social/plans/{plan_id}/generate_slots/', {}, format='json')
        ContentPlanItem.objects.filter(plan_id=plan_id).update(designer=self.user)
        res = self.api.get('/api/social/plan-workload/', {'month': '2027-03'})
        self.assertEqual(res.status_code, 200)
        self.assertTrue(any(p['role'] == 'designer' and p['id'] == self.user.id for p in res.data['people']))
        res = self.api.get('/api/social/plans/overview/', {'month': '2027-03'})
        planned = {c['client_name']: c['plan'] for c in res.data['clients']}
        self.assertEqual(planned['Coastal Cafe']['totals']['target'], 14)
        self.assertIsNone(planned['Hill Homes'])

    def test_key_dates_seed_and_project_to_viewed_year(self):
        res = self.api.get('/api/social/key-dates/', {'month': '2027-12', 'client_id': self.carry.id})
        self.assertIn(('Christmas', '2027-12-25'), [(k['title'], k['occurs_on']) for k in res.data])

    def test_wizard_creates_plan_with_dated_and_festival_slots(self):
        from apis.social.models import KeyDate

        onam = KeyDate.objects.create(date=date(2027, 9, 12), title='Onam', category='festival')
        slots = [
            {'post_type': 'image', 'planned_date': '2027-09-05'},
            {'post_type': 'image', 'planned_date': '2027-09-12', 'key_date': onam.id},
            {'post_type': 'image', 'planned_date': '2027-09-10', 'key_date': onam.id},
            {'post_type': 'video', 'planned_date': '2027-09-20'},
        ]
        res = self.api.post('/api/social/plans/wizard/', {'client_profile': self.carry.id, 'month': '2027-09', 'slots': slots}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        quotas = {q['post_type']: q['quantity'] for q in res.data['quotas']}
        self.assertEqual(quotas, {'image': 3, 'video': 1})
        festive = [i for i in res.data['items'] if i['key_date'] == onam.id]
        self.assertEqual(len(festive), 2)  # the same festival can carry several posts
        self.assertTrue(all(i['pillar'] == 'festive' for i in festive))
        again = self.api.post('/api/social/plans/wizard/', {'client_profile': self.carry.id, 'month': '2027-09', 'slots': slots}, format='json')
        self.assertEqual(again.status_code, 409)

    def test_sync_slots_edits_plan_and_protects_started_scripts(self):
        slots = [{'post_type': 'image', 'planned_date': '2027-09-05'}, {'post_type': 'image', 'planned_date': '2027-09-12'}, {'post_type': 'video', 'planned_date': '2027-09-20'}]
        plan = self.api.post('/api/social/plans/wizard/', {'client_profile': self.carry.id, 'month': '2027-09', 'slots': slots}, format='json').data
        ids = {i['planned_date']: i['id'] for i in plan['items']}
        self.api.post(f"/api/social/plan-items/{ids['2027-09-05']}/start_script/", {}, format='json')
        edited = [
            {'id': ids['2027-09-05'], 'post_type': 'carousel', 'planned_date': '2027-09-06'},  # has a script: type stays image
            {'post_type': 'image', 'planned_date': '2027-09-25'},  # new
        ]
        res = self.api.post(f"/api/social/plans/{plan['id']}/sync_slots/", {'slots': edited}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        by_date = {i['planned_date']: i for i in res.data['items']}
        self.assertEqual(sorted(by_date), ['2027-09-06', '2027-09-25'])  # unstarted slots removed
        self.assertEqual(by_date['2027-09-06']['post_type'], 'image')
        self.assertEqual({q['post_type']: q['quantity'] for q in res.data['quotas']}, {'image': 2})
