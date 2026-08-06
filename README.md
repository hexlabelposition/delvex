# Delvex

[![Server CI](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml/badge.svg?branch=dev)](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml)

Delvex is a logistics API for managing user accounts and shipments. The current
MVP focuses on a production-oriented Spring Boot backend: JWT authentication,
rotating refresh sessions, shipment lifecycle rules, PostgreSQL persistence,
OpenAPI documentation for development, health checks, rate limiting, Docker,
and a real production JAR smoke test.

## Technology stack

- Java 21
- Spring Boot 4.1
- Spring MVC and Jakarta Validation
- Spring Security OAuth2 Resource Server
- Spring Data JPA
- PostgreSQL 17
- Flyway migrations
- springdoc OpenAPI
- Maven Wrapper
- Docker and Docker Compose
- GitHub Actions

## Features

- User registration and login
- Short-lived JWT access tokens
- Rotating refresh tokens stored in an HttpOnly cookie
- Refresh-session revocation and scheduled cleanup
- Current-user profile retrieval and update
- Shipment creation, pagination, retrieval, update, and deletion
- Ownership checks for every shipment operation
- Restricted shipment status transitions
- Consistent JSON errors for validation, malformed JSON, security, and domain
  failures
- Configurable CORS and application logging
- Authentication rate limiting with trusted-proxy client IP resolution
- Separate liveness and database-backed readiness checks
- Development-only Swagger UI and OpenAPI JSON
- Secure-by-default production profile
- Non-root production Docker image
- Real HTTP smoke flow against a packaged production JAR and PostgreSQL

## Project structure

```text
.
├── .github/workflows/server-ci.yml   # tests and production JAR smoke
├── compose.yaml                      # server and PostgreSQL
├── .env.example                      # configuration template
└── server
    ├── Dockerfile                    # multi-stage production image
    ├── scripts/production-smoke.sh   # real HTTP smoke scenario
    ├── src/main/java                 # application source
    ├── src/main/resources
    │   ├── application.yaml
    │   ├── application-dev.yaml
    │   ├── application-prod.yaml
    │   └── db/migration              # Flyway migrations
    └── src/test/java                 # unit and integration tests
```

The server uses controllers for HTTP concerns, services for transactional
business logic, repositories for persistence, and Flyway as the only source of
schema changes. Hibernate is configured with `ddl-auto: validate`; it validates
the migrated schema but does not create or modify it.

## API overview

### Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health/live` | Process liveness |
| `GET` | `/api/health` | Database-backed readiness |
| `GET` | `/api/health/ready` | Database-backed readiness |
| `POST` | `/api/auth/register` | Register and issue tokens |
| `POST` | `/api/auth/login` | Authenticate and issue tokens |
| `POST` | `/api/auth/refresh` | Rotate the refresh session |
| `POST` | `/api/auth/logout` | Revoke the refresh session |

### Protected endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/users/me` | Read the current profile |
| `PATCH` | `/api/users/me` | Update the current profile |
| `POST` | `/api/shipments` | Create a shipment |
| `GET` | `/api/shipments?page=0&size=20` | List owned shipments |
| `GET` | `/api/shipments/{shipmentId}` | Read an owned shipment |
| `PATCH` | `/api/shipments/{shipmentId}` | Update an owned shipment |
| `DELETE` | `/api/shipments/{shipmentId}` | Delete an allowed shipment |

Send an access token as:

```http
Authorization: Bearer <access-token>
```

The shipment list is zero-based, defaults to 20 entries, accepts a maximum
`size` of 100, and returns `content`, `page`, `size`, `totalElements`,
and `totalPages`. Results are ordered by creation time descending.

### Shipment lifecycle

| Current status | Allowed next status |
| --- | --- |
| `CREATED` | `IN_TRANSIT`, `CANCELLED` |
| `IN_TRANSIT` | `DELIVERED`, `CANCELLED` |
| `DELIVERED` | none |
| `CANCELLED` | none |

Sending the current status again is idempotent. Only `CREATED` and
`CANCELLED` shipments can be deleted.

## Authentication details

Access tokens are HS256 JWTs with a 15-minute lifetime. The API returns the
access token in the response body.

Refresh tokens have a 30-day lifetime and are returned only through the
`refresh_token` cookie. The cookie is:

- `HttpOnly`
- `SameSite=Lax`
- scoped to `/api/auth`
- `Secure` by default and always in production

The development profile explicitly disables `Secure` so authentication works
over local HTTP. This is a profile decision, not an environment-variable
override.

