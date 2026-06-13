from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ipd.models import Ward, Bed, AdmissionRecord
from ipd.serializers import WardSerializer, BedSerializer, AdmissionRecordSerializer
from django.utils import timezone

class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.prefetch_related('beds').all()
    serializer_class = WardSerializer
    permission_classes = [IsAuthenticated]

class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.select_related('ward').all()
    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]

class AdmissionRecordViewSet(viewsets.ModelViewSet):
    queryset = AdmissionRecord.objects.select_related('patient', 'patient__user', 'bed', 'bed__ward', 'attending_doctor').all()
    serializer_class = AdmissionRecordSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Update Bed status to OCCUPIED on admission
        admission = serializer.save()
        bed = admission.bed
        bed.status = 'OCCUPIED'
        bed.save()

    @action(detail=True, methods=['post'], url_path='discharge')
    def discharge_patient(self, request, pk=None):
        admission = self.get_object()
        if admission.status == 'DISCHARGED':
            return Response({'detail': 'Patient has already been discharged.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Perform discharge operations
        admission.status = 'DISCHARGED'
        admission.discharged_at = timezone.now()
        admission.save()

        # Update bed status to CLEANING
        bed = admission.bed
        bed.status = 'CLEANING'
        bed.save()

        return Response(AdmissionRecordSerializer(admission).data, status=status.HTTP_200_OK)
