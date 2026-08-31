import { createMetadata } from "@shared/lib";
import { routes } from "@shared/config";
import { RegisterForm } from "@features/auth/register";

export const metadata = createMetadata({
  title: "Create account",
  description: "Create a Delvex account to manage your shipments.",
  path: routes.register,
});

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl leading-tight font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="text-muted-foreground mt-1.5 mb-6 text-sm">
        Track and manage your own shipments in one place.
      </p>

      <RegisterForm />
    </>
  );
}
