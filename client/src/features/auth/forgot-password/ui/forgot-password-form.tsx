"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, Button, Card, Field, Input } from "@shared/ui";
import Link from "next/link";
import { Fragment, startTransition, useActionState } from "react";
import { ForgotPasswordSchema } from "../model/schema";
import { forgotPasswordAction } from "../api/action";
import { LoaderCircleIcon } from "lucide-react";

export function ForgotPasswordForm() {
  const [state, dispatchAction, isPending] = useActionState(
    forgotPasswordAction,
    null,
  );

  const [form, fields] = useForm({
    id: "forgot-password-form",
    lastResult: state?.submission,
    onSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      startTransition(() => {
        dispatchAction(formData);
      });
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ForgotPasswordSchema });
    },
    defaultValue: {
      email: "",
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <Fragment>
      {form.errors !== undefined && (
        <Alert.Root
          variant="destructive"
          className="mb-4 rounded-md py-3 text-sm"
        >
          <Alert.Description>{form.errors.join(" ")}</Alert.Description>
        </Alert.Root>
      )}

      {state?.status === "success" && (
        <Alert.Root variant="default" className="mb-4 rounded-md py-3 text-sm">
          <Alert.Description>
            If an account with that email exists, a password reset link has been
            sent.
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
                  {...getInputProps(fields.email, { type: "email" })}
                  aria-invalid={Boolean(fields.email.errors)}
                  autoComplete="email"
                  placeholder="you@company.com"
                />
                <Field.Error>{fields.email.errors?.join(" ")}</Field.Error>
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
              {isPending ? "Sending reset link…" : "Send reset link"}
            </Button>
          </form>
        </Card.Content>
      </Card.Root>

      <p className="text-muted-foreground mt-5 text-center text-sm">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-foreground font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Fragment>
  );
}
