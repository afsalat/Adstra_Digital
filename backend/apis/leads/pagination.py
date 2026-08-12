"""Pagination policies for lead-management collection endpoints."""

from rest_framework.pagination import PageNumberPagination


class BoundedPageNumberPagination(PageNumberPagination):
    """Page-number pagination with a client override capped at 100 records."""

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100


class LeadPagination(BoundedPageNumberPagination):
    """Semantic alias used by lead, target-customer, and reporting views."""

