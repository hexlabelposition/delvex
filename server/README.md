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
- one-time password reset tokens and SMTP email delivery;
- current-user profile retrieval and update;
- shipment creation, pagination, retrieval, update, and deletion;
- CUSTOMER and EMPLOYEE roles carried by signed access tokens;
- ownership checks for customer shipment operations;
- branch-scoped employee shipment listing, filtering, retrieval, and status
  updates;
- auditable shipment status history and optimistic concurrency protection;
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

### Employee endpoints

Every endpoint under **/api/employee/** requires the EMPLOYEE role and an
active branch assignment. A regular authenticated customer or an employee
without an active branch receives HTTP 403.

| Method | Path                                                   | Purpose                            |
| ------ | ------------------------------------------------------ | ---------------------------------- |
| GET    | **/api/employee/shipments**                            | List branch shipments               |
| GET    | **/api/employee/shipments/{shipmentId}**               | Read branch shipment and customer   |
| GET    | **/api/employee/shipments/{shipmentId}/status-events** | Read branch shipment history        |
| PATCH  | **/api/employee/shipments/{shipmentId}/status**        | Perform an allowed branch action    |

The employee list accepts the same **page** and **size** parameters as the
customer list. It can also filter by an exact **status** and a case-insensitive
partial **reference**.

The API derives the branch from the authenticated employee record. It never
accepts a client-provided branch ID. A shipment belongs to both its origin and
destination branches, but each response exposes only the transitions the
current employee may perform through **allowedStatuses**. Direct access to a
shipment outside the employee branch returns HTTP 404.

Send an access token as:

```http
Authorization: Bearer <access-token>
```

The shipment list is zero-based, defaults to 20 entries, accepts a maximum
size of 100, and returns **content**, **page**, **size**, **totalElements**, and
**totalPages**. Results are ordered by creation time descending.

### Shipment lifecycle

| Current status         | Allowed next status           | Responsible branch |
| ---------------------- | ----------------------------- | ------------------ |
| CREATED                | ACCEPTED_AT_ORIGIN, CANCELLED | Origin             |
| ACCEPTED_AT_ORIGIN     | IN_TRANSIT, CANCELLED         | Origin             |
| IN_TRANSIT             | ARRIVED_AT_DESTINATION        | Destination        |
| ARRIVED_AT_DESTINATION | DELIVERED                     | Destination        |
| DELIVERED              | none                          | —                  |
| CANCELLED              | none                          | —                  |

Customers can edit and delete only CREATED shipments; they cannot change
status. Employees perform every lifecycle transition. Sending the current
status again is idempotent and does not create an audit event.

Every employee status request includes the shipment **version** returned by the
API. A stale version returns HTTP 409 instead of silently overwriting a change
made by another employee. Successful transitions append an immutable
**shipment_status_events** record containing the previous and new status,
employee, branch, and timestamp. The shipment **currentBranch** is the origin
before dispatch, null while in transit, and the destination after arrival.

## Authentication

Access tokens are HS256 JWTs with a 15-minute lifetime. The API returns the
access token in the response body. Tokens include a signed **role** claim,
which Spring Security maps to CUSTOMER or EMPLOYEE authority.

Refresh tokens have a 30-day lifetime and are returned only through the
**refresh_token** cookie. The cookie is HttpOnly, SameSite=Lax, scoped to
**/api/auth**, and Secure by default and always in production.

The development profile disables Secure only for local HTTP. Only a SHA-256
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

### Provision an employee

Public registration always creates a CUSTOMER and cannot request another role.
For the first release, employee provisioning is an explicit database
administration operation:

```sql
UPDATE users
SET role = 'EMPLOYEE',
    branch_id = (
        SELECT id
        FROM branches
        WHERE code = 'WROCLAW'
    )
WHERE email = 'employee@example.com';
```

