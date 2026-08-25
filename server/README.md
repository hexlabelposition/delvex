# Delvex Server

[Back to project overview](../README.md)

The Delvex server is a production-oriented logistics API built with Spring
Boot. It owns authentication, user profiles, shipment lifecycle rules,
PostgreSQL persistence, API documentation, security, and operational health.

## Technology stack

- Java 21
- Spring Boot 4.1
- Spring MVC and Jakarta Validation
- Spring Security OAuth2 Resource Server
- Spring Data JPA and Spring Data Redis
- PostgreSQL 17
- Redis 8
- Flyway migrations
- springdoc OpenAPI
- Spring-Dotenv
- Maven Wrapper
- Docker
- GitHub Actions

## Features

- user registration and login;
- short-lived HS256 JWT access tokens;
- rotating refresh tokens stored in an HttpOnly cookie;
- refresh-session revocation and scheduled cleanup;
- one-time password reset tokens with profile-specific email delivery;
- current-user profile retrieval and update;
- shipment creation, pagination, retrieval, update, and deletion;
- ownership checks and optimistic locking for shipment operations;
- fixed Polish shipment locations persisted as address snapshots;
- consistent JSON errors for validation, malformed JSON, security, and domain
  failures;
- configurable CORS and application logging;
- Redis-backed authentication rate limiting with trusted-proxy client IP
  resolution;
- separate liveness and PostgreSQL/Redis-backed readiness checks;
- development-only Swagger UI and OpenAPI JSON;
- secure-by-default production profile;
- real HTTP smoke flow against a packaged production JAR and PostgreSQL.

## Module structure

```text
server/
├── .env.example                      # standalone JVM configuration
├── Dockerfile                        # multi-stage production image
├── pom.xml
├── mvnw
└── src/
    ├── main/
    │   ├── java/                     # application source
    │   └── resources/
    │       ├── application.yaml
    │       ├── application-dev.yaml
    │       ├── application-prod.yaml
    │       └── db/migration/         # Flyway migrations
    └── test/java/                    # unit and integration tests
        └── com/delvex/server/smoke/
            └── ProductionSmokeIT.java # packaged JAR HTTP scenario
```

Controllers handle HTTP concerns, services contain transactional business
logic, repositories provide persistence, and Flyway is the only source of
schema changes. Hibernate uses **ddl-auto: validate** and never creates or
modifies the production schema.

## API overview

### Public endpoints

| Method | Path                   | Purpose                       |
| ------ | ---------------------- | ----------------------------- |
| GET    | **/api/health/live**   | Process liveness              |
| GET    | **/api/health**        | Database-backed readiness     |
| GET    | **/api/health/ready**  | Database-backed readiness     |
| POST   | **/api/auth/register** | Register and issue tokens     |
| POST   | **/api/auth/login**    | Authenticate and issue tokens |
| POST   | **/api/auth/refresh**  | Rotate the refresh session    |
| POST   | **/api/auth/logout**   | Revoke the refresh session    |
| POST   | **/api/auth/forgot-password** | Request a reset email  |
| POST   | **/api/auth/reset-password**  | Set a new password     |

### Protected endpoints

| Method | Path                              | Purpose                    |
| ------ | --------------------------------- | -------------------------- |
| GET    | **/api/users/me**                 | Read the current profile   |
| PATCH  | **/api/users/me**                 | Update the current profile |
| POST   | **/api/shipments**                | Create a shipment          |
| GET    | **/api/shipments?page=0&size=20** | List owned shipments       |
| GET    | **/api/shipments/{shipmentId}**   | Read an owned shipment     |
| PATCH  | **/api/shipments/{shipmentId}**   | Update an owned shipment   |
| DELETE | **/api/shipments/{shipmentId}**   | Delete an allowed shipment |

Send an access token as:

```http
Authorization: Bearer <access-token>
```

The shipment list is zero-based, defaults to 20 entries, accepts a maximum
size of 100, and returns **content**, **page**, **size**, **totalElements**, and
**totalPages**. Results are ordered by creation time descending.

### Shipment restrictions

Owned shipments can be updated or deleted only while they remain in the
**CREATED** status.

## Authentication

Access tokens are HS256 JWTs with a 15-minute lifetime. The API returns the
access token in the response body.

Refresh tokens have a 30-day lifetime and are returned only through the
**refresh_token** cookie. The cookie is HttpOnly, SameSite=Lax, scoped to
**/api/auth**, and Secure by default and always in production.

