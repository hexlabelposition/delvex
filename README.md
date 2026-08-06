# Delvex

[![Server CI](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml/badge.svg?branch=dev)](https://github.com/hexlabelposition/delvex/actions/workflows/server-ci.yml)

Delvex is a logistics platform for managing users and shipments. The current
MVP provides a production-oriented backend with authentication, shipment
lifecycle management, PostgreSQL persistence, operational health checks, and
containerized development. The repository is structured as a monorepo so the
web client can evolve alongside the server.

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
├── client/                     # web client workspace
├── server/                     # Spring Boot API
│   ├── README.md               # complete backend documentation
│   └── .env.example            # standalone backend configuration
├── compose.yaml                # local server and PostgreSQL stack
├── .env.example                # Docker Compose configuration
└── .github/workflows/          # continuous integration
~~~

| Module | Responsibility | Documentation |
| --- | --- | --- |
| **server** | API, authentication, shipments, persistence, and operations | [Server README](server/README.md) |
| **client** | Browser application workspace | Module documentation will be added with the client |
| **compose.yaml** | Local infrastructure and container orchestration | This README |

## Technology overview

- **Server:** Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA,
  Flyway, and springdoc OpenAPI
- **Database:** PostgreSQL 17
- **Infrastructure:** Docker and Docker Compose
- **CI:** GitHub Actions
- **Client:** maintained as a separate monorepo module

## Environment files

Delvex uses separate environment files for separate execution boundaries:

| File | Used by | Purpose |
| --- | --- | --- |
| **/.env** | Docker Compose | Configures PostgreSQL and the containerized server |
| **/server/.env** | Locally running JVM | Configures only the standalone Spring Boot server |

Create each file from the example next to it. Neither real file belongs in Git.

Database name, user, and password are intentionally repeated. When the server
runs on the host against PostgreSQL from Compose, keep **POSTGRES_DB**,
**POSTGRES_USER**, and **POSTGRES_PASSWORD** identical in both files. The
hostnames remain different: Compose uses the internal service name **postgres**,
while the standalone server uses **localhost**.

## Local development

### Prepare the Compose environment

~~~bash
cp .env.example .env
~~~

Choose **dev** as the local profile, replace the database credentials, and
generate an access-token secret:

~~~bash
openssl rand -base64 32
~~~

### Start the current stack

Build and start the server together with PostgreSQL:

~~~bash
docker compose up --build
~~~

The API is available at http://localhost:8080, and PostgreSQL is exposed at
localhost:5432.

### Start only PostgreSQL

~~~bash
docker compose up -d postgres
~~~

This is the recommended infrastructure mode when running the server directly
from the IDE or with the Maven Wrapper. Complete instructions are in the
[server development guide](server/README.md#local-development).

### Stop services

~~~bash
docker compose down
~~~

To delete the local PostgreSQL data volume as well:

~~~bash
docker compose down -v
~~~

> The **-v** option permanently deletes the local database volume.

## CI and releases

Server changes targeting **dev** run Maven tests, package and start the
production JAR against PostgreSQL, execute the real HTTP smoke scenario, and
build the production Docker image.

Delvex currently uses one product version for the monorepo. Stable releases are
tagged from **main** as **v<major>.<minor>.<patch>**.

## Server documentation

See [server/README.md](server/README.md) for API routes, authentication,
configuration variables, OpenAPI, database migrations, testing, production
startup, security, and operational behavior.
