from django.test import TestCase
from rest_framework.test import APIClient

from apis.social.models import SocialClientProfile, SocialPost
from apis.user.models import CustomUser


class PostAssignmentTests(TestCase):
    """Writer / designer / reviewer owners and priority, each change logged on the timeline."""

    def setUp(self):
        self.lead = CustomUser.objects.create_user('lead', 'lead@example.com', 'pw', fullname='Team Lead')
        self.bob = CustomUser.objects.create_user('bob', 'bob@example.com', 'pw', fullname='Bob Designer')
        profile = SocialClientProfile.objects.create(name='Coastal Cafe', slug='coastal-cafe')
        self.post = SocialPost.objects.create(client_profile=profile, title='Cold Brew Reel', status='designing')
        self.client = APIClient()
        self.client.force_authenticate(self.lead)

    def _assign(self, role, user_id):
        return self.client.post(f'/api/social/posts/{self.post.id}/assign/', {'role': role, 'user_id': user_id}, format='json')

    def test_assign_designer_returns_details_and_logs_history(self):
        res = self._assign('designer', self.bob.id)
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['designer'], self.bob.id)
        self.assertEqual(res.data['designer_details']['name'], 'Bob Designer')
        self.assertEqual(res.data['approval_history'][0]['action'], 'Designer Assigned')
        self.assertEqual(res.data['approval_history'][0]['event_type'], 'note')

    def test_reassigning_same_person_is_a_no_op(self):
        self._assign('designer', self.bob.id)
        self._assign('designer', self.bob.id)
        self.assertEqual(self.post.approval_history.filter(action='Designer Assigned').count(), 1)

    def test_unassign(self):
        self._assign('reviewer', self.bob.id)
        res = self._assign('reviewer', None)
        self.assertIsNone(res.data['reviewer'])
        self.assertEqual(res.data['approval_history'][0]['action'], 'Reviewer Unassigned')

    def test_invalid_role_and_inactive_user_rejected(self):
        self.assertEqual(self._assign('publisher', self.bob.id).status_code, 400)
        self.bob.is_active = False
        self.bob.save()
        self.assertEqual(self._assign('designer', self.bob.id).status_code, 400)

    def test_set_priority(self):
        url = f'/api/social/posts/{self.post.id}/set_priority/'
        res = self.client.post(url, {'priority': 'urgent'}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['priority'], 'urgent')
        self.assertEqual(self.client.post(url, {'priority': 'asap'}, format='json').status_code, 400)

    def test_list_includes_role_details(self):
        self._assign('writer', self.lead.id)
        row = next(p for p in self.client.get('/api/social/posts/').data if p['id'] == self.post.id)
        self.assertEqual(row['writer_details']['name'], 'Team Lead')
        self.assertIsNone(row['designer_details'])

    def test_timeline_note_response_includes_new_note(self):
        res = self.client.post(
            f'/api/social/posts/{self.post.id}/add_timeline_note/',
            {'action': 'Milestone Note', 'notes': 'Storyboard locked'},
            format='json',
        )
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['approval_history'][0]['notes'], 'Storyboard locked')
