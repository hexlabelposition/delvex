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
import { registerAction } from "@/features/auth/actions";
import { useAuth } from "@/features/auth/auth-provider";
import { FormField } from "@/features/auth/form-field";
import { registerSchema } from "@/features/auth/schema";
import { SubmitButton } from "@/features/auth/submit-button";

export function RegisterForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [lastResult, action] = useActionState(registerAction, null);
  const [form, fields] = useForm({
    lastResult: lastResult?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: registerSchema });
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
        <CardTitle>Create account</CardTitle>
        <CardDescription>Enter your details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form {...getFormProps(form)} action={action} className="grid gap-4">
          {form.errors !== undefined && (
            <Alert variant="destructive">
              <AlertDescription>{form.errors.join(" ")}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              field={fields.firstName}
              label="First name"
              autoComplete="given-name"
            />
            <FormField
              field={fields.lastName}
              label="Last name"
              autoComplete="family-name"
            />
          </div>
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
            autoComplete="new-password"
          />
          <SubmitButton>Create account</SubmitButton>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
