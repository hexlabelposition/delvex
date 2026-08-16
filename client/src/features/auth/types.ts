import type { SubmissionResult } from "@conform-to/react";

import type { AuthUser } from "@/lib/api/types";

export interface AuthSession {
  accessToken: string;
  user: AuthUser & { createdAt?: string; updatedAt?: string };
}

export interface AuthFormState {
  submission: SubmissionResult;
  session?: AuthSession;
}
