import { createMetadata } from "@shared/lib";
import { routes } from "@shared/config";
import { ResetPasswordForm } from "@features/auth/reset-password";

export const metadata = createMetadata({
  title: "Reset password",
  description: "Choose a new password for your Delvex account.",
  path: routes.resetPassword,
});

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <>
      <h1 className="text-2xl leading-tight font-semibold tracking-tight">
        Choose a new password
      </h1>
      <p className="text-muted-foreground mt-1.5 mb-6 text-sm">
        Use a new password that you don&apos;t use elsewhere.
      </p>

      <ResetPasswordForm token={token} />
    </>
  );
}
