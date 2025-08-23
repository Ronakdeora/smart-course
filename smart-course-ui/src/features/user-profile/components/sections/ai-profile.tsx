import { Section } from "../fields/section";
import { Button } from "@/components/ui/button";
import { Field } from "../fields/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { PACE, TONE } from "../../utils/constants";
import { Row } from "../fields/row";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { UserProfileFormValues } from "@/features/types";

const AiProfileSection = () => {
  const {
    register,
    control,
    watch,
    // formState: { errors },
  } = useFormContext<UserProfileFormValues>();
  const {
    fields: customFields,
    append: appendCustom,
    remove: removeCustom,
  } = useFieldArray({ control, name: "ai_profile.custom" });

  const values = watch().ai_profile;

  function handleAddCustom() {
    const name = window.prompt("Add preference name (e.g., prefers_quizzes)");
    if (!name) return;
    const key = name.trim();
    if (!key) return;
    const reserved = ["pace", "tone"]; // cannot override defaults
    const existing = new Set([
      ...(values.custom?.map((c) => c.key) || []),
      ...reserved,
    ]);
    if (existing.has(key)) {
      window.alert(`Field "${key}" already exists.`);
      return;
    }
    appendCustom({ key, value: "" });
  }

  return (
    <Section
      title="AI profile"
      description="Defaults: Pace & Tone. Add your own preferences with +"
      collapsible
      defaultOpen={false}
    >
      <Row>
        <Field label="Pace">
          <Controller
            control={control}
            name="ai_profile.pace"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="rounded-xl cursor-pointer ">
                  <SelectValue placeholder="Select pace" />
                </SelectTrigger>
                <SelectContent>
                  {PACE.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Tone">
          <Controller
            control={control}
            name="ai_profile.tone"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="rounded-xl cursor-pointer ">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </Row>

      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">
          Custom preferences
        </Label>
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl"
          onClick={handleAddCustom}
        >
          <Plus className="mr-2 h-4 w-4" /> Add preference
        </Button>
      </div>

      <div className="space-y-3">
        {customFields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No custom preferences yet.
          </p>
        )}
        {customFields.map((f, idx) => (
          <div key={f.id} className="grid md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <Field label="Name">
                <Input
                  placeholder="e.g., prefers_quizzes"
                  {...register(`ai_profile.custom.${idx}.key` as const)}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Value">
                <Input
                  placeholder="e.g., true"
                  {...register(`ai_profile.custom.${idx}.value` as const)}
                />
              </Field>
            </div>
            <div className="flex md:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => removeCustom(idx)}
                className="rounded-xl"
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default AiProfileSection;
