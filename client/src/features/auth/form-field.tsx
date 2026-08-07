import type { FieldMetadata } from "@conform-to/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  field: FieldMetadata<string>;
  label: string;
  type?: "email" | "password" | "text";
  autoComplete: string;
}

export function FormField({
  field,
  label,
  type = "text",
  autoComplete,
}: FormFieldProps) {
  const errorId = `${field.id}-error`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.id}>{label}</Label>
      <Input
        id={field.id}
        name={field.name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={field.initialValue}
        aria-invalid={field.errors !== undefined}
        aria-describedby={field.errors === undefined ? undefined : errorId}
      />
      {field.errors?.map((error) => (
        <p key={error} id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ))}
    </div>
  );
}
