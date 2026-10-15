from django.test import TestCase
from rest_framework.test import APIClient

from apis.social.models import SocialClientProfile, SocialPost


class ScriptRevisionFlowTests(TestCase):
    """Client / QA can send a post back for a script rewrite (a revision, not a rejection)."""

    def setUp(self):
        self.client = APIClient()
        profile = SocialClientProfile.objects.create(name='GlowUp', slug='glowup')
        self.post = SocialPost.objects.create(client_profile=profile, title='Testimonial', status='client_review')

    def _move(self, target, action_type='advance', **extra):
        res = self.client.post(
            f'/api/social/posts/{self.post.id}/transition_stage/',
            {'target_stage': target, 'action_type': action_type, **extra},
            format='json',
        )
        self.assertEqual(res.status_code, 200, res.data)
        self.post.refresh_from_db()
        return res

    def _latest(self):
        return self.post.approval_history.order_by('-timestamp', '-id').first()

    def test_client_script_revision_loops_through_script_approval_then_redesign(self):
        self._move('script', 'reject', notes='Lead with the free consult offer', reason_categories=['Weak hook'])
        self.assertEqual(self.post.status, 'script')
        self.assertEqual(self.post.revision_count, 1)
        self.assertEqual(self.post.client_revision_count, 1)
        self.assertEqual(self.post.rejection_reason, '')
        ev = self._latest()
        self.assertEqual((ev.event_type, ev.action), ('revision', 'Client Requested Script Changes'))

        self._move('script_approval')
        self.assertEqual(self.post.client_feedback, '')

        # Approver bounces the rewrite once more — redesign must still be flagged afterwards
        self._move('script', 'reject', notes='Still too long')
        self._move('script_approval')

        self._move('designing')
        self.assertIn('update the design', self.post.client_feedback)
        self.assertIn('Lead with the free consult offer', self.post.client_feedback)
        self.assertEqual(self._latest().action, 'Revised Script Approved → Redesign Needed')

        self._move('team_review')
        self.assertEqual(self.post.client_feedback, '')
        self.assertEqual(self._latest().action, 'Creative Assets Revised & Resubmitted')

    def test_redesign_flag_is_consumed_once(self):
        self._move('script', 'reject', notes='Rewrite hook')
        self._move('script_approval')
        self._move('designing')
        self._move('team_review')
        # A later, unrelated script loop from script approval is a normal script approval
        SocialPost.objects.filter(pk=self.post.pk).update(status='script_approval')
        self._move('script', 'reject', notes='minor wording')
        self._move('script_approval')
        self._move('designing')
        self.assertEqual(self.post.client_feedback, '')
        self.assertEqual(self._latest().action, 'Script Approved → Moved to Designing')

    def test_full_rejection_cancels_pending_redesign(self):
        self._move('script', 'reject', notes='Rewrite hook')
        self._move('script', 'reject_final', notes='Concept dropped, new idea', rejected_by='client')
        self._move('script_approval')
        self._move('designing')
        self.assertEqual(self._latest().action, 'Script Approved → Moved to Designing')

    def test_design_revision_unchanged(self):
        self._move('designing', 'reject', notes='Fix logo')
        self.assertEqual(self.post.status, 'designing')
        self.assertEqual(self._latest().action, 'Client Requested Changes')
