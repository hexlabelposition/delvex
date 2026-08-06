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
- Spring Data JPA
- PostgreSQL 17
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
- current-user profile retrieval and update;
- shipment creation, pagination, retrieval, update, and deletion;
- ownership checks for every shipment operation;
- restricted shipment status transitions;
- consistent JSON errors for validation, malformed JSON, security, and domain
  failures;
- configurable CORS and application logging;
- authentication rate limiting with trusted-proxy client IP resolution;
- separate liveness and database-backed readiness checks;
- development-only Swagger UI and OpenAPI JSON;
- secure-by-default production profile;
- real HTTP smoke flow against a packaged production JAR and PostgreSQL.

## Module structure

~~~text
server/
├── .env.example                      # standalone JVM configuration
├── Dockerfile                        # multi-stage production image
├── pom.xml
├── mvnw
├── scripts/
│   └── production-smoke.sh           # real HTTP smoke scenario
└── src/
    ├── main/
    │   ├── java/                     # application source
    │   └── resources/
    │       ├── application.yaml
    │       ├── application-dev.yaml
    │       ├── application-prod.yaml
    │       └── db/migration/         # Flyway migrations
    └── test/java/                    # unit and integration tests
~~~

Controllers handle HTTP concerns, services contain transactional business
logic, repositories provide persistence, and Flyway is the only source of
schema changes. Hibernate uses **ddl-auto: validate** and never creates or
modifies the production schema.

## API overview

### Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | **/api/health/live** | Process liveness |
| GET | **/api/health** | Database-backed readiness |
| GET | **/api/health/ready** | Database-backed readiness |
| POST | **/api/auth/register** | Register and issue tokens |
| POST | **/api/auth/login** | Authenticate and issue tokens |
| POST | **/api/auth/refresh** | Rotate the refresh session |
| POST | **/api/auth/logout** | Revoke the refresh session |

### Protected endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | **/api/users/me** | Read the current profile |
| PATCH | **/api/users/me** | Update the current profile |
| POST | **/api/shipments** | Create a shipment |
| GET | **/api/shipments?page=0&size=20** | List owned shipments |
| GET | **/api/shipments/{shipmentId}** | Read an owned shipment |
| PATCH | **/api/shipments/{shipmentId}** | Update an owned shipment |
| DELETE | **/api/shipments/{shipmentId}** | Delete an allowed shipment |

Send an access token as:

~~~http
Authorization: Bearer <access-token>
~~~

The shipment list is zero-based, defaults to 20 entries, accepts a maximum
size of 100, and returns **content**, **page**, **size**, **totalElements**, and
**totalPages**. Results are ordered by creation time descending.

### Shipment lifecycle

| Current status | Allowed next status |
| --- | --- |
| CREATED | IN_TRANSIT, CANCELLED |
| IN_TRANSIT | DELIVERED, CANCELLED |
| DELIVERED | none |
| CANCELLED | none |

Sending the current status again is idempotent. Only CREATED and CANCELLED
shipments can be deleted.

## Authentication

Access tokens are HS256 JWTs with a 15-minute lifetime. The API returns the
access token in the response body.

Refresh tokens have a 30-day lifetime and are returned only through the
**refresh_token** cookie. The cookie is HttpOnly, SameSite=Lax, scoped to
**/api/auth**, and Secure by default and always in production.

The development profile disables Secure only for local HTTP. Only a SHA-256
digest of each refresh token is stored in PostgreSQL. Refreshing revokes the
current session and creates a replacement in the same transaction. Logout is
idempotent, and expired or revoked sessions are removed by a scheduled cleanup
job.

## Requirements

- JDK 21
- Docker with Docker Compose
- Bash
- curl and jq only for the production smoke script

A system Maven installation is not required.

## Local development

The recommended backend workflow runs PostgreSQL in Docker and Spring Boot
directly on the host.

### 1. Prepare PostgreSQL

From the repository root:

~~~bash
cp .env.example .env
docker compose up -d postgres
~~~

Fill the root **.env** before startup. Compose uses it to initialize the
database.

### 2. Prepare the server environment

~~~bash
cd server
cp .env.example .env
~~~

Keep **POSTGRES_DB**, **POSTGRES_USER**, and **POSTGRES_PASSWORD** equal to the
root **.env** values. Keep **POSTGRES_HOST=localhost** because the JVM connects
through the port published by Compose.

Generate an access-token secret if needed:

~~~bash
openssl rand -base64 32
~~~

### 3. Start Spring Boot

From the **server** directory:

~~~bash
chmod +x mvnw
./mvnw spring-boot:run
~~~

Spring-Dotenv reads **server/.env**, parses dotenv syntax including optional
quoted values, and exposes it as a low-priority Spring property source. Real
environment variables always win, and a missing file is ignored.

For IDE launches, use the **server** directory as the working directory so the
same file is discovered.

The API is available at http://localhost:8080.

### Full Docker Compose stack

