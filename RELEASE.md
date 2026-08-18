# Release process

Delvex uses one product version for the server and client. The first complete
release is **1.0.0**. The Maven project version and client package version must
match before a release PR is opened.

## Validation

Server CI and Client CI run for pull requests targeting both **dev** and
**main**. Together they cover server tests, the production JAR HTTP smoke,
client formatting, linting, type checking, unit and component tests, production
builds, and both container images.

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

The optional browser flow needs a clean, isolated full stack and the variables
documented in
[client/README.md](client/README.md#checks-and-production-build).

## Release checklist

1. Merge the prepared PRs into **dev** in the order above.
2. Synchronize local **dev** and confirm Server CI and Client CI are green.
3. Confirm `server/pom.xml` and `client/package.json` both contain **1.0.0**.
4. Create the release branch required by the accepted Git Flow, if one is used.
5. Open a release PR from **dev** (or the release branch) to **main**.
6. Wait for every workflow on the **main** PR and review its logs on any
   failure.
7. Prepare changelog and release notes from the merged PRs.
8. Merge only after final review.
9. Create tag **1.0.0** and the GitHub Release only after explicit owner
   approval.

Do not run the smoke scripts against production data.
