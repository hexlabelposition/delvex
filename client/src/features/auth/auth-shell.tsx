import { Package } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="w-full max-w-[24.5rem]">
      <div className="mb-6 flex items-center gap-2">
        <Package className="size-[22px]" aria-hidden="true" />
        <span className="text-lg font-medium tracking-tight">Delvex</span>
      </div>
      <h1 className="text-[25px] leading-tight font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground mt-1.5 mb-[22px] text-[13.5px]">
        {description}
      </p>
      {children}
    </div>
  );
}
