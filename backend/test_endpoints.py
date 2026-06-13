import urllib.request
import json

def check_endpoint(url):
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[{url}] Status: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"[{url}] HTTP Error: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"[{url}] Error: {e}")

check_endpoint("http://127.0.0.1:8000/api/v1/auth/admin/dashboard-data/")
check_endpoint("http://127.0.0.1:8000/api/v1/auth/admin/users/")
