"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, AlertDescription, Card, CardContent } from "@shared/ui";
import Link from "next/link";
import { useActionState } from "react";

import { forgotPasswordAction } from "../api/actions";
import { forgotPasswordSchema } from "../model/schema";
import { AuthShell } from "./auth-shell";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";

export function ForgotPasswordForm() {
  const [lastResult, action] = useActionState(forgotPasswordAction, null);
  const [form, fields] = useForm({
    lastResult: lastResult?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: forgotPasswordSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we’ll send you a secure reset link."
    >
      {lastResult?.success && (
        <Alert className="mb-4 rounded-md py-3 text-[13px]">
          <AlertDescription>
            If an account exists for that email, a reset link has been sent.
          </AlertDescription>
        </Alert>
      )}
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
            <FormField
              field={fields.email}
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
            <SubmitButton pendingLabel="Sending reset link…">
              Send reset link
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      <p className="text-muted-foreground mt-[18px] text-center text-[13px]">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-foreground font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
