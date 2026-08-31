"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Alert, Button, Card, Field, Input } from "@shared/ui";
import { LoaderCircleIcon } from "lucide-react";
import { startTransition, useActionState } from "react";
import { UpdateProfileSchema } from "../model/schema";
import { updateProfileAction } from "../api/action";

interface UpdateProfileFormProps {
  firstName: string;
  lastName: string;
  email: string;
}

export function UpdateProfileForm({
  firstName,
  lastName,
  email,
}: UpdateProfileFormProps) {
  const [state, dispatchAction, isPending] = useActionState(
    updateProfileAction,
    null,
  );

  const [form, fields] = useForm({
    id: "personal-information-form",
    lastResult: state?.submission,
    onSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      startTransition(() => {
        dispatchAction(formData);
      });
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UpdateProfileSchema });
    },
    defaultValue: { firstName, lastName },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <form {...getFormProps(form)} className="flex">
      <Card.Root>
        <Card.Header>
          <Card.Title>Personal information</Card.Title>
          <Card.Description>
            Update how your name appears across Delvex.
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

          <Field.Group className="gap-4">
            <Field.Root data-invalid={Boolean(fields.firstName.errors)}>
              <div className="flex items-center justify-between">
                <Field.Label htmlFor={fields.firstName.id}>
                  First name
                </Field.Label>

                <Field.Error>{fields.firstName.errors?.join(" ")}</Field.Error>
              </div>
              <Input
                {...getInputProps(fields.firstName, { type: "text" })}
                aria-invalid={Boolean(fields.firstName.errors)}
                autoComplete="given-name"
                maxLength={50}
              />
            </Field.Root>

            <Field.Root data-invalid={Boolean(fields.lastName.errors)}>
              <div className="flex items-center justify-between">
                <Field.Label htmlFor={fields.lastName.id}>
                  Last name
                </Field.Label>

                <Field.Error>{fields.lastName.errors?.join(" ")}</Field.Error>
              </div>
              <Input
                {...getInputProps(fields.lastName, { type: "text" })}
                aria-invalid={Boolean(fields.lastName.errors)}
                autoComplete="family-name"
                maxLength={50}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label htmlFor="profile-email">Email</Field.Label>
              <Input
                id="profile-email"
                type="email"
                defaultValue={email}
                disabled
              />
              <Field.Description>Email cannot be changed.</Field.Description>
            </Field.Root>
          </Field.Group>
        </Card.Content>

        <Card.Footer className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Changes apply to your account everywhere in Delvex.
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
              disabled={!form.dirty || isPending}
              className="w-full sm:w-auto"
            >
              {isPending && (
                <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
              )}
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Card.Footer>
      </Card.Root>
    </form>
  );
}
