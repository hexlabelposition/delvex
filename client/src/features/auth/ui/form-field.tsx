"use client";

import type { FieldMetadata } from "@conform-to/react";
import { Input, Label } from "@shared/ui";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface FormFieldProps {
  field: FieldMetadata<string>;
  label: string;
  type?: "email" | "password" | "text";
  autoComplete: string;
  placeholder?: string;
  hint?: string;
  canTogglePassword?: boolean;
}

export function FormField({
  field,
  label,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  canTogglePassword = false,
}: FormFieldProps) {
  const errorId = `${field.id}-error`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && isPasswordVisible ? "text" : type;

  return (
    <div className="grid gap-1.5">
      <Label
        htmlFor={field.id}
        className="text-muted-foreground text-xs font-normal"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={field.id}
          name={field.name}
          type={inputType}
          autoComplete={autoComplete}
          defaultValue={field.initialValue}
          placeholder={placeholder}
          className="h-9 rounded-md text-[13.5px] shadow-none"
          aria-invalid={field.errors !== undefined}
          aria-describedby={field.errors === undefined ? undefined : errorId}
        />
        {isPassword && canTogglePassword && (
          <button
            type="button"
            className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-1 grid size-7 -translate-y-1/2 place-items-center rounded-sm transition-colors"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {field.errors?.map((error) => (
        <p key={error} id={errorId} className="text-destructive text-xs">
          {error}
        </p>
      ))}
      {hint !== undefined && field.errors === undefined && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  );
}
