import type { UserEntity } from "@entities/user";
import { formatDate } from "@shared/lib";

export function getDetails(user: UserEntity) {
  return [
    { label: "Email", value: user.email, className: "break-all" },
    {
      label: "User ID",
      value: user.id,
      className: "font-mono text-xs break-all",
    },
    {
      label: "Account created",
      value: formatDate(user.createdAt.toISOString()),
    },
    { label: "Last updated", value: formatDate(user.updatedAt.toISOString()) },
  ];
}
