#!/bin/bash
cd "$(dirname "$0")"

# Start server in background
node server.js &
SERVER_PID=$!

# Wait for server to start
for i in {1..10}; do
  if curl -s http://localhost:5001/ > /dev/null 2>&1; then
    echo "Server started on port 5001 (PID: $SERVER_PID)"
    break
  fi
  sleep 1
done

# Test signup
echo "=== Testing signup ==="
SIGNUP_RESULT=$(curl -s -X POST http://localhost:5001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"testsignup@example.com","password":"password123","role":"student","school":"Test School"}')
echo "Signup response: $SIGNUP_RESULT"

# Test login
echo "=== Testing login ==="
LOGIN_RESULT=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"testsignup@example.com","password":"password123"}')
echo "Login response: $LOGIN_RESULT"

# Extract token and test /auth/me
TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
if [ -n "$TOKEN" ]; then
  echo "=== Testing /auth/me ==="
  ME_RESULT=$(curl -s http://localhost:5001/api/auth/me -H "Authorization: Bearer $TOKEN")
  echo "/auth/me response: $ME_RESULT"
fi

# Keep server running
echo "=== Server staying alive on port 5001 ==="
wait $SERVER_PID
