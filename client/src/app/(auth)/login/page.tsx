import { createMetadata } from "@shared/lib";
import { routes } from "@shared/config";
import { LoginForm } from "@features/auth/login";

export const metadata = createMetadata({
  title: "Log in",
  description: "Log in to manage your Delvex shipments.",
  path: routes.login,
});

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl leading-tight font-semibold tracking-tight">
        Sign in to Delvex
      </h1>
      <p className="text-muted-foreground mt-1.5 mb-6 text-sm">
        Enter your email and password to continue.
      </p>

      <LoginForm />
    </>
  );
}
