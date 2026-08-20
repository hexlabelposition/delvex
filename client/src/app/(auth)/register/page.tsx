import { RegisterPage } from "@pages/register";
import { createPageMetadata } from "@shared/config";

export const metadata = createPageMetadata({
  title: "Create account",
  description: "Create a Delvex account to manage your shipments.",
  path: "/register",
});

export default function Page() {
  return <RegisterPage />;
}
