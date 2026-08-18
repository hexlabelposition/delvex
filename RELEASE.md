# Release process

Delvex uses one product version for the server and client. The first complete
release is **1.0.0**. The Maven project version and client package version must
match before a release PR is opened.

## Validation

Server CI and Client CI run for pull requests targeting both **dev** and
**main**. Release validation additionally starts a clean production stack,
applies every Flyway migration, provisions an isolated employee, and executes
the Playwright customer-to-employee shipment lifecycle.

The full-stack job uses generated test credentials only. It runs the server
with the **prod** profile, keeps OpenAPI disabled, verifies Secure refresh
cookies through HTTPS test origins, and removes its database volume after the
run. On failure it uploads service logs, the Playwright report, traces,
screenshots, and videos.

Local CI-equivalent commands are:

```bash
cd server
./mvnw --batch-mode --no-transfer-progress test
./mvnw --batch-mode --no-transfer-progress -DskipTests package
./scripts/production-smoke.sh

cd ../client
bun install --frozen-lockfile
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

The browser flow needs a clean full stack and the variables documented in
[client/README.md](client/README.md#checks-and-production-build). CI supplies
them automatically through isolated placeholder values.

## Prepared PR merge order

1. #43 — employee shipment server workflow;
2. #44 — consolidated shipment client features;
3. #45 — employee workspace;
4. #46 — critical application flow tests;
5. release validation PR.

## Release checklist

1. Merge the prepared PRs into **dev** in the order above.
2. Synchronize local **dev** and confirm Server CI, Client CI, and Release
   validation are green.
3. Confirm `server/pom.xml` and `client/package.json` both contain **1.0.0**.
4. Create the release branch required by the accepted Git Flow, if one is used.
5. Open a release PR from **dev** (or the release branch) to **main**.
6. Wait for every workflow on the **main** PR and review the full-stack logs on
   any failure.
7. Prepare changelog and release notes from the merged PRs.
8. Merge only after final review.
9. Create tag **1.0.0** and the GitHub Release only after explicit owner
   approval.

Do not run the smoke scripts against production data and do not reuse release
validation credentials in a deployment.
