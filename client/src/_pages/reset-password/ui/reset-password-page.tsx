import { ResetPasswordForm } from "@features/auth";

export function ResetPasswordPage({ token }: { token?: string }) {
  return <ResetPasswordForm token={token} />;
}
