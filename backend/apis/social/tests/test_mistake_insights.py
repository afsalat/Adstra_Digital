from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from apis.social import insights
from apis.social.models import MistakeFix, PostApprovalHistory, SocialClientProfile, SocialPost


class PureHelperTests(TestCase):
    def test_lesson_status_too_early(self):
        self.assertEqual(insights.lesson_status(5, 3, 0), 'too_early')

    def test_lesson_status_zero_baseline(self):
        self.assertEqual(insights.lesson_status(30, 0, 0), 'working')
        self.assertEqual(insights.lesson_status(30, 0, 1.0), 'not_working')

    def test_lesson_status_vs_baseline(self):
        self.assertEqual(insights.lesson_status(30, 4, 1.0), 'working')
        self.assertEqual(insights.lesson_status(30, 4, 4.0), 'not_working')

    def test_category_rules(self):
        self.assertEqual(insights.fix_for_category('Colors / branding')['title'], 'Brand check before Team Review')
        self.assertIs(insights.fix_for_category('Other'), insights.GENERIC_FIX)

    def test_other_falls_back_to_notes(self):
        fix = insights.resolve_fix('Other', ['Spelling mistakes in the caption again', 'typo in CTA'])
        self.assertEqual(fix['title'], 'Caption & script proofread step')
        self.assertIs(insights.resolve_fix('Other', ['please redo']), insights.GENERIC_FIX)

    def test_notes_match_whole_words_only(self):
        # "milestone" must not trigger the brand rule via "tone"
        self.assertIsNone(insights.fix_from_text(['we hit a milestone']))


class EngineTests(TestCase):
    def setUp(self):
        self.a = SocialClientProfile.objects.create(name='Client A', slug='client-a')
        self.b = SocialClientProfile.objects.create(name='Client B', slug='client-b')
        self.post_a = SocialPost.objects.create(client_profile=self.a, title='A1', status='designing')
        self.post_b = SocialPost.objects.create(client_profile=self.b, title='B1', status='designing')

    def _event(self, post, cats, stage='team_review', event_type='revision', severity='minor', days_ago=1, notes=''):
        ev = PostApprovalHistory.objects.create(
            post=post, action='x', actor_name='t', event_type=event_type,
            from_stage=stage, severity=severity, reason_categories=cats, notes=notes,
        )
        PostApprovalHistory.objects.filter(pk=ev.pk).update(timestamp=timezone.now() - timedelta(days=days_ago))
        return ev

    def test_late_major_rejection_outranks_early_minor_revision(self):
        self._event(self.post_a, ['Typography'], stage='script_approval', severity='minor')
        self._event(self.post_a, ['Concept not relevant'], stage='client_review', event_type='rejection')
        cats = insights.build_mistake_insights('all', 90)['categories']
        self.assertEqual(cats[0]['category'], 'Concept not relevant')

    def test_score_decays_with_age(self):
        self._event(self.post_a, ['Typography'], days_ago=1)
        self._event(self.post_b, ['Caption / copy'], days_ago=60)
        cats = {c['category']: c['score'] for c in insights.build_mistake_insights('all', 90)['categories']}
        self.assertGreater(cats['Typography'], cats['Caption / copy'])

    def test_trend_compares_previous_window(self):
        self._event(self.post_a, ['Typography'], days_ago=40)
        self._event(self.post_a, ['Typography'], days_ago=2)
        self._event(self.post_a, ['Typography'], days_ago=3)
        cat = insights.build_mistake_insights('all', 30)['categories'][0]
        self.assertEqual((cat['count'], cat['previous_count'], cat['trend']), (2, 1, 'rising'))

    def test_repeat_rate_never_exceeds_100(self):
        for _ in range(3):
            self._event(self.post_a, ['Typography', 'Colors / branding'])
            self._event(self.post_b, ['Typography', 'Colors / branding'])
        rate = insights.build_mistake_insights('all', 90)['summary']['repeat_mistake_rate']
        self.assertEqual(rate, 67)  # 4 of 6 events repeat a (client, reason) pair

    def test_lessons_scoped_to_client(self):
        self._event(self.post_a, ['Typography'])
        insights.apply_fix('Typography', str(self.a.id), 'tester')
        self.assertEqual(len(insights.build_mistake_insights(str(self.a.id), 90)['lessons']), 1)
        self.assertEqual(insights.build_mistake_insights(str(self.b.id), 90)['lessons'], [])

    def test_old_fix_counts_events_outside_window(self):
        insights.apply_fix('Typography', str(self.a.id), 'tester')
        MistakeFix.objects.update(applied_at=timezone.now() - timedelta(days=200))
        self._event(self.post_a, ['Typography'], days_ago=150)
        lesson = insights.build_mistake_insights(str(self.a.id), 30)['lessons'][0]
        self.assertGreater(lesson['current_per_30d'], 0)
        self.assertEqual(lesson['status'], 'not_working')

    def test_reapply_does_not_duplicate(self):
        self._event(self.post_a, ['Typography'])
        _, created1, _ = insights.apply_fix('Typography', str(self.a.id), 'tester')
        _, created2, _ = insights.apply_fix('Typography', str(self.a.id), 'tester')
        self.assertTrue(created1)
        self.assertFalse(created2)
        self.assertEqual(MistakeFix.objects.count(), 1)

    def test_apply_all_clients_only_touches_affected_clients(self):
        self._event(self.post_a, ['Typography'])
        _, _, updated = insights.apply_fix('Typography', 'all', 'tester')
        self.post_a.refresh_from_db()
        self.post_b.refresh_from_db()
        self.assertEqual(updated, 1)
        self.assertTrue(any(c.get('source') == 'mistake_fix' for c in self.post_a.checklist))
        self.assertEqual(self.post_b.checklist, [])

    def test_rejected_post_hint(self):
        self._event(self.post_a, ['Colors / branding'])
        SocialPost.objects.filter(pk=self.post_a.pk).update(
            status='content_rejected', rejection_categories=['Colors / branding'],
            rejected_at=timezone.now(), rejected_from_stage='client_review',
        )
        hint = insights.build_mistake_insights('all', 90)['post_hints'][str(self.post_a.id)]
        self.assertEqual(hint['top_category'], 'Colors / branding')
        self.assertEqual(hint['fix']['title'], 'Brand check before Team Review')

    def test_endpoints(self):
        self._event(self.post_a, ['Typography'])
        res = self.client.get('/api/social/insights/mistakes/', {'client_id': 'all', 'days': 'abc'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['window_days'], 90)
        res = self.client.post('/api/social/insights/apply-fix/', {'category': ''}, content_type='application/json')
        self.assertEqual(res.status_code, 400)
        res = self.client.post('/api/social/insights/apply-fix/', {'category': 'Typography', 'checklist': 'x'}, content_type='application/json')
        self.assertEqual(res.status_code, 400)
