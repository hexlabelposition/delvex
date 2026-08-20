import { LoginPage } from "@pages/login";
import { createPageMetadata } from "@shared/config";

export const metadata = createPageMetadata({
  title: "Log in",
  description: "Log in to manage your Delvex shipments.",
  path: "/login",
});

interface PageProps {
  searchParams: Promise<{ passwordReset?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { passwordReset } = await searchParams;

  return <LoginPage passwordReset={passwordReset === "success"} />;
}
