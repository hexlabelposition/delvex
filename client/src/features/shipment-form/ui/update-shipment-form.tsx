"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { LoaderCircleIcon, SaveIcon } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState } from "react";
import { routes } from "@shared/config";
import { Alert, Button, buttonVariants, Card } from "@shared/ui";

import { updateShipmentAction } from "../api/action";
import { ShipmentFormSchema, type ShipmentFormValues } from "../model/schema";
import { ShipmentFormFields } from "./shipment-form-fields";

interface UpdateShipmentFormProps {
  shipmentId: string;
  defaultValues: ShipmentFormValues;
}

export function UpdateShipmentForm({
  shipmentId,
  defaultValues,
}: UpdateShipmentFormProps) {
  const [state, dispatchAction, isPending] = useActionState(
    updateShipmentAction.bind(null, shipmentId),
    null,
  );

  const [form, fields] = useForm({
    id: "update-shipment-form",
    lastResult: state?.submission,
    defaultValue: defaultValues,
    onSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      startTransition(() => {
        dispatchAction(formData);
      });
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ShipmentFormSchema });
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  });

  return (
    <form {...getFormProps(form)}>
      <Card.Root>
        <Card.Header>
          <Card.Title>Shipment details</Card.Title>
          <Card.Description>
            Change the route, the cargo, or the schedule. A schedule that is
            already set can be moved, but not removed.
          </Card.Description>
        </Card.Header>

        <Card.Content className="flex flex-col gap-5">
          {form.errors !== undefined && (
            <Alert.Root variant="destructive" className="rounded-md py-2">
              <Alert.Description>{form.errors.join(" ")}</Alert.Description>
            </Alert.Root>
          )}

          <ShipmentFormFields fields={fields} />
        </Card.Content>

        <Card.Footer className="justify-end gap-2">
          <Link
            href={routes.shipmentDetails(shipmentId)}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
            ) : (
              <SaveIcon aria-hidden="true" />
            )}
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </Card.Footer>
      </Card.Root>
    </form>
  );
}
