import { LoginPage } from "@pages/login";
import { createPageMetadata } from "@shared/config";

export const metadata = createPageMetadata({
  title: "Log in",
  description: "Log in to manage your Delvex shipments.",
  path: "/login",
});

export default function Page() {
  return <LoginPage />;
}
