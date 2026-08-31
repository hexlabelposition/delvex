# Delvex

[![Server CI](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml/badge.svg?branch=dev)](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml)
[![Client CI](https://github.com/hexlabelposition/delvex/actions/workflows/client-ci.yml/badge.svg?branch=dev)](https://github.com/hexlabelposition/delvex/actions/workflows/client-ci.yml)

Delvex is a logistics platform for managing users and shipments. The current
MVP provides a production-oriented backend with authentication, shipment
lifecycle management, PostgreSQL persistence, Redis-backed rate limiting,
operational health checks, and a Next.js web client workspace. The repository is structured as a monorepo and
supports a complete containerized development stack.

## Product capabilities

- public landing page with login and registration entry points;
- user registration, login, password recovery, token refresh, and logout;
- current-user profile management;
- shipment creation, pagination, retrieval, update, and deletion;
- persisted origin and destination branches with shipment address snapshots;
- enforced shipment ownership and optimistic locking;
- consistent validation, security, and domain errors;
- development OpenAPI documentation;
- production-oriented security, health checks, and configuration validation.

## Repository structure

```text
.
├── client/                     # Next.js web client
│   ├── README.md               # client development and container guide
│   └── .env.example            # standalone client configuration
├── server/                     # Spring Boot API
│   ├── README.md               # complete backend documentation
│   └── .env.example            # standalone backend configuration
├── compose.yaml                # application, data, and local email stack
├── .env.example                # Docker Compose configuration
└── .github/workflows/          # continuous integration
```

| Module           | Responsibility                                              | Documentation                     |
| ---------------- | ----------------------------------------------------------- | --------------------------------- |
| **client**       | Browser dashboard and server integration                    | [Client README](client/README.md) |
| **server**       | API, authentication, shipments, persistence, and operations | [Server README](server/README.md) |
| **compose.yaml** | Local infrastructure and container orchestration            | This README                       |

## Technology overview

- **Client:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Bun
- **Server:** Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA,
  Flyway, and springdoc OpenAPI
- **Data:** PostgreSQL 17 for durable data and Redis 8 for rate-limit counters
- **Email:** Mailpit captures password reset messages locally; hosted runtimes
  deliver them through the Resend HTTPS API
- **Infrastructure:** Docker and Docker Compose
- **CI:** GitHub Actions

## Environment files

Delvex uses separate environment files for separate execution boundaries:

| File                   | Used by                 | Purpose                                                   |
| ---------------------- | ----------------------- | --------------------------------------------------------- |
| **/.env**              | Docker Compose          | Configures PostgreSQL, server, and the client image build |
| **/server/.env**       | Locally running JVM     | Configures the standalone Spring Boot server              |
| **/client/.env.local** | Locally running Next.js | Configures the standalone client                          |

Create each file from the example next to it. None of the real environment files
belongs in Git.

Database name, user, and password are intentionally repeated. When the server
runs on the host against PostgreSQL from Compose, keep **POSTGRES_DB**,
**POSTGRES_USER**, and **POSTGRES_PASSWORD** identical in the root and server
environment files. The hostnames remain different: Compose uses the internal
service name **postgres**, while the standalone server uses **localhost**.

**NEXT_PUBLIC_SITE_URL** is intentionally present in both the root and client
templates. The root value is embedded into the Compose client image, while
**client/.env.local** is used by a Next.js process running on the host. The site
URL supplies canonical and social-preview metadata. Public Next.js variables are
visible in the browser and must never contain secrets. The API is reached only
from the Next.js server through **API_URL**, so no public API address is
needed.

**NODE_ENV** in the root file applies only to the running client container and
stays **production**. The client image contains a production build, so a
development value would disable optimizations without providing hot reload.
Use the standalone Bun workflow from the [client guide](client/README.md#local-development)
for that instead.

## Local development

### Prepare the Compose environment

```bash
cp .env.example .env
```

The template selects the **local** server profile. Replace the database credentials,
set the browser-reachable API URL, and generate an access-token secret:

```bash
openssl rand -base64 32
```

### Start the complete stack

Build and start the client, server, and PostgreSQL:

```bash
docker compose up --build
```

The services are available at:

- client: http://localhost:3000
- API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Mailpit: http://localhost:8025

The client waits for server readiness, and the server waits for PostgreSQL and
Redis readiness. Password reset email is captured by Mailpit instead of being
sent to a real mailbox. Mailpit is intentionally local-only and is not part of
hosted Railway environments.

### Start only infrastructure

```bash
docker compose up -d postgres redis mailpit
```

This is the recommended infrastructure mode when running both application
modules directly on the host.

### Start infrastructure and the server

```bash
docker compose up --build server
```

Use this mode when running the Next.js client directly with Bun. Complete
module-specific instructions are available in the
[client guide](client/README.md#local-development) and
[server guide](server/README.md#local-development).

### Stop services

```bash
docker compose down
```

To delete the local PostgreSQL data volume as well:

```bash
docker compose down -v
```

> The **-v** option permanently deletes the local database volume.

## Container builds

Build the production images independently from the repository root:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  --tag delvex-client \
  ./client

docker build --tag delvex-server ./server
```

The client uses Next.js standalone output and runs as a non-root user. Public
**NEXT_PUBLIC_** values are fixed during the client build, so rebuild the image
when the public site URL changes.

Compose does not rebuild an existing image when a build argument changes, so
editing **NEXT_PUBLIC_SITE_URL** in the root **.env** has no effect on a plain
**docker compose up**. Rebuild the client explicitly:

```bash
docker compose up --build client
```

## Runtime environments

The Spring profiles map directly to the three execution environments:

| Profile   | Runtime                | Email delivery          |
| --------- | ---------------------- | ----------------------- |
| **local** | IDE or Docker Compose  | Mailpit over SMTP       |
| **dev**   | Railway Development    | Resend over HTTPS       |
| **prod**  | Railway Production     | Resend over HTTPS       |

The hosted profiles call the fixed Resend **POST /emails** API over HTTPS.
Each Railway environment supplies only its own **RESEND_API_KEY**,
**MAIL_FROM**, **PASSWORD_RESET_CLIENT_URL**, and the existing infrastructure
variables. Local development never reads the Resend secret, and the local
profile rejects non-Mailpit SMTP hosts.

See the
[server production configuration](server/README.md#production-configuration)
for the complete hosted environment contract.

## CI and releases

Server changes targeting **dev** or **main** run Maven tests, package and start the
production JAR against PostgreSQL and Redis, execute the real HTTP smoke
scenario, and build the production server image.

Client changes targeting **dev** or **main** install the locked Bun dependencies,
verify Prettier formatting, run ESLint, TypeScript, unit, and component tests,
discover the Playwright suite, create the production Next.js build, and build
the production client image.
Server and client workflows use path filters, so unchanged modules do not run
unnecessary jobs.

See [RELEASE.md](RELEASE.md) for local verification commands and the final
**1.0.0** checklist.

Delvex currently uses one product version for the monorepo. Stable releases are
tagged from **main** as **<major>.<minor>.<patch>**.

## Module documentation

See [client/README.md](client/README.md) for client environment, Bun commands,
standalone output, and container usage.

See [server/README.md](server/README.md) for API routes, authentication,
configuration variables, OpenAPI, database migrations, testing, production
startup, security, and operational behavior.
