import { updateSession } from "@shared/api/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/|.*\\.[^/]+$).*)"],
};
