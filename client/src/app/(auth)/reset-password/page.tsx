import { ResetPasswordPage } from "@pages/reset-password";
import { createPageMetadata } from "@shared/config";

export const metadata = createPageMetadata({
  title: "Reset password",
  description: "Choose a new password for your Delvex account.",
  path: "/reset-password",
});

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return <ResetPasswordPage token={token} />;
}
