"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginAction } from "@/features/auth/actions";
import { useAuth } from "@/features/auth/auth-provider";
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form {...getFormProps(form)} action={action} className="grid gap-4">
          {form.errors !== undefined && (
            <Alert variant="destructive">
              <AlertDescription>{form.errors.join(" ")}</AlertDescription>
            </Alert>
          )}
          <FormField
            field={fields.email}
            label="Email"
            type="email"
            autoComplete="email"
          />
          <FormField
            field={fields.password}
            label="Password"
            type="password"
            autoComplete="current-password"
          />
          <SubmitButton>Sign in</SubmitButton>
          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
