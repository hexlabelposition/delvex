"use client";

import Link from "next/link";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, Button, Card, Field, Input, PasswordInput } from "@shared/ui";
import { Fragment, startTransition, useActionState } from "react";
import { RegisterSchema } from "../model/schema";
import { LoaderCircleIcon } from "lucide-react";
import { routes } from "@shared/config";
import { registerAction } from "../api/action";

export function RegisterForm() {
  const [state, dispatchAction, isPending] = useActionState(
    registerAction,
    null,
  );

  const [form, fields] = useForm({
    lastResult: state?.submission,
    onSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      startTransition(() => {
        dispatchAction(formData);
      });
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RegisterSchema });
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
                  {...getInputProps(fields.email, { type: "email" })}
                  aria-invalid={Boolean(fields.email.errors)}
                  autoComplete="email"
                  placeholder="you@company.com"
                />
                <Field.Error>{fields.email.errors?.join(" ")}</Field.Error>
              </Field.Root>

              <Field.Root data-invalid={Boolean(fields.password.errors)}>
                <Field.Label htmlFor={fields.password.id}>Password</Field.Label>
                <PasswordInput
                  {...getInputProps(fields.password, { type: "password" })}
                  aria-invalid={Boolean(fields.password.errors)}
                  autoComplete="new-password"
                  placeholder="Your password"
                />
                <Field.Error>{fields.password.errors?.join(" ")}</Field.Error>
              </Field.Root>

              <Field.Root data-invalid={Boolean(fields.firstName.errors)}>
                <Field.Label htmlFor={fields.firstName.id}>
                  First name
                </Field.Label>
                <Input
                  {...getInputProps(fields.firstName, { type: "text" })}
                  aria-invalid={Boolean(fields.firstName.errors)}
                  autoComplete="given-name"
                  placeholder="Marta"
                />
                <Field.Error>{fields.firstName.errors?.join(" ")}</Field.Error>
              </Field.Root>

              <Field.Root data-invalid={Boolean(fields.lastName.errors)}>
                <Field.Label htmlFor={fields.lastName.id}>
                  Last name
                </Field.Label>
                <Input
                  {...getInputProps(fields.lastName, { type: "text" })}
                  aria-invalid={Boolean(fields.lastName.errors)}
                  autoComplete="family-name"
                  placeholder="Kowalska"
                />
                <Field.Error>{fields.lastName.errors?.join(" ")}</Field.Error>
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
              {isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Card.Content>
      </Card.Root>

      <p className="text-muted-foreground mt-5 text-center text-sm">
        Already have an account?{" "}
        <Link
          href={routes.login}
          className="text-foreground font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Fragment>
  );
}