To run both the server and PostgreSQL as containers, use the root environment
and instructions in the [project README](../README.md#start-the-current-stack).

## OpenAPI documentation

Documentation is available only with the **dev** profile:

- Swagger UI: http://localhost:8080/docs
- OpenAPI JSON: http://localhost:8080/docs/openapi.json

Both **/docs** and **/docs/** serve the Swagger UI directly. Documentation is
disabled and unreachable in production.

## Environment variables

| Variable | Default | Notes |
| --- | --- | --- |
| SPRING_PROFILES_ACTIVE | none | Use dev locally or prod when deployed |
| POSTGRES_HOST | localhost outside prod | Required explicitly in prod |
| POSTGRES_PORT | 5432 | PostgreSQL port |
| POSTGRES_DB | none | Required database name |
| POSTGRES_SCHEMA | public | JDBC current schema |
| POSTGRES_USER | none | Required database user |
| POSTGRES_PASSWORD | none | Required database password |
| ACCESS_TOKEN_SECRET | none | Base64 value with at least 32 decoded bytes |
| CORS_ALLOWED_ORIGINS | empty; localhost in dev | Comma-separated exact origins |
| LOG_LEVEL | INFO | Log level for com.delvex.server |
| REFRESH_SESSION_CLEANUP_INTERVAL | 1h | Delay between cleanup runs |
| REFRESH_SESSION_CLEANUP_INITIAL_DELAY | 1h | Delay before the first cleanup |
| AUTH_RATE_LIMIT_WINDOW | 1m | Fixed rate-limit window |
| AUTH_RATE_LIMIT_REGISTER_REQUESTS | 5 | Registration attempts per client/window |
| AUTH_RATE_LIMIT_LOGIN_REQUESTS | 10 | Login attempts per client/window |
| AUTH_RATE_LIMIT_REFRESH_REQUESTS | 30 | Refresh attempts per client/window |
| AUTH_RATE_LIMIT_TRUSTED_PROXY_CIDRS | empty | Trusted proxy networks |

There is intentionally no **REFRESH_COOKIE_SECURE** variable. Cookies are
secure by default, disabled only by the development profile, and enforced in
production.

## CORS in production

The production profile fails during startup unless at least one valid HTTPS
origin is configured. Wildcards, HTTP origins, localhost, user information,
paths, queries, and fragments are rejected.

Correct:

~~~dotenv
CORS_ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"
~~~

Incorrect:

~~~dotenv
CORS_ALLOWED_ORIGINS="*"
CORS_ALLOWED_ORIGINS="http://app.example.com"
CORS_ALLOWED_ORIGINS="https://app.example.com/path"
~~~

Do not include a trailing slash because an origin consists only of scheme,
host, and optional port.

## Trusted proxies and client IPs

Forwarded headers are ignored by default because clients can forge them. If the
server is reachable only through known reverse proxies, configure their
networks explicitly:

~~~dotenv
AUTH_RATE_LIMIT_TRUSTED_PROXY_CIDRS="10.0.0.0/8,172.16.0.0/12"
~~~

The application trusts Forwarded or X-Forwarded-For only when the direct TCP
peer belongs to one of these CIDRs. It walks the forwarded chain from right to
left and selects the first untrusted address.

Do not use **0.0.0.0/0** or **::/0** when the application can also be reached
directly.

The MVP rate limiter is maintained in memory per application instance and
resets when the process restarts. Multi-instance deployments should use a
shared store or enforce limits at the gateway.

## Production configuration

Production must use real environment variables rather than a committed or
deployed dotenv file:

~~~dotenv
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
~~~

The application fails fast when production configuration is unsafe:

- dev and prod are active together;
- refresh cookies are not secure;
- Swagger UI or OpenAPI JSON is enabled;
- CORS origins are missing or unsafe;
- required database or authentication settings are missing or invalid.

The production image runs as a non-root **delvex** user and exposes port 8080.

Build it from the repository root:

~~~bash
docker build -t delvex-server ./server
~~~

## Build and tests

From the **server** directory, run the complete Maven suite:

~~~bash
./mvnw --batch-mode --no-transfer-progress test
~~~

Build the executable JAR:

~~~bash
./mvnw --batch-mode --no-transfer-progress -DskipTests package
java -jar target/server-1.0.0.jar
~~~

Flyway migrations run automatically at startup. Startup fails if PostgreSQL is
unavailable, a migration fails, or Hibernate detects a schema mismatch.

## Production HTTP smoke

The smoke script launches the packaged JAR, waits for readiness, and performs
registration, shipment creation and retrieval, refresh rotation, shipment
update, production documentation checks, logout, revoked-token rejection, and
a final readiness check.

It requires the **prod** environment, an available disposable PostgreSQL
database, a free port 8080, and a packaged JAR:

~~~bash
./mvnw --batch-mode --no-transfer-progress -DskipTests package
bash scripts/production-smoke.sh
~~~

> The script creates real user, shipment, and refresh-session records. Never
> run it against the production database.

| Variable | Default | Purpose |
| --- | --- | --- |
| SERVER_URL | http://127.0.0.1:8080 | Base URL used by HTTP requests |
| SERVER_JAR | first target/server-*.jar | Explicit JAR path |
| SERVER_LOG_FILE | target/production-smoke.log | Captured server log |

## CI

The Server CI workflow runs for backend, Compose, and workflow changes targeting
**dev**.

- **Maven tests** executes the complete unit and integration suite against
  PostgreSQL.
- **Production JAR smoke** packages the executable JAR, starts it with the prod
  profile, performs the real HTTP scenario, and builds the production image.

Surefire reports and production logs are uploaded only on failure. A skipped
upload step on a successful run is expected.

## Operational notes

- **GET /api/health/live** reports only process liveness.
- **GET /api/health** and **GET /api/health/ready** query PostgreSQL and return
  HTTP 503 when the database is unavailable.
- Logs include a request ID. A valid incoming X-Request-ID is reused; otherwise
  the server creates one and returns it in the response.
- All routes are authenticated by default. Only explicitly listed health and
  authentication routes are public.
- Raw refresh tokens are never returned in JSON.
- Database changes belong in a new Flyway migration.
