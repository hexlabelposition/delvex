"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, Button, Card, Field, PasswordInput } from "@shared/ui";
import { Fragment, startTransition, useActionState } from "react";
import { resetPasswordAction } from "../api/action";
import { ResetPasswordSchema } from "../model/schema";
import { LoaderCircleIcon } from "lucide-react";

interface ResetPasswordFormProps {
  token?: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, dispatchAction, isPending] = useActionState(
    resetPasswordAction,
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
      return parseWithZod(formData, { schema: ResetPasswordSchema });
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
            <input
              type="hidden"
              name={fields.token.name}
              value={token}
              readOnly
            />

            <Field.Group className="gap-4">
              <Field.Root data-invalid={Boolean(fields.newPassword.errors)}>
                <Field.Label htmlFor={fields.newPassword.id}>
                  New password
                </Field.Label>
                <PasswordInput
                  {...getInputProps(fields.newPassword, { type: "password" })}
                  aria-invalid={Boolean(fields.newPassword.errors)}
                  autoComplete="new-password"
                  placeholder="New password"
                />
                <Field.Error>
                  {fields.newPassword.errors?.join(" ")}
                </Field.Error>
              </Field.Root>

              <Field.Root data-invalid={Boolean(fields.confirmPassword.errors)}>
                <Field.Label htmlFor={fields.confirmPassword.id}>
                  Confirm password
                </Field.Label>
                <PasswordInput
                  {...getInputProps(fields.confirmPassword, {
                    type: "password",
                  })}
                  aria-invalid={Boolean(fields.confirmPassword.errors)}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                />
                <Field.Error>
                  {fields.confirmPassword.errors?.join(" ")}
                </Field.Error>
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
              {isPending ? "Resetting password…" : "Reset password"}
            </Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Fragment>
  );
}
