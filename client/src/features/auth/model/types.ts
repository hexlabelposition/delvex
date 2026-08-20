import type { SubmissionResult } from "@conform-to/react";
import type { UserResponse } from "@shared/api";

export interface AuthSession {
  // TODO: drop once every page fetches on the server; client components still
  // read this to call the API from the browser.
  accessToken: string;
  user: UserResponse;
}

export interface AuthFormState {
  submission: SubmissionResult;
}