The local profile disables Secure only for local HTTP. Only a SHA-256
digest of each refresh token is stored in PostgreSQL. Refreshing revokes the
current session and creates a replacement in the same transaction. Logout is
idempotent, and expired or revoked sessions are removed by a scheduled cleanup
job.

Password recovery always returns HTTP 202 for a valid email-shaped request,
whether or not the account exists. A known account receives a cryptographically
random, single-use link whose SHA-256 digest is stored in PostgreSQL. The raw
token exists only in the outgoing email. Reset links expire after 30 minutes by
default, requesting another link invalidates earlier links, and a successful
reset revokes every active refresh session for the user. An already issued
access token can remain valid only until its normal 15-minute expiry.

Email delivery runs asynchronously after the reset-token transaction commits.
The forgot-password endpoint returning HTTP 202 therefore confirms that the
request was accepted, not that an email reached the inbox. Transport failures
are logged without exposing the raw token.

## Requirements

- JDK 21
- Docker with Docker Compose
- PostgreSQL and Redis; SMTP is used only by local Mailpit development

A system Maven installation is not required.

## Local development

The recommended backend workflow runs PostgreSQL and Redis in Docker and Spring
Boot directly on the host.

### 1. Prepare infrastructure

From the repository root:

```bash
cp .env.example .env
docker compose up -d postgres redis mailpit
```

Fill the root **.env** before startup. Compose uses it to initialize the
database, starts an ephemeral Redis instance for rate-limit counters, and
captures development email in Mailpit at http://localhost:8025.

### 2. Prepare the server environment

```bash
cd server
cp .env.example .env
```

Keep **POSTGRES_DB**, **POSTGRES_USER**, and **POSTGRES_PASSWORD** equal to the
root **.env** values. Keep **POSTGRES_HOST=localhost** because the JVM connects
through the port published by Compose.

Generate an access-token secret if needed:

```bash
openssl rand -base64 32
```

### 3. Start Spring Boot

From the **server** directory:

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

Spring-Dotenv reads **server/.env**, parses dotenv syntax including optional
quoted values, and exposes it as a low-priority Spring property source. Real
environment variables always win, and a missing file is ignored.

For IDE launches, use the **server** directory as the working directory so the
same file is discovered.

The API is available at http://localhost:8080.

### Full Docker Compose stack

