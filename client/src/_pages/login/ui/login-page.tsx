import { LoginForm } from "@features/auth";

export function LoginPage({
  passwordReset = false,
}: {
  passwordReset?: boolean;
}) {
  return <LoginForm passwordReset={passwordReset} />;
}
