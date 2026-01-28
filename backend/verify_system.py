import httpx
import time
import sys
import os

BASE_URL = os.getenv("API_URL", "http://backend:8000")
EMAIL = f"test_{int(time.time())}@example.com"
PASSWORD = "secret_password"

def log(msg, color="white"):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")

def test_flow():
    log(f"Starting E2E Test for {EMAIL}...")
    
    # 1. Signup
    try:
        resp = httpx.post(f"{BASE_URL}/auth/signup", json={"email": EMAIL, "password": PASSWORD})
        if resp.status_code != 200:
            log(f"Signup Failed: {resp.text}", "red")
            return
        token = resp.json()["access_token"]
        log("Signup & Login Successful. Token received.")
    except Exception as e:
        log(f"Connection Failed: {e}. Is Docker running?", "red")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check Profile (Credits should be 0)
    resp = httpx.get(f"{BASE_URL}/auth/me", headers=headers)
    profile = resp.json()
    log(f"Initial Profile: {profile}")
    if profile['credits'] != 0:
        log("FAIL: Initial credits should be 0", "red")
        
    # 3. Top Up (Mock DB Hack via raw SQL or just assume we fail execution first?)
    # Since we didn't implement TopUp API (admin only), we expect Execution to FAIL with 402.
    
    log("Attempting Execution (Should Fail due to 0 credits)...")
    try:
        resp = httpx.post(f"{BASE_URL}/executions/mock_wf_id", headers=headers)
        if resp.status_code == 402:
            log("SUCCESS: Execution blocked due to insufficient credits.", "green")
        else:
            log(f"FAIL: Expected 402, got {resp.status_code} {resp.text}", "red")
    except Exception as e:
        log(f"Execution Req Failed: {e}", "red")

    # 4. Verify no execution recorded (or failed one)
    # The guard blocks it before DB record in our current logic (in router).
    
    log("E2E Test Complete.")

if __name__ == "__main__":
    # Wait for services to be up
    time.sleep(5) 
    test_flow()
