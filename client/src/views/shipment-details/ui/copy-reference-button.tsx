"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@shared/ui";

interface CopyReferenceButtonProps {
  reference: string;
}

export function CopyReferenceButton({ reference }: CopyReferenceButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timeout);
  }, [copied]);

  function copy() {
    // Clipboard access can be denied (insecure context, browser policy). The
    // reference stays selectable on the page, so there is nothing to report.
    navigator.clipboard
      .writeText(reference)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={copy}
        aria-label={`Copy reference ${reference}`}
      >
        {copied ? (
          <CheckIcon className="text-primary" aria-hidden="true" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )}
      </Button>

      <span aria-live="polite" className="sr-only">
        {copied ? "Reference copied" : ""}
      </span>
    </>
  );
}