Only a SHA-256 digest of each refresh token is stored in PostgreSQL. Refreshing
revokes the current session and creates a new one in the same transaction.
Logout is idempotent and clears the cookie even when no active session exists.
Expired and revoked sessions are removed by a scheduled cleanup job.

## Requirements

For a local JVM workflow:

- JDK 21
- Docker with Docker Compose
- Bash
- `curl` and `jq` only when running the production smoke script

A system Maven installation is not required; use `server/mvnw`.

## Local setup with Docker Compose

1. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Set at least these values in `.env`:

   ```dotenv
   SPRING_PROFILES_ACTIVE="dev"
   POSTGRES_DB="delvex"
   POSTGRES_USER="delvex"
   POSTGRES_PASSWORD="local-password"
   ACCESS_TOKEN_SECRET="<base64-secret>"
   CORS_ALLOWED_ORIGINS="http://localhost:3000"
   ```

3. Generate a suitable access-token secret:

   ```bash
   openssl rand -base64 32
   ```

4. Build and start the server and PostgreSQL:

   ```bash
   docker compose up --build
   ```

The API is available at `http://localhost:8080`. PostgreSQL is exposed at
`localhost:5432`, and its data is stored in the `postgres_data` volume.

Compose deliberately requires an explicit `SPRING_PROFILES_ACTIVE`. It also
overrides `POSTGRES_HOST` to `postgres` and `POSTGRES_PORT` to `5432`
inside the Docker network; keep `localhost` in the local `.env` for tools
running on the host.

To remove the local database as well as the containers:

```bash
docker compose down -v
```

> This permanently deletes the local `postgres_data` volume.

## Local JVM development

Start PostgreSQL first:

```bash
docker compose up -d postgres
```

Then export the root environment file and start Spring Boot:

```bash
cd server
set -a
source ../.env
set +a
chmod +x mvnw
./mvnw spring-boot:run
```

The `spring.config.import` entry resolves `.env` relative to the process
working directory. Exporting the root file as shown above avoids maintaining a
second `server/.env`. IDE launch configurations should likewise load the root
`.env` or provide the same environment variables directly.

## OpenAPI documentation

Documentation is available only with the `dev` profile:

- Swagger UI: `http://localhost:8080/docs`
- OpenAPI JSON: `http://localhost:8080/docs/openapi.json`

Documentation is disabled and unreachable in `prod`. If `/docs` is missing
locally, confirm that `SPRING_PROFILES_ACTIVE=dev`.

## Environment variables

| Variable | Default | Notes |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | none | Set `dev` locally or `prod` when deployed; Compose requires it |
| `POSTGRES_HOST` | `localhost` outside `prod` | Required explicitly in `prod`; Compose uses `postgres` |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_DB` | none | Required database name |
| `POSTGRES_SCHEMA` | `public` | JDBC current schema |
| `POSTGRES_USER` | none | Required database user |
| `POSTGRES_PASSWORD` | none | Required database password |
| `ACCESS_TOKEN_SECRET` | none | Required Base64 value containing at least 32 decoded bytes |
| `CORS_ALLOWED_ORIGINS` | empty; `http://localhost:3000` in `dev` | Comma-separated exact origins; required HTTPS origins in `prod` |
| `LOG_LEVEL` | `INFO` | Log level for `com.delvex.server` |
| `REFRESH_SESSION_CLEANUP_INTERVAL` | `1h` | Delay between cleanup runs |
| `REFRESH_SESSION_CLEANUP_INITIAL_DELAY` | `1h` | Delay before the first cleanup |
| `AUTH_RATE_LIMIT_WINDOW` | `1m` | Fixed rate-limit window |
| `AUTH_RATE_LIMIT_REGISTER_REQUESTS` | `5` | Registration attempts per client/window |
| `AUTH_RATE_LIMIT_LOGIN_REQUESTS` | `10` | Login attempts per client/window |
| `AUTH_RATE_LIMIT_REFRESH_REQUESTS` | `30` | Refresh attempts per client/window |
| `AUTH_RATE_LIMIT_TRUSTED_PROXY_CIDRS` | empty | Comma-separated proxy networks trusted to provide client IP headers |

There is intentionally no `REFRESH_COOKIE_SECURE` variable. Cookies are secure
by default, `application-dev.yaml` disables the flag for local HTTP, and
`application-prod.yaml` enforces it.

## CORS in production

The production profile fails during startup unless at least one valid HTTPS
origin is configured. Wildcards, HTTP origins, localhost, user information,
paths, queries, and fragments are rejected.

Correct:

```dotenv
CORS_ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"
```

Incorrect:

