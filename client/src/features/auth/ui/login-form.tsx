"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, AlertDescription, Card, CardContent } from "@shared/ui";
import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "../api/actions";
import { loginSchema } from "../model/schema";
import { AuthShell } from "./auth-shell";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const [lastResult, action] = useActionState(loginAction, null);
  const [form, fields] = useForm({
    lastResult: lastResult?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <AuthShell
      title="Sign in to Delvex"
      description="Enter your email and password to continue."
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
              autoComplete="current-password"
              placeholder="Your password"
              canTogglePassword
            />
            <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
            <p className="text-muted-foreground text-center text-xs">
              Password recovery is not available yet — contact support if you
              are locked out.
            </p>
          </form>
        </CardContent>
      </Card>
      <p className="text-muted-foreground mt-[18px] text-center text-[13px]">
        New to Delvex?{" "}
        <Link
          href="/register"
          className="text-foreground font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
