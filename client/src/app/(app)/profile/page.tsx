import { UserEntity } from "@entities/user";
import { getCurrentUser } from "@entities/user/server";
import { routes } from "@shared/config";
import { createMetadata } from "@shared/lib";
import { ProfileView } from "@views/profile";
import { redirect } from "next/navigation";

export const metadata = createMetadata({
  title: "Profile",
  description: "View and update your Delvex account details.",
  path: routes.profile,
});

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.login);
  }

  const userEntity = new UserEntity(user);

  return <ProfileView user={userEntity} />;
}
