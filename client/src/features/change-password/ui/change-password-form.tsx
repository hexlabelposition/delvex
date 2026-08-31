"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, Button, Card, Field, PasswordInput } from "@shared/ui";
import { LoaderCircleIcon } from "lucide-react";
import { startTransition, useActionState } from "react";
import { ChangePasswordSchema } from "../model/schema";
import { changePasswordAction } from "../api/action";

export function ChangePasswordForm() {
  const [state, dispatchAction, isPending] = useActionState(
    changePasswordAction,
    null,
  );

  const [form, fields] = useForm({
    id: "change-password-form",
    lastResult: state?.submission,
    onSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      startTransition(() => {
        dispatchAction(formData);
      });
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangePasswordSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <form {...getFormProps(form)} className="flex">
      <Card.Root>
        <Card.Header>
          <Card.Title>Password</Card.Title>
          <Card.Description>
            Choose a strong password you don&apos;t use anywhere else.
          </Card.Description>
        </Card.Header>

        <Card.Content>
          {form.errors !== undefined && (
            <Alert.Root
              variant="destructive"
              className="mb-4 rounded-md py-2 text-sm"
            >
              <Alert.Description>{form.errors.join(" ")}</Alert.Description>
            </Alert.Root>
          )}

          {state?.status === "success" && !form.dirty && (
            <Alert.Root className="mb-4 rounded-md py-2 text-sm">
              <Alert.Description>
                Your password has been changed.
              </Alert.Description>
            </Alert.Root>
          )}

          <Field.Group className="gap-4">
            <Field.Root data-invalid={Boolean(fields.currentPassword.errors)}>
              <div className="flex items-center justify-between">
                <Field.Label htmlFor={fields.currentPassword.id}>
                  Current password
                </Field.Label>

                <Field.Error>
                  {fields.currentPassword.errors?.join(" ")}
                </Field.Error>
              </div>
              <PasswordInput
                {...getInputProps(fields.currentPassword, { type: "password" })}
                aria-invalid={Boolean(fields.currentPassword.errors)}
                autoComplete="current-password"
                maxLength={72}
              />
            </Field.Root>

            <Field.Root data-invalid={Boolean(fields.newPassword.errors)}>
              <div className="flex items-center justify-between">
                <Field.Label htmlFor={fields.newPassword.id}>
                  New password
                </Field.Label>

                <Field.Error>
                  {fields.newPassword.errors?.join(" ")}
                </Field.Error>
              </div>
              <PasswordInput
                {...getInputProps(fields.newPassword, { type: "password" })}
                aria-invalid={Boolean(fields.newPassword.errors)}
                autoComplete="new-password"
                maxLength={72}
              />
              <Field.Description>At least 8 characters.</Field.Description>
            </Field.Root>

            <Field.Root data-invalid={Boolean(fields.confirmPassword.errors)}>
              <div className="flex items-center justify-between">
                <Field.Label htmlFor={fields.confirmPassword.id}>
                  Confirm new password
                </Field.Label>

                <Field.Error>
                  {fields.confirmPassword.errors?.join(" ")}
                </Field.Error>
              </div>
              <PasswordInput
                {...getInputProps(fields.confirmPassword, { type: "password" })}
                aria-invalid={Boolean(fields.confirmPassword.errors)}
                autoComplete="new-password"
                maxLength={72}
              />
            </Field.Root>
          </Field.Group>
        </Card.Content>

        <Card.Footer className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            You stay signed in on this device after changing it.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            {form.dirty && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending && (
                <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
              )}
              {isPending ? "Changing…" : "Change password"}
            </Button>
          </div>
        </Card.Footer>
      </Card.Root>
    </form>
  );
}
