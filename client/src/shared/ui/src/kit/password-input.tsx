"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { Input, type InputProps } from "./input";

export function PasswordInput({ type, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : (type ?? "password")}
        className="pr-9"
      />

      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute top-1/2 right-2 -translate-y-1/2"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </div>
  );
}
