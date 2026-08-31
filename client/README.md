# Delvex Client

[Back to project overview](../README.md)

The Delvex client is the Next.js application for the Delvex shipment workspace.
It renders the browser UI and acts as a server-side boundary in front of the
Spring Boot API provided by the server module.

## Technology stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Base UI primitives, Tailwind Variants, and Lucide icons
- Bun 1.3.14
- Docker

## Requirements

- Bun
- Docker with Docker Compose when using the containerized stack

## Environment variables

Create the local client environment from the committed template:

```bash
cp .env.example .env.local
```

| Variable             | Required | Purpose                                                                 |
| -------------------- | -------- | ----------------------------------------------------------------------- |
| API_URL              | yes      | Server URL used by the Next.js server without a trailing slash          |
| NEXT_PUBLIC_SITE_URL | yes      | Client origin for canonical, Open Graph, Twitter, and manifest metadata |

The default local values are <http://localhost:8080> for the API and
<http://localhost:3000> for the client.

Every request to the Delvex server is made server-side, from Server Components
and Server Actions, so only the Next.js process needs to reach the API. Compose
overrides **API_URL** with <http://server:8080> to use the internal network;
the browser never talks to the API directly and therefore needs no public API
address. Should browser-side requests appear later, they would need a public
URL of their own again.

Variables prefixed with **NEXT_PUBLIC_** are exposed to browser code. Never put
credentials, tokens, or other secrets in them. Next.js embeds public variables
during the production build, so changing **NEXT_PUBLIC_SITE_URL** requires a new
client build or Docker image.

## Local development

Install the locked dependencies and start the development server:

```bash
bun install --frozen-lockfile
bun run dev
```

Open <http://localhost:3000>. The API must be available at the URL configured in
**.env.local**.

To run only PostgreSQL and the API through Compose while keeping Next.js on the
host, start these services from the repository root:

```bash
docker compose up --build server
```

## Application routes

| Route                            | Access    | Purpose                                       |
| -------------------------------- | --------- | --------------------------------------------- |
| **/**                            | Public    | Product landing page                          |
| **/login**                       | Guests    | Sign in to an existing account                |
| **/register**                    | Guests    | Create an account                             |
| **/forgot-password**             | Guests    | Request a password reset email                |
| **/reset-password**              | Guests    | Choose a new password from a one-time link    |
| **/dashboard**                   | Signed in | Review shipment activity and recent records   |
| **/shipments**                   | Signed in | Browse owned shipments with pagination        |
| **/shipments/create**            | Signed in | Create a shipment                             |
| **/shipments/[shipmentId]**      | Signed in | Review shipment details and delivery progress |
| **/shipments/[shipmentId]/edit** | Signed in | Edit a shipment that can still be changed     |
| **/profile**                     | Signed in | Update profile and password settings          |

Session routing is enforced in **src/proxy.ts**. Protected routes redirect
anonymous visitors to **/login**, while an active session redirects guest-only
authentication routes to **/dashboard**. The landing page remains public. The
Spring Boot server remains the authorization boundary for every account and
shipment operation.

## Server-side request model

The browser does not call the Spring Boot API directly. Server Components load
page data, and forms invoke Server Actions for authentication, profile changes,
and shipment mutations. Both use the server-only API client under
**src/shared/api**.

Login and registration store the access and refresh tokens in HTTP-only,
same-site cookies. The proxy refreshes a session when the access cookie is
missing, persists rotated tokens, and makes the refreshed session available to
the current server render. Logout attempts to revoke the refresh session and
clears both cookies even when the API is unavailable.

API response bodies are treated as unknown data and parsed at the entity or
feature boundary with Zod. Shipment reads explicitly bypass the fetch cache;
successful mutations invalidate the affected Next.js routes before returning or
redirecting.

## Feature organization

The source tree follows feature-sliced boundaries:

- **src/app** defines App Router pages, layouts, metadata, and server-side page
  composition.
- **src/views** contains page-level dashboard, profile, shipment list, create,
  detail, and edit views.
- **src/widgets** contains larger reusable compositions such as the application
  shell, authentication shell, sidebar, and shipments table.
- **src/features** owns user actions and their forms: authentication, profile
  updates, password changes, shipment creation, editing, and deletion.
- **src/entities** owns user and shipment contracts, Zod schemas, formatting,
  domain calculations, UI representations, and server-only API operations.
- **src/shared** contains the API/session infrastructure, route configuration,
  common schemas and utilities, and the UI kit.

Import public APIs through each slice's **index.ts**. Server-only entity and
shared exports are exposed separately through **server.ts** so browser bundles
cannot accidentally import API credentials or cookie operations.

The shipment list keeps its page and page size in the URL and requests only the
corresponding server page. Creation and editing share the same validated form
schema and fields. New-shipment drafts are stored locally as a convenience; the
server remains the source of truth. Delivery is estimated automatically as five
business days after pickup.

## UI components

Reusable primitives live in **src/shared/ui/src/kit** and are exported through
**src/shared/ui/index.ts**. The kit uses Base UI for accessible behavior,
Tailwind CSS for styling, Tailwind Variants for component variants, and Lucide
for icons. Component-specific variants live in
**src/shared/ui/src/variants**.

Keep generic primitives in the shared kit. Page composition belongs in
**views**, reusable application sections belong in **widgets**, and UI tied to a
user action belongs in the corresponding **feature**.

## Checks and production build

Run the same quality checks used by CI:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

The Client CI workflow runs these checks for client changes targeting **dev**
and **main**. It installs dependencies with `bun install --frozen-lockfile`, uses
the Bun version declared in **.bun-version**, and also builds the production
Docker image. Vitest covers shipment validation and scheduling, dashboard
statistics, pagination, draft persistence, the main shipment views, and sidebar
navigation. Use `bun run test:watch` while developing.

The project enables Next.js **standalone** output. The generated
**.next/standalone** directory contains the minimal traced runtime required by
the production image.

## Docker image

The public site URL must be supplied while building because it becomes part of
the browser bundle:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  --tag delvex-client \
  .
```

Run the image:

```bash
docker run --rm \
  --add-host host.docker.internal:host-gateway \
  --env API_URL=http://host.docker.internal:8080 \
  --publish 3000:3000 \
  delvex-client
```

`API_URL` is a runtime variable and must resolve from inside the client
container. The example reaches an API running on the Docker host. When both
containers share a Docker network, use the API container's service name
instead.

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

Compose builds the client with **NEXT_PUBLIC_SITE_URL**, waits for the server
readiness check, and exposes the dashboard at <http://localhost:3000>.

Change the root environment value and rebuild the client whenever the public
site address changes. Compose reuses an existing image even when a build
argument differs, so **docker compose up** alone keeps serving the previous
address:

```bash
docker compose build client
docker compose up -d client
```
