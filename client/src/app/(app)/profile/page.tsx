import { ProfilePage } from "@pages/profile";
import { createPageMetadata } from "@shared/config";

export const metadata = createPageMetadata({
  title: "Profile",
  description: "View and update your Delvex account details.",
  path: "/profile",
});

export default function Page() {
  return <ProfilePage />;
}
