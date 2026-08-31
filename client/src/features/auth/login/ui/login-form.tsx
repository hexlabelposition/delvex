"use client";

import { startTransition, Fragment } from "react";
import { getFormProps, useForm, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button, Card, Input, Field, Alert, PasswordInput } from "@shared/ui";
import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "../api/action";
import { LoginSchema } from "../model/schema";
import { LoaderCircleIcon } from "lucide-react";
import { routes } from "@shared/config";

export function LoginForm() {
  const [state, dispatchAction, isPending] = useActionState(loginAction, null);

  const [form, fields] = useForm({
    id: "login-form",
    lastResult: state?.submission,
    onSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      startTransition(() => {
        dispatchAction(formData);
      });
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <Fragment>
      {form.errors && (
        <Alert.Root variant="destructive" className="mb-4">
          <Alert.Description>
            {form.errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </Alert.Description>
        </Alert.Root>
      )}

      <Card.Root className="ring-border gap-0 rounded-lg border-0 py-0 shadow-sm ring-1">
        <Card.Content className="p-6">
          <form {...getFormProps(form)} className="grid gap-4">
            <Field.Group className="gap-4">
              <Field.Root data-invalid={Boolean(fields.email.errors)}>
                <Field.Label htmlFor={fields.email.id}>Email</Field.Label>
                <Input
                  {...getInputProps(fields.email, {
                    type: "email",
                  })}
                  aria-invalid={Boolean(fields.email.errors)}
                  autoComplete="email"
                  placeholder="you@company.com"
                />
                <Field.Error>{fields.email.errors?.join(" ")}</Field.Error>
              </Field.Root>

              <Field.Root data-invalid={Boolean(fields.password.errors)}>
                <Field.Label htmlFor={fields.password.id}>Password</Field.Label>
                <PasswordInput
                  {...getInputProps(fields.password, {
                    type: "password",
                  })}
                  aria-invalid={Boolean(fields.password.errors)}
                  autoComplete="current-password"
                  placeholder="Your password"
                />
                <Field.Error>{fields.password.errors?.join(" ")}</Field.Error>
              </Field.Root>
            </Field.Group>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending && (
                <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
              )}
              {isPending ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              <Link href={routes.forgotPassword} className="hover:underline">
                Forgot your password?
              </Link>
            </p>
          </form>
        </Card.Content>
      </Card.Root>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        New to Delvex?{" "}
        <Link
          href={routes.register}
          className="text-foreground font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>
    </Fragment>
  );
}
