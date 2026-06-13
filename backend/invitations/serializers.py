from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from invitations.models import StaffInvite

User = get_user_model()

class StaffInviteSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField(read_only=True)
    is_expired = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StaffInvite
        fields = (
            'id', 'email', 'role', 'department', 'department_name',
            'is_used', 'created_at', 'expires_at', 'is_expired'
        )
        read_only_fields = ('id', 'is_used', 'created_at', 'expires_at', 'is_expired')

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_is_expired(self, obj):
        return timezone.now() > obj.expires_at

    def validate_email(self, value):
        val = value.lower().strip()
        if User.objects.filter(email=val, is_active=True).exists():
            raise serializers.ValidationError("An active user with this email address already exists.")
        if StaffInvite.objects.filter(email=val, is_used=False, expires_at__gt=timezone.now()).exists():
            raise serializers.ValidationError("An active pending invitation for this email already exists.")
        return val