To run the server, PostgreSQL, and Redis as containers, use the root environment
and instructions in the [project README](../README.md#start-the-current-stack).

## OpenAPI documentation

Documentation is available with the **local** and **dev** profiles:

- Swagger UI: http://localhost:8080/docs
- OpenAPI JSON: http://localhost:8080/docs/openapi.json

Both **/docs** and **/docs/** serve the Swagger UI directly. Documentation is
disabled and unreachable in production.

## Environment variables

| Variable                              | Default                 | Notes                                       |
| ------------------------------------- | ----------------------- | ------------------------------------------- |
| SPRING_PROFILES_ACTIVE                | none                    | local, dev, or prod                          |
| POSTGRES_HOST                         | localhost outside prod  | Required explicitly in prod                 |
| POSTGRES_PORT                         | 5432                    | PostgreSQL port                             |
| POSTGRES_DB                           | none                    | Required database name                      |
| POSTGRES_SCHEMA                       | public                  | JDBC current schema                         |
| POSTGRES_USER                         | none                    | Required database user                      |
| POSTGRES_PASSWORD                     | none                    | Required database password                  |
| REDIS_HOST                            | localhost outside prod  | Required explicitly in prod                 |
| REDIS_PORT                            | 6379                    | Redis port                                  |
| REDIS_CONNECT_TIMEOUT                 | 2s                      | Redis connection timeout                    |
| REDIS_TIMEOUT                         | 2s                      | Redis command timeout                       |
| ACCESS_TOKEN_SECRET                   | none                    | Base64 value with at least 32 decoded bytes |
| CORS_ALLOWED_ORIGINS                  | empty; localhost in dev | Comma-separated exact origins               |
| LOG_LEVEL                             | INFO                    | Log level for com.delvex.server             |
| REFRESH_SESSION_CLEANUP_INTERVAL      | 1h                      | Delay between cleanup runs                  |
| REFRESH_SESSION_CLEANUP_INITIAL_DELAY | 1h                      | Delay before the first cleanup              |
| AUTH_RATE_LIMIT_WINDOW                | 1m                      | Fixed rate-limit window                     |
| AUTH_RATE_LIMIT_REGISTER_REQUESTS     | 5                       | Registration attempts per client/window     |
| AUTH_RATE_LIMIT_LOGIN_REQUESTS        | 10                      | Login attempts per client/window            |
| AUTH_RATE_LIMIT_REFRESH_REQUESTS      | 30                      | Refresh attempts per client/window          |
| AUTH_RATE_LIMIT_FORGOT_PASSWORD_REQUESTS | 5                    | Reset email requests per client/window      |
| AUTH_RATE_LIMIT_RESET_PASSWORD_REQUESTS | 10                    | Password changes per client/window          |
| AUTH_RATE_LIMIT_TRUSTED_PROXY_CIDRS   | empty                   | Trusted proxy networks                      |
| PASSWORD_RESET_CLIENT_URL             | local reset page        | Required HTTPS URL in dev and prod           |
| PASSWORD_RESET_TOKEN_TTL              | 30m                     | One-time reset token lifetime               |
| PASSWORD_RESET_CLEANUP_INTERVAL       | 1h                      | Delay between token cleanup runs            |
| PASSWORD_RESET_CLEANUP_INITIAL_DELAY  | 1h                      | Delay before first token cleanup            |
| MAIL_HOST                             | localhost in local       | Local Mailpit host override only             |
| MAIL_PORT                             | 1025 in local            | Local Mailpit port override only             |
| RESEND_API_KEY                        | none                    | Required secret in dev and prod              |
| MAIL_FROM                             | local sender             | Verified public sender in dev and prod       |

There is intentionally no **REFRESH_COOKIE_SECURE** variable. Cookies are
secure by default, disabled only by the local profile, and enforced in hosted
environments.

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
server is reachable only through known reverse proxies, configure their
networks explicitly:

```dotenv
AUTH_RATE_LIMIT_TRUSTED_PROXY_CIDRS="10.0.0.0/8,172.16.0.0/12"
```

The application trusts Forwarded or X-Forwarded-For only when the direct TCP
peer belongs to one of these CIDRs. It walks the forwarded chain from right to
left and selects the first untrusted address.

Do not use **0.0.0.0/0** or **::/0** when the application can also be reached
directly.

Rate-limit counters are stored in Redis and shared by every server instance.
Each key contains the endpoint, a SHA-256 digest of the resolved client address,
and the fixed-window start time. A Lua script increments the counter and assigns
its expiry atomically, so concurrent requests cannot lose increments or leave
keys without a TTL.

Redis is used only for short-lived rate-limit state. Refresh sessions, users,
and shipments remain in PostgreSQL because they require durable, transactional
persistence. If Redis is unavailable, protected authentication endpoints return
HTTP 503 instead of silently bypassing rate limiting.

## Production configuration

Spring uses one explicit profile for each runtime:

| Profile   | Runtime               | Mail transport                  |
| --------- | --------------------- | ------------------------------- |
| **local** | IDE or Docker Compose | Mailpit SMTP on port 1025       |
| **dev**   | Railway Development   | Resend HTTPS API on port 443    |
| **prod**  | Railway Production    | Resend HTTPS API on port 443    |

The **dev** and **prod** profile groups automatically activate the internal
**hosted** profile. Do not set **hosted** directly and never combine **local**
with a hosted profile.

Both Railway environments require the normal database, Redis, authentication,
and CORS variables:

```dotenv
SPRING_PROFILES_ACTIVE="dev"
POSTGRES_HOST="database.internal"
POSTGRES_PORT="5432"
POSTGRES_DB="delvex"
POSTGRES_SCHEMA="public"
POSTGRES_USER="delvex"
POSTGRES_PASSWORD="<secret>"
REDIS_HOST="redis.internal"
REDIS_PORT="6379"
REDIS_CONNECT_TIMEOUT="2s"
REDIS_TIMEOUT="2s"
ACCESS_TOKEN_SECRET="<base64-secret>"
CORS_ALLOWED_ORIGINS="https://dev.example.com"
LOG_LEVEL="INFO"
```

Set **SPRING_PROFILES_ACTIVE=prod** and production URLs in the production
environment. Railway Development and Production each supply only three
email-specific values:

```dotenv
PASSWORD_RESET_CLIENT_URL="https://dev.example.com/reset-password"
RESEND_API_KEY="<Resend API key>"
MAIL_FROM="no-reply@example.com"
```

The hosted profile owns the fixed
[Resend **POST /emails** endpoint](https://resend.com/docs/api-reference/emails/send-email)
and authenticates with **RESEND_API_KEY** as a Bearer token. The endpoint URL is
not configurable, so deployment variables cannot redirect the secret or select
Mailpit. Hosted delivery intentionally uses HTTPS on port 443 because
[Railway permits outbound SMTP only on Pro plans and above](https://docs.railway.com/networking/outbound-networking#email-delivery).

Conversely, the local profile uses Spring Mail and accepts only **localhost**,
**127.0.0.1**, **::1**, or **mailpit** on port **1025**. This prevents an
exported hosted SMTP value from sending a local test message through Resend.
The local profile does not create the Resend API client.

Use a separate Resend API key for Railway Development and Production.
**MAIL_FROM** may be either **no-reply@example.com** or a display-name form such
as **Delvex <no-reply@example.com>**, but its domain must be verified in Resend.
The reset URL must match the public client in the same Railway environment.
Never expose **RESEND_API_KEY** to the client service or commit it to an
environment file.

A successful Resend API response means Resend accepted the message and returns
an email ID. Use the Resend dashboard and domain DNS status to distinguish
accepted, delivered, bounced, and rejected messages. Application logs contain
transport failures, while the forgot-password HTTP response remains 202 to
avoid account enumeration.

The application fails fast when hosted configuration is incomplete or unsafe.
Production additionally rejects:

- the local or dev profile active alongside prod;
- insecure refresh cookies;
- enabled Swagger UI or OpenAPI JSON;
- missing or unsafe CORS origins.

The production image runs as a non-root **delvex** user and exposes port 8080.

Build it from the repository root:

```bash
docker build -t delvex-server ./server
```

## Build and tests

From the **server** directory, run the complete Maven suite:

```bash
./mvnw --batch-mode --no-transfer-progress test
```

Build the executable JAR:

```bash
./mvnw --batch-mode --no-transfer-progress -DskipTests package
java -jar target/server-1.0.0.jar
```

Flyway migrations run automatically at startup. Startup fails if PostgreSQL is
unavailable, a migration fails, or Hibernate detects a schema mismatch.

## Production HTTP smoke

The **ProductionSmokeIT** JUnit test launches the packaged JAR, waits for
readiness, and performs registration, shipment creation and retrieval, refresh
rotation, shipment update, production documentation checks, logout,
revoked-token rejection, and a final readiness check.

The **IT** suffix keeps this external-process scenario out of the regular
Surefire test selection. Run it explicitly after packaging the application. It
requires the **prod** environment, available disposable PostgreSQL and Redis
instances, a free port 8080, and a packaged JAR:

```bash
./mvnw --batch-mode --no-transfer-progress -DskipTests package
./mvnw --batch-mode --no-transfer-progress -Dtest=ProductionSmokeIT test
```

> The test creates real user, shipment, and refresh-session records. Never run
> it against the production database.

| Variable        | Default                     | Purpose                        |
| --------------- | --------------------------- | ------------------------------ |
| SERVER_URL      | http://127.0.0.1:8080       | Base URL used by HTTP requests |
| SERVER_JAR      | first target/server-*.jar   | Explicit JAR path              |
| SERVER_LOG_FILE | target/production-smoke.log | Captured server log            |

## CI

The Server CI workflow runs for backend, Compose, and workflow changes targeting
**dev** and **main**.

- **Maven tests** executes the complete unit and integration suite against
  PostgreSQL and Redis.
- **Production JAR smoke** packages the executable JAR, runs
  **ProductionSmokeIT** with the prod profile, and builds the production image.

Surefire reports and production logs are uploaded only on failure. A skipped
upload step on a successful run is expected.

See [RELEASE.md](../RELEASE.md) for local verification commands and the complete
release checklist.

## Operational notes

- **GET /api/health/live** reports only process liveness.
- **GET /api/health** and **GET /api/health/ready** query PostgreSQL and Redis
  and return HTTP 503 when either required dependency is unavailable.
- Logs include a request ID. A valid incoming X-Request-ID is reused; otherwise
  the server creates one and returns it in the response.
- All routes are authenticated by default. Only explicitly listed health and
  authentication routes are public.
- Flyway migration V7 removes the deferred employee workflow, user roles, and
  branch tables while preserving shipment address snapshots.
- Raw refresh tokens are never returned in JSON.
- Database changes belong in a new Flyway migration.
