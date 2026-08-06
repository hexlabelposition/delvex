#!/usr/bin/env bash

set -euo pipefail

base_url="${SERVER_URL:-http://127.0.0.1:8080}"
log_file="${SERVER_LOG_FILE:-target/production-smoke.log}"
temp_dir=$(mktemp -d)
server_pid=""

cleanup() {
    status=$?
    trap - EXIT

    if [[ $status -ne 0 && -f "$log_file" ]]; then
        echo "Production server log:"
        cat "$log_file"
    fi

    if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
        kill "$server_pid"
        wait "$server_pid" 2>/dev/null || true
    fi

    rm -rf "$temp_dir"
    exit "$status"
}

trap cleanup EXIT

for command in curl jq java; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Required command is missing: $command" >&2
        exit 1
    fi
done

jar_path="${SERVER_JAR:-}"
if [[ -z "$jar_path" ]]; then
    jar_path=$(find target -maxdepth 1 -type f \
        -name "server-*.jar" ! -name "*.jar.original" \
        -print -quit)
fi

if [[ -z "$jar_path" || ! -f "$jar_path" ]]; then
    echo "Production JAR was not found" >&2
    exit 1
fi

java -jar "$jar_path" >"$log_file" 2>&1 &
server_pid=$!

ready=false
for _ in {1..60}; do
    if ! kill -0 "$server_pid" 2>/dev/null; then
        echo "Production server stopped before becoming ready" >&2
        exit 1
    fi

    if curl --fail --silent --show-error \
            "$base_url/api/health/ready" \
            | jq --exit-status '.status == "ok"' >/dev/null 2>&1; then
        ready=true
        break
    fi

    sleep 1
done

if [[ "$ready" != true ]]; then
    echo "Production server did not become ready" >&2
    exit 1
fi

expect_status() {
    actual=$1
    expected=$2
    operation=$3

    if [[ "$actual" != "$expected" ]]; then
        echo "$operation returned HTTP $actual, expected $expected" >&2

        if [[ -f "$temp_dir/body.json" ]]; then
            cat "$temp_dir/body.json" >&2
        fi

        exit 1
    fi
}

email="production-smoke-${GITHUB_RUN_ID:-local}-${RANDOM}@example.com"
registration_payload=$(jq --null-input --compact-output \
    --arg email "$email" \
    '{
        email: $email,
        password: "strong-password",
        firstName: "Production",
        lastName: "Smoke"
    }')

registration_status=$(curl --silent --show-error \
    --dump-header "$temp_dir/headers.txt" \
    --output "$temp_dir/body.json" \
    --write-out "%{http_code}" \
    --request POST \
    --header "Content-Type: application/json" \
    --data "$registration_payload" \
    "$base_url/api/auth/register")
expect_status "$registration_status" "201" "Registration"

access_token=$(jq --exit-status --raw-output '.accessToken' \
    "$temp_dir/body.json")
jq --exit-status --arg email "$email" \
    '.email == $email' "$temp_dir/body.json" >/dev/null

if ! grep --ignore-case --quiet \
        '^set-cookie: refresh_token=.*Secure' \
        "$temp_dir/headers.txt"; then
    echo "Registration refresh cookie is not Secure" >&2
    exit 1
fi

refresh_token=$(sed -n \
    's/^[Ss]et-[Cc]ookie: refresh_token=\([^;]*\).*/\1/p' \
    "$temp_dir/headers.txt" | tr -d '\r' | head -n 1)

if [[ -z "$refresh_token" ]]; then
    echo "Registration refresh cookie is missing" >&2
    exit 1
fi

shipment_payload='{
  "originCountry": "PL",
  "originCity": "Legnica",
  "originPostalCode": "59-220",
  "originAddress": "Rynek 1",
  "destinationCountry": "PL",
  "destinationCity": "Wroclaw",
  "destinationPostalCode": "50-001",
  "destinationAddress": "Rynek 2",
  "cargoDescription": "Production smoke cargo",
  "weightKg": 12.50
}'

