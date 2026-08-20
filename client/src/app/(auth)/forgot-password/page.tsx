import { ForgotPasswordPage } from "@pages/forgot-password";
import { createPageMetadata } from "@shared/config";

export const metadata = createPageMetadata({
  title: "Forgot password",
  description: "Request a secure Delvex password reset link.",
  path: "/forgot-password",
});

export default function Page() {
  return <ForgotPasswordPage />;
}