```dotenv
CORS_ALLOWED_ORIGINS="*"
CORS_ALLOWED_ORIGINS="http://app.example.com"
CORS_ALLOWED_ORIGINS="https://app.example.com/path"
```

Do not include a trailing slash because an origin consists only of scheme,
host, and optional port.

## Trusted proxies and client IPs

Forwarded headers are ignored by default because clients can forge them. If the
server is reachable only through a known reverse proxy, configure the proxy
network explicitly:

```dotenv
AUTH_RATE_LIMIT_TRUSTED_PROXY_CIDRS="10.0.0.0/8,172.16.0.0/12"
```

The application trusts `Forwarded` or `X-Forwarded-For` only when the direct
TCP peer belongs to one of these CIDRs. It walks the forwarded chain from right
to left and selects the first untrusted address, which prevents a client from
escaping its rate-limit bucket by prepending a forged address.

Use the actual network ranges of Railway, Render, Nginx, Cloudflare, or another
ingress in front of the application. Do not use `0.0.0.0/0` or `::/0` when
the application can also be reached directly.

The current rate limiter is intentionally in-memory for the MVP. Limits are
per application instance and reset when the process restarts. A multi-instance
deployment should move this state to a shared store such as Redis or enforce
the limits at the gateway.

## Production configuration

Use the production profile:

```dotenv
SPRING_PROFILES_ACTIVE="prod"
POSTGRES_HOST="database.internal"
POSTGRES_PORT="5432"
POSTGRES_DB="delvex"
POSTGRES_SCHEMA="public"
POSTGRES_USER="delvex"
POSTGRES_PASSWORD="<secret>"
ACCESS_TOKEN_SECRET="<base64-secret>"
CORS_ALLOWED_ORIGINS="https://app.example.com"
LOG_LEVEL="INFO"
```

The application fails fast when production configuration is unsafe:

- `dev` and `prod` are active together
- refresh cookies are not secure
- Swagger UI or OpenAPI JSON is enabled
- CORS origins are missing or unsafe
- required database or token settings are missing or invalid

The production Docker image runs as a non-root `delvex` user and exposes port
8080. Its health check uses the database-backed readiness endpoint.

Build it directly:

```bash
docker build -t delvex-server ./server
```

## Build and tests

Run the complete Maven test suite:

```bash
cd server
./mvnw --batch-mode --no-transfer-progress test
```

Build the executable JAR:

```bash
./mvnw --batch-mode --no-transfer-progress -DskipTests package
java -jar target/server-0.0.1-SNAPSHOT.jar
```

Flyway migrations run automatically when the application starts. Startup fails
if PostgreSQL is unavailable, a migration fails, or Hibernate detects a schema
mismatch.

### Production HTTP smoke

The smoke script launches the packaged JAR itself, waits for readiness, performs
registration, shipment creation and retrieval, refresh rotation, shipment
update, documentation checks, logout, revoked-token rejection, and a final
readiness check.

It requires a configured `prod` environment, an available PostgreSQL database,
a free port 8080, and a previously packaged JAR:

```bash
cd server
./mvnw --batch-mode --no-transfer-progress -DskipTests package
./scripts/production-smoke.sh
```

> The script creates a real user, shipment, and refresh-session records. Run it
> only against a clean or disposable smoke database, never against production.

Optional script variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SERVER_URL` | `http://127.0.0.1:8080` | Base URL used by HTTP requests |
| `SERVER_JAR` | first `target/server-*.jar` | Explicit JAR path |
| `SERVER_LOG_FILE` | `target/production-smoke.log` | Captured server log |

## CI

`.github/workflows/server-ci.yml` runs for server, Compose, and workflow
changes targeting `dev`.

- **Maven tests** runs the complete unit and integration suite against
  PostgreSQL.
- **Production JAR smoke** packages the executable JAR, starts it with the
  `prod` profile, performs the real HTTP scenario, and builds the production
  Docker image.

Surefire reports or the production server log are uploaded only when the
corresponding job fails; a skipped upload step on a successful run is expected.

## Operational notes

- `GET /api/health/live` reports only that the process is alive.
- `GET /api/health/ready` and `GET /api/health` query PostgreSQL and return
  HTTP 503 when the database is unavailable.
- Logs include a request ID. An incoming `X-Request-ID` is reused when valid;
  otherwise the server creates one and returns it in the response.
- All routes are authenticated by default. Only the explicitly listed health
  and authentication routes are public.
- The API never returns raw refresh tokens in JSON.
- Database changes belong in a new Flyway migration; do not rely on Hibernate
  schema generation.
