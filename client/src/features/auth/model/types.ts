import type { SubmissionResult } from "@conform-to/react";
import type { UserResponse } from "@shared/api";

export interface AuthSession {
  accessToken: string;
  user: UserResponse;
}

export interface AuthFormState {
  submission: SubmissionResult;
}

export interface ForgotPasswordFormState extends AuthFormState {
  success?: boolean;
}
