import * as React from "react";
import { Label } from "@/components/ui/label";

type Props = React.PropsWithChildren<{
  label: string;
  hint?: string;
  error?: string;
}>;

export function Field({ label, hint, error, children }: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
      {hint ? (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
