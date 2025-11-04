import { Badge } from "@/components/ui/badge";
import React from "react";

export function TagsInput({
  value = [],
  onChange,
  placeholder,
}: {
  value?: string[];
  onChange: (t: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");
  function addTag(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if ((value || []).includes(t)) return;
    onChange([...(value || []), t]);
    setDraft("");
  }
  return (
    <div className="rounded-2xl border bg-transparent px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-ring/40 ">
      {(value || []).map((t) => (
        <Badge key={t} variant="secondary" className="rounded-xl">
          {t}
        </Badge>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(draft);
          }
          if (e.key === "Backspace" && draft === "" && (value || []).length)
            onChange((value || []).slice(0, -1));
        }}
        placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-sm min-w-[8ch]"
      />
    </div>
  );
}

// function TagsInput({) {

// }
