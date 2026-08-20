"use client";

import { Button } from "@shared/ui";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: string;
  pendingLabel: string;
}

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </Button>
  );
}
