# Delvex

[![Server CI](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml/badge.svg?branch=dev)](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml)

Delvex is a logistics platform for managing users and shipments. The current
MVP provides a production-oriented backend with authentication, shipment
lifecycle management, PostgreSQL persistence, operational health checks, and a
Next.js web client workspace. The repository is structured as a monorepo and
supports a complete containerized development stack.

## Product capabilities

- user registration, login, token refresh, and logout;
- current-user profile management;
- shipment creation, pagination, retrieval, update, and deletion;
- enforced shipment ownership and lifecycle transitions;
- consistent validation, security, and domain errors;
- development OpenAPI documentation;
- production-oriented security, health checks, and configuration validation.

## Repository structure

~~~text
.
├── client/                     # Next.js web client
│   ├── README.md               # client development and container guide
│   └── .env.example            # standalone client configuration
├── server/                     # Spring Boot API
│   ├── README.md               # complete backend documentation
│   └── .env.example            # standalone backend configuration
├── compose.yaml                # client, server, and PostgreSQL stack
├── .env.example                # Docker Compose configuration
└── .github/workflows/          # continuous integration
~~~

| Module | Responsibility | Documentation |
| --- | --- | --- |
| **client** | Browser dashboard and server integration | [Client README](client/README.md) |
| **server** | API, authentication, shipments, persistence, and operations | [Server README](server/README.md) |
| **compose.yaml** | Local infrastructure and container orchestration | This README |

## Technology overview

- **Client:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Bun
- **Server:** Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA,
  Flyway, and springdoc OpenAPI
- **Database:** PostgreSQL 17
- **Infrastructure:** Docker and Docker Compose
- **CI:** GitHub Actions

## Environment files

Delvex uses separate environment files for separate execution boundaries:

| File | Used by | Purpose |
| --- | --- | --- |
| **/.env** | Docker Compose | Configures PostgreSQL, server, and the client image build |
| **/server/.env** | Locally running JVM | Configures the standalone Spring Boot server |
| **/client/.env.local** | Locally running Next.js | Configures the standalone client |

Create each file from the example next to it. None of the real environment files
belongs in Git.

Database name, user, and password are intentionally repeated. When the server
runs on the host against PostgreSQL from Compose, keep **POSTGRES_DB**,
**POSTGRES_USER**, and **POSTGRES_PASSWORD** identical in the root and server
environment files. The hostnames remain different: Compose uses the internal
service name **postgres**, while the standalone server uses **localhost**.

**NEXT_PUBLIC_API_URL** is also intentionally present in both the root and
client templates. The root value is embedded into the Compose client image,
while **client/.env.local** is used by a Next.js process running on the host.
Public Next.js variables are visible in the browser and must never contain
secrets.

## Local development

### Prepare the Compose environment

~~~bash
cp .env.example .env
~~~

Choose **dev** as the local server profile, replace the database credentials,
set the browser-reachable API URL, and generate an access-token secret:

~~~bash
openssl rand -base64 32
~~~

### Start the complete stack

Build and start the client, server, and PostgreSQL:

~~~bash
docker compose up --build
~~~

The services are available at:

- client: http://localhost:3000
- API: http://localhost:8080
- PostgreSQL: localhost:5432

The client waits for server readiness, and the server waits for PostgreSQL
readiness.

### Start only PostgreSQL

~~~bash
docker compose up -d postgres
~~~

This is the recommended infrastructure mode when running both application
modules directly on the host.

### Start PostgreSQL and the server

~~~bash
docker compose up --build server
~~~

Use this mode when running the Next.js client directly with Bun. Complete
module-specific instructions are available in the
[client guide](client/README.md#local-development) and
[server guide](server/README.md#local-development).

### Stop services

~~~bash
docker compose down
~~~

To delete the local PostgreSQL data volume as well:

~~~bash
docker compose down -v
~~~

> The **-v** option permanently deletes the local database volume.

## Container builds

Build the production images independently from the repository root:

~~~bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 \
  --tag delvex-client \
  ./client

docker build --tag delvex-server ./server
~~~

The client uses Next.js standalone output and runs as a non-root user. Public
**NEXT_PUBLIC_** values are fixed during the client build, so rebuild the image
when the public API URL changes.

## CI and releases

Server changes targeting **dev** run Maven tests, package and start the
production JAR against PostgreSQL, execute the real HTTP smoke scenario, and
build the production server image.

Delvex currently uses one product version for the monorepo. Stable releases are
tagged from **main** as **v<major>.<minor>.<patch>**.

## Module documentation

See [client/README.md](client/README.md) for client environment, Bun commands,
standalone output, and container usage.

See [server/README.md](server/README.md) for API routes, authentication,
configuration variables, OpenAPI, database migrations, testing, production
startup, security, and operational behavior.
