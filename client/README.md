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
- shadcn/ui with Base UI and Lucide icons
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
| API_URL              | yes      | Server URL used by Server Actions without a trailing slash              |
| NEXT_PUBLIC_API_URL  | yes      | Browser-reachable Delvex server URL without a trailing slash            |
| NEXT_PUBLIC_SITE_URL | yes      | Client origin for canonical, Open Graph, Twitter, and manifest metadata |

The default local values are **http://localhost:8080** for the API and
**http://localhost:3000** for the client.

For standalone development, both variables point to **http://localhost:8080**.
Compose overrides **API_URL** with **http://server:8080** so Server Actions can
reach Spring Boot through the internal network, while the public URL remains
browser-reachable.

Variables prefixed with **NEXT_PUBLIC_** are exposed to browser code. Never put
credentials, tokens, or other secrets in them. Next.js embeds public variables
during the production build, so changing **NEXT_PUBLIC_API_URL** or
**NEXT_PUBLIC_SITE_URL** requires a new client build or Docker image.

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

## Application routes

| Route                | Access    | Purpose                                                      |
| -------------------- | --------- | ------------------------------------------------------------ |
| **/**                | Public    | Product landing page; active sessions continue to their home |
| **/login**           | Guests    | Sign in to an existing account                               |
| **/register**        | Guests    | Create a customer account                                    |
| **/forgot-password** | Guests    | Request a password reset email                               |
| **/reset-password**  | Guests    | Choose a new password from a one-time link                   |
| **/dashboard**       | CUSTOMER  | Review customer shipment activity and recent records         |
| **/shipments**       | CUSTOMER  | Browse and manage owned shipments                            |
| **/create**          | CUSTOMER  | Create a shipment                                            |
| **/employee**        | EMPLOYEE  | Operate the assigned branch queue with scan-first search      |
| **/profile**         | Signed in | Review and update the current profile                        |

Authentication routing is enforced in **src/proxy.ts**. Guests can open the
landing page, login, registration, and password recovery routes. An active
refresh session sends guest-only auth routes into the application, while
protected routes send guests to login. After session refresh, role-aware routing
sends customers to **/dashboard** and employees to **/employee**. The server
remains the authorization boundary and returns HTTP 403 when a token has the
wrong role.

## Feature organization

Route files in **src/app** coordinate navigation, session state, and page-level
loading or error handling. Domain code lives next to the feature that owns it:

- **src/features/shipments** contains shipment API calls, form validation and
  fields, table and status components, display formatting, and location data.
- **src/features/employee** contains the branch shipment queue, lifecycle
  actions, and status-history integration used by logistics employees.
- **src/features/profile** contains profile-specific API calls.
- **src/features/auth** owns authentication, password recovery, session
  management, and auth forms.
- **src/components** contains reusable application and UI primitives.
- **src/lib** contains cross-feature API infrastructure, shared types, and
  generic formatting helpers.

The create and edit routes use the same shipment form schema, field renderer,
and server-field-error mapping. Keep shipment-specific behavior in that feature
module so later customer and employee surfaces can reuse it without duplicating
validation or API contracts.

Customer pages and employee operations share the session provider but render
through separate shells. **AppShell** keeps the customer dashboard navigation,
while **EmployeeShell** exposes the assigned branch, a compact operations
navigation, and a denser desktop/tablet-first work area. This keeps the two
business processes visually separate without duplicating authentication.

The employee queue keeps filters in the URL and is rendered on the server. Its
reference input receives initial focus so a keyboard-wedge barcode scanner can
submit a shipment reference with Enter without a scanner SDK. Exact-status queue
shortcuts, branch context, and row-level actions reduce navigation during normal
counter work. The detail page remains available for the complete customer,
route, cargo, schedule, and audit context.

The employee workspace uses the version returned with each shipment when it
updates a status. The server derives the employee branch from the authenticated
account and returns only branch-allowed actions in **allowedStatuses**; the
client never derives authorization from the selected queue. A conflict response
means another employee changed the record; reload the shipment before retrying.
Every successful transition is displayed from the immutable server status
history, including the acting branch when it is available.

## UI components

The client uses shadcn/ui with the compact **Nova** style, **Base UI**
primitives, an **olive** base color, Lucide icons, and CSS variables for
theming. These choices are recorded in **components.json** so the CLI generates
components that match the existing UI foundation.

Run the shadcn CLI from the **client** directory to add a component:

```bash
bunx shadcn@latest add input
```

Generated components are placed in **src/components/ui**. Add components only
when a feature needs them so the repository does not accumulate unused UI code.
The existing **Button** component verifies the configured generation workflow.

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
and **main**.
It installs dependencies with `bun install --frozen-lockfile`, uses the Bun
version declared in **.bun-version**, and then builds the production Docker
image. Vitest covers shipment form validation, authentication and role routing,
employee status transitions, API error handling and filters, navigation, and
critical loading states. Use `bun run test:watch` while developing.

The Playwright critical-flow scenario is prepared for a running full stack. It
requires a clean test environment and a pre-provisioned employee account:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 \
E2E_API_BASE_URL=http://127.0.0.1:8080 \
E2E_ORIGIN_EMPLOYEE_EMAIL=origin-employee@example.test \
E2E_ORIGIN_EMPLOYEE_PASSWORD=test-password \
E2E_DESTINATION_EMPLOYEE_EMAIL=destination-employee@example.test \
E2E_DESTINATION_EMPLOYEE_PASSWORD=test-password \
bun run test:e2e
```

The browser scenario registers a customer, creates a shipment, completes the
lifecycle through employees assigned to its origin and destination branches,
verifies the customer-visible final status, and checks both the employee route
and API authorization boundary. Start PostgreSQL, the production server, and
the production client in an isolated test environment before invoking it.

When the browser flow uses the prod profile, use generated HTTPS test origins
because Secure refresh cookies and an explicit HTTPS CORS origin are required.
Set `PLAYWRIGHT_IGNORE_HTTPS_ERRORS=true` only for an isolated local gateway
using a disposable self-signed certificate; never disable TLS verification for
a deployed environment.

The project enables Next.js **standalone** output. The generated
**.next/standalone** directory contains the minimal traced runtime required by
the production image.

## Docker image

The public API URL must be supplied while building because it becomes part of
the browser bundle:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
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

Compose builds the client with **NEXT_PUBLIC_API_URL** and
**NEXT_PUBLIC_SITE_URL**, waits for the server readiness check, and exposes the
dashboard at http://localhost:3000.

Change the root environment value and rebuild the client whenever the public API
address changes. Compose reuses an existing image even when a build argument
differs, so **docker compose up** alone keeps serving the previous address:

```bash
docker compose build client
docker compose up -d client
```
