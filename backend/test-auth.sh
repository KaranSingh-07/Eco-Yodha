#!/bin/bash
set -e

cd "$(dirname "$0")"
PORT=5001

# Kill any existing process on the port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
sleep 1

# Start server in background
node server.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready (up to 15 seconds)
READY=0
for i in $(seq 1 15); do
  if curl -s -o /dev/null http://localhost:$PORT/ 2>/dev/null; then
    READY=1
    echo "Server ready after ${i}s"
    break
  fi
  sleep 1
done

if [ $READY -eq 0 ]; then
  echo "ERROR: Server failed to start within 15 seconds"
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

echo ""
echo "=== TEST 1: Signup (Student) ==="
SIGNUP_STUDENT=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:$PORT/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Student","email":"student@test.com","password":"password123","role":"student","school":"Test School"}')
echo "$SIGNUP_STUDENT"

echo ""
echo "=== TEST 2: Signup (Teacher) ==="
SIGNUP_TEACHER=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:$PORT/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Teacher","email":"teacher@test.com","password":"password123","role":"teacher","institutionName":"Test University"}')
echo "$SIGNUP_TEACHER"

echo ""
echo "=== TEST 3: Login ==="
LOGIN=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:$PORT/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@test.com","password":"password123"}')
echo "$LOGIN"

echo ""
echo "=== TEST 4: Auth Me ==="
TOKEN=$(echo "$LOGIN" | head -n1 | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
if [ -n "$TOKEN" ]; then
  AUTH_ME=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:$PORT/api/auth/me -H "Authorization: Bearer $TOKEN")
  echo "$AUTH_ME"
else
  echo "No token available - login may have failed"
fi

echo ""
echo "=== TEST 5: Duplicate signup (should fail) ==="
DUP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:$PORT/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Duplicate","email":"student@test.com","password":"password123","role":"student"}')
echo "$DUP"

echo ""
echo "=== TEST 6: Weak password (should fail) ==="
WEAK=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:$PORT/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Weak","email":"weak@test.com","password":"123","role":"student"}')
echo "$WEAK"

echo ""
echo "=== ALL TESTS COMPLETE ==="

# Kill server
kill $SERVER_PID 2>/dev/null || true
