from rest_framework import serializers
from roster.models import DutyRoster

class DutyRosterSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff_member.full_name', read_only=True)
    staff_role = serializers.CharField(source='staff_member.role', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = DutyRoster
        fields = '__all__'

    def validate(self, data):
        staff_member = data.get('staff_member')
        shift_start = data.get('shift_start')
        shift_end = data.get('shift_end')

        if shift_start >= shift_end:
            raise serializers.ValidationError("Shift start time must be before end time.")

        # Business Rule: Check for roster shift overlaps
        overlap_exists = DutyRoster.objects.filter(
            staff_member=staff_member,
            shift_start__lt=shift_end,
            shift_end__gt=shift_start
        ).exclude(id=self.instance.id if self.instance else None).exists()

        if overlap_exists:
            raise serializers.ValidationError("This staff member is already scheduled for an overlapping shift.")

        return data
