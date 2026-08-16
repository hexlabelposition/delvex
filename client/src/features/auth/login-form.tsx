"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { loginAction } from "@/features/auth/actions";
import { useAuth } from "@/features/auth/auth-provider";
import { AuthShell } from "@/features/auth/auth-shell";
import { FormField } from "@/features/auth/form-field";
import { loginSchema } from "@/features/auth/schema";
import { SubmitButton } from "@/features/auth/submit-button";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [lastResult, action] = useActionState(loginAction, null);
  const [form, fields] = useForm({
    lastResult: lastResult?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  useEffect(() => {
    if (lastResult?.session === undefined) {
      return;
    }

    setSession(lastResult.session);
    router.replace("/dashboard");
  }, [lastResult?.session, router, setSession]);

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
