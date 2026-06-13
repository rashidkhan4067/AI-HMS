from django.urls import path, include
from rest_framework.routers import DefaultRouter
from roster.views import DutyRosterViewSet

router = DefaultRouter()
router.register(r'rosters', DutyRosterViewSet, basename='roster')

urlpatterns = [
    path('', include(router.urls)),
]
