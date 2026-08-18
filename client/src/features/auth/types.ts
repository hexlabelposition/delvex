import type { SubmissionResult } from "@conform-to/react";

import type { UserResponse } from "@/lib/api/types";

export interface AuthSession {
  accessToken: string;
  user: UserResponse;
}

export interface AuthFormState {
  submission: SubmissionResult;
  session?: AuthSession;
}
