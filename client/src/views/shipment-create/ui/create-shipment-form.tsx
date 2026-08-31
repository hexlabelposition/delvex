"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { InfoIcon, LoaderCircleIcon, PackagePlusIcon } from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createShipmentAction,
  ShipmentCargoFields,
  ShipmentFormSchema,
  ShipmentRouteFields,
  ShipmentScheduleFields,
  type ShipmentFormValues,
} from "@features/shipment-form";
import { routes } from "@shared/config";
import { Alert, Button, buttonVariants, Card } from "@shared/ui";

import { clearDraft, readDraft, writeDraft } from "../lib/draft";
import { ShipmentSummary } from "./shipment-summary";

const emptyValues: ShipmentFormValues = {
  originLocationId: "",
  destinationLocationId: "",
  cargoDescription: "",
  weightKg: "",
  pickupAt: "",
};

const sections = [
  {
    title: "Route",
    description: "Choose where Delvex picks the cargo up and drops it off.",
  },
  {
    title: "Cargo",
    description: "Describe the goods and give their total weight.",
  },
  {
    title: "Schedule",
    description: "Optional — the dates can be added or moved later.",
  },
];

export function CreateShipmentForm() {
  const [instance, setInstance] = useState(0);

  // Discarding remounts the form. Conform's reset and update intents only reach
  // native inputs; the Select-driven fields are held by useInputControl, which
  // resyncs on mount, so a fresh instance is the one reliable way to clear it.
  return (
    <CreateShipmentFormInstance
      key={instance}
      onDiscard={() => setInstance((value) => value + 1)}
    />
  );
}

function CreateShipmentFormInstance({ onDiscard }: { onDiscard: () => void }) {
  const [state, dispatchAction, isPending] = useActionState(
    createShipmentAction,
    null,
  );
  const [restored, setRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [form, fields] = useForm({
    id: "create-shipment-form",
    lastResult: state?.submission,
    defaultValue: emptyValues,
    onSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      // A successful creation redirects, so the draft is cleared here; a
      // rejected submission leaves the values in the still-mounted form.
      clearDraft();
      setRestored(false);

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

  const values: ShipmentFormValues = {
    originLocationId: String(fields.originLocationId.value ?? ""),
    destinationLocationId: String(fields.destinationLocationId.value ?? ""),
    cargoDescription: String(fields.cargoDescription.value ?? ""),
    weightKg: String(fields.weightKg.value ?? ""),
    pickupAt: String(fields.pickupAt.value ?? ""),
  };

  // The draft is applied after mounting rather than read while rendering, so
  // that the server output and the first client render stay identical. The
  // one-shot state update here is the point: it happens once per mount, right
  // after the stored values are pushed into the form.
  useEffect(() => {
    const draft = readDraft();

    if (draft === null) {
      return;
    }

    form.update({ value: draft });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestored(true);
    // Restoring belongs to the first mount only; later renders must not undo
    // what the visitor has typed since.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function discardDraft() {
    clearDraft();
    onDiscard();
  }

  function saveDraft() {
    const element = formRef.current;

    if (element === null) {
      return;
    }

    const formData = new FormData(element);
    const read = (name: keyof ShipmentFormValues) => {
      const value = formData.get(name);

      return typeof value === "string" ? value : "";
    };

    writeDraft({
      originLocationId: read("originLocationId"),
      destinationLocationId: read("destinationLocationId"),
      cargoDescription: read("cargoDescription"),
      weightKg: read("weightKg"),
      pickupAt: read("pickupAt"),
    });
  }

  return (
    <form
      {...getFormProps(form)}
      ref={formRef}
      onInput={saveDraft}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="flex min-w-0 flex-col gap-4">
        {restored && (
          <Alert.Root>
            <InfoIcon aria-hidden="true" />
            <Alert.Title>Draft restored</Alert.Title>
            <Alert.Description>
              We brought back the shipment you started earlier.
            </Alert.Description>
            <Alert.Action>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={discardDraft}
              >
                Discard
              </Button>
            </Alert.Action>
          </Alert.Root>
        )}

        {form.errors !== undefined && (
          <Alert.Root variant="destructive" className="rounded-lg py-2">
            <Alert.Description>{form.errors.join(" ")}</Alert.Description>
          </Alert.Root>
        )}

        {sections.map((section, index) => (
          <Card.Root key={section.title}>
            <Card.Header>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                  {index + 1}
                </span>
                <div>
                  <Card.Title>{section.title}</Card.Title>
                  <Card.Description>{section.description}</Card.Description>
                </div>
              </div>
            </Card.Header>

            <Card.Content>
              {index === 0 && <ShipmentRouteFields fields={fields} />}
              {index === 1 && <ShipmentCargoFields fields={fields} />}
              {index === 2 && (
                <ShipmentScheduleFields fields={fields} quickDates />
              )}
            </Card.Content>
          </Card.Root>
        ))}

        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href={routes.shipments}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
            ) : (
              <PackagePlusIcon aria-hidden="true" />
            )}
            {isPending ? "Creating…" : "Create shipment"}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-20">
        <ShipmentSummary values={values} />
      </div>
    </form>
  );
}
