// Server-only entry point for the auth slice. Kept apart from `index.ts` so a
// client component importing the slice never pulls `next/headers` into its
// bundle.
export { getSession, requireSession } from "./api/session";
