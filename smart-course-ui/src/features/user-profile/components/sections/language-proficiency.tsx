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
import { LEVELS } from "../../utils/constants";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { UserProfileFormValues } from "@/features/types";

const LanguageProficiencySection = () => {
  const {
    register,
    control,
    // watch,
    formState: { errors },
  } = useFormContext<UserProfileFormValues>();

  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: "language_proficiencies" });

  return (
    <Section
      title="Language proficiency"
      description="Use CEFR-like levels (A1–C2) or Native."
      collapsible
      defaultOpen={false}
    >
      <div className="space-y-3">
        {langFields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No languages added yet.
          </p>
        )}
        {langFields.map((f, idx) => (
          <div key={f.id} className="grid md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <Field label="Language code (ISO 639-1)">
                <Input
                  placeholder="e.g., en, hi"
                  aria-invalid={
                    !!errors.language_proficiencies?.[idx]?.language_code
                  }
                  className={
                    errors.language_proficiencies?.[idx]?.language_code
                      ? "border-red-500"
                      : undefined
                  }
                  {...register(
                    `language_proficiencies.${idx}.language_code` as const,
                    {
                      required: "Required",
                      minLength: { value: 2, message: "Min 2" },
                    }
                  )}
                />
                {errors.language_proficiencies?.[idx]?.language_code && (
                  <p className="text-xs text-red-600">
                    {String(
                      errors.language_proficiencies[idx]?.language_code?.message
                    )}
                  </p>
                )}
              </Field>
            </div>
            <div className="md:col-span-1">
              <Field label="Level">
                <Controller
                  control={control}
                  name={`language_proficiencies.${idx}.level` as const}
                  rules={{ required: "Required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl cursor-pointer ">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>
                            {lvl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Last assessed (optional)">
                <Input
                  type="date"
                  {...register(
                    `language_proficiencies.${idx}.last_assessed_at` as const
                  )}
                />
              </Field>
            </div>
            <div className="flex md:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => removeLang(idx)}
                className="rounded-xl"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            appendLang({
              language_code: "",
              level: "A1",
              last_assessed_at: "",
            })
          }
          className="rounded-xl"
        >
          Add language
        </Button>
      </div>
    </Section>
  );
};

export default LanguageProficiencySection;
