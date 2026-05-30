#!/bin/bash
set -e

echo "[start] Starting Node.js backend on port 8080..."
NODE_ENV=production PORT=8080 node dist/boot.js &
NODE_PID=$!

echo "[start] Starting Nginx on port 3000..."
nginx -g "daemon off;" &
NGINX_PID=$!

echo "[start] All services started. Node PID=$NODE_PID, Nginx PID=$NGINX_PID"

# Wait for any process to exit
wait -n

# Exit with the status of the first process that exited
exit $?
