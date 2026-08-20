"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, AlertDescription, Card, CardContent } from "@shared/ui";
import Link from "next/link";
import { useActionState } from "react";

import { resetPasswordAction } from "../api/actions";
import { resetPasswordSchema } from "../model/schema";
import { AuthShell } from "./auth-shell";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [lastResult, action] = useActionState(resetPasswordAction, null);
  const [form, fields] = useForm({
    defaultValue: { token: token ?? "" },
    lastResult: lastResult?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: resetPasswordSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  if (token === undefined || token.length === 0) {
    return (
      <AuthShell
        title="Reset link is invalid"
        description="Request a new password reset link to continue."
      >
        <Alert variant="destructive" className="mb-4 rounded-md py-3 text-[13px]">
          <AlertDescription>
            This password reset link is missing or invalid.
          </AlertDescription>
        </Alert>
        <Link
          href="/forgot-password"
          className="text-foreground text-sm font-medium hover:underline"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Use a new password that you don’t use elsewhere."
    >
      {form.errors !== undefined && (
        <Alert
          variant="destructive"
          className="mb-4 rounded-md py-3 text-[13px]"
        >
          <AlertDescription>{form.errors.join(" ")}</AlertDescription>
        </Alert>
      )}
      <Card className="ring-border gap-0 rounded-lg border-0 py-0 shadow-sm ring-1">
        <CardContent className="p-[22px]">
          <form
            {...getFormProps(form)}
            action={action}
            className="grid gap-[14px]"
          >
            <input
              type="hidden"
              name={fields.token.name}
              value={token}
              readOnly
            />
            <FormField
              field={fields.password}
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hint="8–72 characters"
              canTogglePassword
            />
            <FormField
              field={fields.confirmPassword}
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              canTogglePassword
            />
            <SubmitButton pendingLabel="Resetting password…">
              Reset password
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
