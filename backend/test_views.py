import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from accounts.admin_views import AdminDashboardDataView
from billing.views import AdminBillingOversightView

User = get_user_model()
admin = User.objects.filter(role='ADMIN').first()
if not admin:
    print("No admin user found")
    exit()

print(f"Using admin user: {admin.email}")

factory = APIRequestFactory()

from rest_framework.test import APIRequestFactory, force_authenticate

def test_view(view_class, path):
    request = factory.get(path)
    force_authenticate(request, user=admin)
    view = view_class.as_view()
    try:
        response = view(request)
        print(f"[{path}] Status: {response.status_code}")
        if response.status_code != 200:
            print(f"[{path}] Data: {response.data}")
    except Exception as e:
        import traceback
        print(f"[{path}] Exception:")
        traceback.print_exc()

test_view(AdminDashboardDataView, '/api/v1/auth/admin/dashboard-data/')
test_view(AdminBillingOversightView, '/api/v1/admin/billing/oversight/')