creation_status=$(curl --silent --show-error \
    --output "$temp_dir/body.json" \
    --write-out "%{http_code}" \
    --request POST \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data "$shipment_payload" \
    "$base_url/api/shipments")
expect_status "$creation_status" "201" "Shipment creation"

shipment_id=$(jq --exit-status --raw-output '.id' "$temp_dir/body.json")
jq --exit-status '.status == "CREATED"' \
    "$temp_dir/body.json" >/dev/null

shipment_status=$(curl --silent --show-error \
    --output "$temp_dir/body.json" \
    --write-out "%{http_code}" \
    --header "Authorization: Bearer $access_token" \
    "$base_url/api/shipments/$shipment_id")
expect_status "$shipment_status" "200" "Shipment retrieval"
jq --exit-status --arg id "$shipment_id" \
    '.id == $id and .status == "CREATED"' \
    "$temp_dir/body.json" >/dev/null

refresh_status=$(curl --silent --show-error \
    --dump-header "$temp_dir/headers.txt" \
    --output "$temp_dir/body.json" \
    --write-out "%{http_code}" \
    --request POST \
    --header "Cookie: refresh_token=$refresh_token" \
    "$base_url/api/auth/refresh")
expect_status "$refresh_status" "200" "Token refresh"

refreshed_access_token=$(jq --exit-status --raw-output '.accessToken' \
    "$temp_dir/body.json")
rotated_refresh_token=$(sed -n \
    's/^[Ss]et-[Cc]ookie: refresh_token=\([^;]*\).*/\1/p' \
    "$temp_dir/headers.txt" | tr -d '\r' | head -n 1)

if [[ -z "$rotated_refresh_token" \
        || "$rotated_refresh_token" == "$refresh_token" ]]; then
    echo "Refresh token was not rotated" >&2
    exit 1
fi

update_status=$(curl --silent --show-error \
    --output "$temp_dir/body.json" \
    --write-out "%{http_code}" \
    --request PATCH \
    --header "Authorization: Bearer $refreshed_access_token" \
    --header "Content-Type: application/json" \
    --data '{"status":"IN_TRANSIT"}' \
    "$base_url/api/shipments/$shipment_id")
expect_status "$update_status" "200" "Shipment update"
jq --exit-status '.status == "IN_TRANSIT"' \
    "$temp_dir/body.json" >/dev/null

for path in "/docs" "/docs/openapi.json"; do
    docs_status=$(curl --silent --show-error \
        --output "$temp_dir/body.json" \
        --write-out "%{http_code}" \
        --header "Authorization: Bearer $refreshed_access_token" \
        "$base_url$path")
    expect_status "$docs_status" "404" "Production documentation check"
done

logout_status=$(curl --silent --show-error \
    --dump-header "$temp_dir/headers.txt" \
    --output "$temp_dir/body.json" \
    --write-out "%{http_code}" \
    --request POST \
    --header "Cookie: refresh_token=$rotated_refresh_token" \
    "$base_url/api/auth/logout")
expect_status "$logout_status" "204" "Logout"

if ! grep --ignore-case --quiet \
        '^set-cookie: refresh_token=.*Max-Age=0.*Secure' \
        "$temp_dir/headers.txt"; then
    echo "Logout did not clear the Secure refresh cookie" >&2
    exit 1
fi

revoked_status=$(curl --silent --show-error \
    --output "$temp_dir/body.json" \
    --write-out "%{http_code}" \
    --request POST \
    --header "Cookie: refresh_token=$rotated_refresh_token" \
    "$base_url/api/auth/refresh")
expect_status "$revoked_status" "401" "Revoked token reuse"
jq --exit-status \
    '.message == "Refresh token is invalid or expired"' \
    "$temp_dir/body.json" >/dev/null

curl --fail --silent --show-error \
    "$base_url/api/health/ready" \
    | jq --exit-status '.status == "ok"' >/dev/null

echo "Production JAR smoke flow completed successfully"
