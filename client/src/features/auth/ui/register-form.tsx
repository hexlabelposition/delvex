"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, AlertDescription, Card, CardContent } from "@shared/ui";
import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "../api/actions";
import { registerSchema } from "../model/schema";
import { AuthShell } from "./auth-shell";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";

export function RegisterForm() {
  const [lastResult, action] = useActionState(registerAction, null);
  const [form, fields] = useForm({
    lastResult: lastResult?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: registerSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <AuthShell
      title="Create your account"
      description="Track and manage your own shipments in one place."
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
            <FormField
              field={fields.email}
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
            <FormField
              field={fields.password}
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hint="8–72 characters"
              canTogglePassword
            />
            <FormField
              field={fields.firstName}
              label="First name"
              autoComplete="given-name"
              placeholder="Marta"
            />
            <FormField
              field={fields.lastName}
              label="Last name"
              autoComplete="family-name"
              placeholder="Kowalska"
              hint="Up to 50 characters"
            />
            <SubmitButton pendingLabel="Creating account…">
              Create account
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      <p className="text-muted-foreground mt-[18px] text-center text-[13px]">
        Already have an account?{" "}
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
