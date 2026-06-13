from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ipd.views import WardViewSet, BedViewSet, AdmissionRecordViewSet

router = DefaultRouter()
router.register(r'wards', WardViewSet, basename='ward')
router.register(r'beds', BedViewSet, basename='bed')
router.register(r'admissions', AdmissionRecordViewSet, basename='admission')

urlpatterns = [
    path('', include(router.urls)),
]
