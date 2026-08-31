import type { SubmissionResult } from "@conform-to/react";

export interface SubmissionResponse {
  status: "success" | "error";
  submission: SubmissionResult | null;
}
