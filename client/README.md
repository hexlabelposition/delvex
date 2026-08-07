# Delvex Client

[Back to project overview](../README.md)

The Delvex client is the browser application for the logistics dashboard. It is
built with Next.js and communicates with the Spring Boot API provided by the
server module.

## Technology stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Bun
- Docker

## Requirements

- Bun
- Docker with Docker Compose when using the containerized stack

## Environment variables

Create the local client environment from the committed template:

```bash
cp .env.example .env.local
```

| Variable            | Required | Purpose                                                      |
| ------------------- | -------- | ------------------------------------------------------------ |
| NEXT_PUBLIC_API_URL | yes      | Browser-reachable Delvex server URL without a trailing slash |

The default local value is **http://localhost:8080**.

Variables prefixed with **NEXT_PUBLIC_** are exposed to browser code. Never put
credentials, tokens, or other secrets in them. Next.js embeds public variables
during the production build, so changing **NEXT_PUBLIC_API_URL** requires a new
client build or Docker image.

When the complete stack runs in Compose, the browser still connects through
**localhost:8080**. Do not use the internal Docker service name **server** in
this variable because it cannot be resolved by the user's browser.

## Local development

Install the locked dependencies and start the development server:

```bash
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000. The API must be available at the URL configured in
**.env.local**.

To run only PostgreSQL and the API through Compose while keeping Next.js on the
host, start these services from the repository root:

```bash
docker compose up --build server
```

## Checks and production build

Run linting:

```bash
bun run lint
```

Create a production build:

```bash
bun run build
```

The project enables Next.js **standalone** output. The generated
**.next/standalone** directory contains the minimal traced runtime required by
the production image.

## Docker image

The public API URL must be supplied while building because it becomes part of
the browser bundle:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 \
  --tag delvex-client \
  .
```

Run the image:

```bash
docker run --rm --publish 3000:3000 delvex-client
```

The multi-stage image installs dependencies with Bun, builds the standalone
application, and runs the generated server with Node.js as the non-root
**node** user provided by the runtime base image.

Static files from **public** and **.next/static** are copied explicitly because
Next.js does not include them in the standalone directory automatically. The
build stage creates **public** when it is missing, so removing every static
asset from the repository does not break the image build.

## Docker Compose

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Compose builds the client with **NEXT_PUBLIC_API_URL**, waits for the server
readiness check, and exposes the dashboard at http://localhost:3000.

Change the root environment value and rebuild the client whenever the public API
address changes. Compose reuses an existing image even when a build argument
differs, so **docker compose up** alone keeps serving the previous address:

```bash
docker compose build client
docker compose up -d client
```
