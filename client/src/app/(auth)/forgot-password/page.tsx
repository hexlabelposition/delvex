import { createMetadata } from "@shared/lib";
import { routes } from "@shared/config";
import { ForgotPasswordForm } from "@features/auth/forgot-password";

export const metadata = createMetadata({
  title: "Forgot password",
  description: "Request a secure Delvex password reset link.",
  path: routes.forgotPassword,
});

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl leading-tight font-semibold tracking-tight">
        Reset your password
      </h1>
      <p className="text-muted-foreground mt-1.5 mb-6 text-sm">
        Enter your email and we&apos;ll send you a secure reset link.
      </p>

      <ForgotPasswordForm />
    </>
  );
}
