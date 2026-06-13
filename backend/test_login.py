import urllib.request
import json
import os

def test_login_and_fetch():
    # Login
    login_data = json.dumps({"email": "admin@alshifaa.com", "password": "admin123"}).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/auth/login/", data=login_data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            print("Login successful.")
            
            # Extract access token from response or cookies?
            # CustomTokenObtainPairView returns 'access' in set-cookie or body?
            # Wait, the response has it in body?
            # Wait, CustomTokenObtainPairView uses TokenObtainPairView, which returns 'access' and 'refresh'.
            access = res_data.get('access')
            print(f"Access Token: {access[:10]}...")
            
            # Fetch Dashboard Data
            req_dash = urllib.request.Request("http://127.0.0.1:8000/api/v1/auth/admin/dashboard-data/", headers={'Authorization': f'Bearer {access}'})
            try:
                with urllib.request.urlopen(req_dash) as dash_response:
                    dash_data = json.loads(dash_response.read().decode())
                    print("Dashboard data keys:", dash_data.keys())
            except Exception as e:
                print("Dashboard Fetch Error:", e)
                if hasattr(e, 'read'): print(e.read().decode())
                
    except Exception as e:
        print("Login Error:", e)
        if hasattr(e, 'read'): print(e.read().decode())

test_login_and_fetch()
