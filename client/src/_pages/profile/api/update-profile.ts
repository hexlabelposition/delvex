"use server";

import { updateProfile } from "@entities/user";
import { requireSession } from "@features/auth/server";
import { ApiClientError } from "@shared/api";
import { revalidatePath } from "next/cache";

export interface UpdateProfileResult {
  ok: boolean;
  fieldErrors: Record<string, string>;
  message: string;
}

export async function updateProfileAction(payload: {
  firstName: string;
  lastName: string;
}): Promise<UpdateProfileResult> {
  const { accessToken } = await requireSession();

  try {
    await updateProfile(payload, accessToken);
  } catch (error) {
    return {
      ok: false,
      fieldErrors: error instanceof ApiClientError ? error.fieldErrors : {},
      message:
        error instanceof Error
          ? error.message
          : "Could not update your profile.",
    };
  }

  // Re-runs the layout that resolved the session, so the shell and this page
  // both pick up the new name without any client-side session state.
  revalidatePath("/profile", "layout");

  return { ok: true, fieldErrors: {}, message: "Your name was updated." };
}
