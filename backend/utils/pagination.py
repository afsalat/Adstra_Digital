from rest_framework.pagination import PageNumberPagination
from apis.user.models import CustomUser


class StandardResultsSetPagination(PageNumberPagination):
    user_count = CustomUser.objects.all().count()
    page_size = user_count
    page_size_query_param = "page_size"
    max_page_size = 100