The seeded branch codes are **WARSAW**, **KRAKOW**, **WROCLAW**, and
**GDANSK**. The user must sign in again after promotion so a new access token
contains the EMPLOYEE role. Branch authorization is always loaded from the
database rather than trusted from the JWT. This keeps privilege and branch
assignment outside the public API until a future administrative workflow is
introduced.

## Requirements

- JDK 21
- Docker with Docker Compose
- PostgreSQL and Redis; SMTP is optional outside local Mailpit development

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

Documentation is available only with the **dev** profile:

- Swagger UI: http://localhost:8080/docs
- OpenAPI JSON: http://localhost:8080/docs/openapi.json

Both **/docs** and **/docs/** serve the Swagger UI directly. Documentation is
disabled and unreachable in production.

## Environment variables

| Variable                              | Default                 | Notes                                       |
| ------------------------------------- | ----------------------- | ------------------------------------------- |
| SPRING_PROFILES_ACTIVE                | none                    | Use dev locally or prod when deployed       |
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
| PASSWORD_RESET_CLIENT_URL             | local reset page        | Absolute client reset-page URL              |
| PASSWORD_RESET_TOKEN_TTL              | 30m                     | One-time reset token lifetime               |
| PASSWORD_RESET_CLEANUP_INTERVAL       | 1h                      | Delay between token cleanup runs            |
| PASSWORD_RESET_CLEANUP_INITIAL_DELAY  | 1h                      | Delay before first token cleanup            |
| MAIL_HOST                             | localhost outside prod  | SMTP server; omit in prod to disable mail   |
| MAIL_PORT                             | 1025 outside prod        | SMTP port when delivery is enabled          |
| MAIL_USERNAME                         | empty outside prod       | SMTP username when required                 |
| MAIL_PASSWORD                         | empty outside prod       | SMTP password when required                 |
| MAIL_FROM                             | no-reply@delvex.local    | Sender when delivery is enabled             |
| MAIL_SMTP_AUTH                        | false outside prod       | Enable SMTP authentication                  |
| MAIL_SMTP_STARTTLS                    | false outside prod       | Enable SMTP STARTTLS                        |

There is intentionally no **REFRESH_COOKIE_SECURE** variable. Cookies are
secure by default, disabled only by the development profile, and enforced in
production.

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

Production must use real environment variables rather than a committed or
deployed dotenv file:

```dotenv
SPRING_PROFILES_ACTIVE="prod"
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
CORS_ALLOWED_ORIGINS="https://app.example.com"
PASSWORD_RESET_CLIENT_URL="https://app.example.com/reset-password"
LOG_LEVEL="INFO"
```

SMTP is optional in a deployed environment. Without **MAIL_HOST**, password
reset tokens are still issued, but email delivery is skipped. Local Compose is
unchanged and continues to set **MAIL_HOST=mailpit** automatically.

Configure the following variables when Resend or another SMTP provider is
ready:

```dotenv
MAIL_HOST="smtp.example.com"
MAIL_PORT="587"
MAIL_USERNAME="<smtp-user>"
MAIL_PASSWORD="<smtp-password>"
MAIL_FROM="no-reply@example.com"
MAIL_SMTP_AUTH="true"
MAIL_SMTP_STARTTLS="true"
```

The application fails fast when production configuration is unsafe:

- dev and prod are active together;
- refresh cookies are not secure;
- Swagger UI or OpenAPI JSON is enabled;
- CORS origins are missing or unsafe;
- required database, Redis, or authentication settings are missing or invalid.

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
- Public registration never grants the EMPLOYEE role.
- Existing status history begins with the first transition after Flyway
  migration V4; the migration does not invent events for older shipments.
- Flyway migration V6 creates branches, connects existing shipments to their
  matching seeded origin and destination branches, and renames ACCEPTED to
  ACCEPTED_AT_ORIGIN. Historical status events keep a null branch because V6
  does not invent their execution location.
- Raw refresh tokens are never returned in JSON.
- Database changes belong in a new Flyway migration.
