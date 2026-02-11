#!/usr/bin/env bash
# Start a server, run a command, then shut down the server.
#
# Usage:
#   bash with-server.sh <start_command> <test_command> [--port <port>] [--wait <seconds>]
#   bash with-server.sh --help
#
# Arguments:
#   start_command   Command to start the server (e.g., "npm run dev")
#   test_command    Command to run after server is ready (e.g., "npx playwright test")
#   --port, -p      Port to wait for (default: 3000)
#   --wait, -w      Max seconds to wait for server (default: 30)
#   --help, -h      Show this help message
#
# Examples:
#   bash with-server.sh "npm run dev" "npx playwright test"
#   bash with-server.sh "python -m http.server 8080" "curl http://localhost:8080" --port 8080
#   bash with-server.sh "npm start" "npm test" --port 3000 --wait 60
#
# Output (JSON):
#   {
#     "status": "success" | "error",
#     "server_started": true,
#     "test_exit_code": 0,
#     "server_pid": 12345,
#     "message": ""
#   }
#
# Exit codes:
#   0 - Tests passed
#   1 - Tests failed
#   2 - Server failed to start

set -uo pipefail

# Defaults
PORT=3000
WAIT=30
START_CMD=""
TEST_CMD=""

# Parse arguments
show_help() {
    head -30 "$0" | grep '^#' | sed 's/^# \?//'
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)
            show_help
            ;;
        --port|-p)
            PORT="$2"
            shift 2
            ;;
        --wait|-w)
            WAIT="$2"
            shift 2
            ;;
        *)
            if [[ -z "$START_CMD" ]]; then
                START_CMD="$1"
            elif [[ -z "$TEST_CMD" ]]; then
                TEST_CMD="$1"
            fi
            shift
            ;;
    esac
done

if [[ -z "$START_CMD" || -z "$TEST_CMD" ]]; then
    echo '{"status":"error","server_started":false,"test_exit_code":-1,"server_pid":null,"message":"Usage: with-server.sh <start_command> <test_command> [--port PORT] [--wait SECONDS]"}'
    exit 2
fi

# Cleanup function
cleanup() {
    if [[ -n "${SERVER_PID:-}" ]]; then
        # Kill the server and its children
        kill -- -"$SERVER_PID" 2>/dev/null || kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

# Start the server in background
$START_CMD &
SERVER_PID=$!

# Wait for server to be ready
ELAPSED=0
SERVER_READY=false
while [[ $ELAPSED -lt $WAIT ]]; do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        echo "{\"status\":\"error\",\"server_started\":false,\"test_exit_code\":-1,\"server_pid\":$SERVER_PID,\"message\":\"Server process exited prematurely\"}"
        exit 2
    fi

    if command -v nc &>/dev/null; then
        nc -z localhost "$PORT" 2>/dev/null && SERVER_READY=true && break
    elif command -v curl &>/dev/null; then
        curl -s -o /dev/null "http://localhost:$PORT" 2>/dev/null && SERVER_READY=true && break
    elif command -v bash &>/dev/null; then
        (echo > /dev/tcp/localhost/"$PORT") 2>/dev/null && SERVER_READY=true && break
    fi

    sleep 1
    ELAPSED=$((ELAPSED + 1))
done

if [[ "$SERVER_READY" != "true" ]]; then
    echo "{\"status\":\"error\",\"server_started\":false,\"test_exit_code\":-1,\"server_pid\":$SERVER_PID,\"message\":\"Server not ready after ${WAIT}s on port $PORT\"}"
    exit 2
fi

# Run the test command
eval "$TEST_CMD"
TEST_EXIT=$?

# Output result
if [[ $TEST_EXIT -eq 0 ]]; then
    echo "{\"status\":\"success\",\"server_started\":true,\"test_exit_code\":$TEST_EXIT,\"server_pid\":$SERVER_PID,\"message\":\"\"}"
else
    echo "{\"status\":\"error\",\"server_started\":true,\"test_exit_code\":$TEST_EXIT,\"server_pid\":$SERVER_PID,\"message\":\"Tests failed with exit code $TEST_EXIT\"}"
fi

# Cleanup happens via trap
exit $TEST_EXIT
