from rest_framework.pagination import PageNumberPagination
from apis.user.models import CustomUser


class StandardResultsSetPagination(PageNumberPagination):
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_page_size(self, request):
        # Default page size tracks the current user count; evaluated per request
        # so it stays accurate and doesn't hit the DB at import time.
        self.page_size = CustomUser.objects.count() or 1
        return super().get_page_size(request)
