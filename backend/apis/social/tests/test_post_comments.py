from django.test import TestCase
from rest_framework.test import APIClient

from apis.social.models import SocialClientProfile, SocialPost, PostComment, PostCommentMention
from apis.user.models import CustomUser


class PostCommentTests(TestCase):
    """Post comments with @mentions that act as per-user notifications."""

    def setUp(self):
        self.alice = CustomUser.objects.create_user('alice', 'alice@example.com', 'pw', fullname='Alice Writer')
        self.bob = CustomUser.objects.create_user('bob', 'bob@example.com', 'pw', fullname='Bob Designer')
        self.carol = CustomUser.objects.create_user('carol', 'carol@example.com', 'pw', fullname='Carol QA', role='admin')
        profile = SocialClientProfile.objects.create(name='Coastal Cafe', slug='coastal-cafe')
        self.post = SocialPost.objects.create(client_profile=profile, title='Cold Brew Reel', status='designing')
        self.client = APIClient()
        self.client.force_authenticate(self.alice)
        self.url = f'/api/social/posts/{self.post.id}/comments/'

    def _comment(self, body, mention_ids=None):
        res = self.client.post(self.url, {'body': body, 'mention_ids': mention_ids or []}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        return res.data

    def test_comment_records_author_and_mentions(self):
        data = self._comment('@Bob Designer can you swap the end card?', [self.bob.id])
        self.assertEqual(data['author_name'], 'Alice Writer')
        self.assertEqual([m['id'] for m in data['mentions']], [self.bob.id])
        self.assertTrue(data['can_delete'])
        self.assertEqual(PostCommentMention.objects.filter(user=self.bob, is_read=False).count(), 1)

    def test_mention_dropped_when_name_removed_from_text(self):
        data = self._comment('Never mind, fixed it', [self.bob.id])
        self.assertEqual(data['mentions'], [])
        self.assertFalse(PostCommentMention.objects.exists())

    def test_self_mention_creates_no_notification(self):
        self._comment('@Alice Writer note to self', [self.alice.id])
        self.assertFalse(PostCommentMention.objects.exists())

    def test_empty_comment_rejected(self):
        res = self.client.post(self.url, {'body': '   '}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_comments_require_login(self):
        res = APIClient().get(self.url)
        self.assertIn(res.status_code, (401, 403))

    def test_post_list_includes_comment_count(self):
        self._comment('First')
        self._comment('Second')
        res = self.client.get('/api/social/posts/')
        row = next(p for p in res.data if p['id'] == self.post.id)
        self.assertEqual(row['comment_count'], 2)

    def test_mentions_inbox_and_read_on_open(self):
        self._comment('@bob please check', [self.bob.id])
        bob = APIClient()
        bob.force_authenticate(self.bob)

        inbox = bob.get('/api/social/mentions/').data
        self.assertEqual(inbox['unread_count'], 1)
        self.assertEqual(inbox['results'][0]['post_id'], self.post.id)
        self.assertEqual(inbox['results'][0]['author_name'], 'Alice Writer')

        # Opening the thread marks Bob's mentions on that post as read
        bob.get(self.url)
        self.assertEqual(bob.get('/api/social/mentions/').data['unread_count'], 0)

    def test_mark_all_mentions_read(self):
        self._comment('@Bob Designer one', [self.bob.id])
        self._comment('@Bob Designer two', [self.bob.id])
        bob = APIClient()
        bob.force_authenticate(self.bob)
        self.assertEqual(bob.post('/api/social/mentions/', {}, format='json').data['updated'], 2)
        self.assertEqual(bob.get('/api/social/mentions/?unread=1').data['results'], [])

    def test_only_author_or_admin_can_delete(self):
        comment_id = self._comment('Draft thought')['id']
        delete_url = f'{self.url}{comment_id}/'

        bob = APIClient()
        bob.force_authenticate(self.bob)
        self.assertEqual(bob.delete(delete_url).status_code, 403)

        admin = APIClient()
        admin.force_authenticate(self.carol)
        self.assertEqual(admin.delete(delete_url).status_code, 204)
        self.assertFalse(PostComment.objects.exists())

    def test_team_members_lists_active_users(self):
        self.bob.is_active = False
        self.bob.save()
        names = [u['name'] for u in self.client.get('/api/social/team-members/').data]
        self.assertIn('Alice Writer', names)
        self.assertNotIn('Bob Designer', names)
