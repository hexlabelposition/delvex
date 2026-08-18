import type { UserRole } from "@/lib/api/types";

export function homeForRole(role: UserRole) {
  return role === "EMPLOYEE" ? "/employee" : "/dashboard";
}
