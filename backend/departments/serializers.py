from rest_framework import serializers
from departments.models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name', 'description')

class AdminDepartmentSerializer(serializers.ModelSerializer):
    staff_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Department
        fields = ('id', 'name', 'code', 'description', 'location', 'contact_number', 'is_active', 'staff_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'staff_count', 'created_at', 'updated_at')

    def validate_name(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError('Department name cannot be empty.')
        qs = Department.objects.filter(name__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A department with this name already exists.')
        return val

    def validate_code(self, value):
        if not value:
            raise serializers.ValidationError('Department code is required.')
        val = value.strip().upper()
        if not val:
            raise serializers.ValidationError('Department code cannot be empty.')
        if len(val) > 10:
            raise serializers.ValidationError('Code must be 10 characters or less.')
        qs = Department.objects.filter(code__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A department with this code already exists.')
        return val
