// features/user-profile/components/sections/PreferencesSection.tsx
import { Controller, useFormContext } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TZ, LOCALES } from "../../utils/constants";
import { Section } from "../fields/section";
import { Row } from "../fields/row";
import { Field } from "../fields/field";
import type { UserProfileFormValues } from "@/features/types";

export function PreferencesSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<UserProfileFormValues>();

  return (
    <Section
      title="Preferences"
      description="Time, region, and format settings."
      collapsible
      defaultOpen={false}
    >
      <Row>
        <Field label="Timezone" error={errors.timezone?.message as string}>
          <Controller
            control={control}
            name="timezone"
            rules={{ required: "Timezone is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`rounded-xl cursor-pointer ${
                    errors.timezone ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {TZ.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Locale" error={errors.locale?.message as string}>
          <Controller
            control={control}
            name="locale"
            rules={{ required: "Locale is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`rounded-xl cursor-pointer ${
                    errors.locale ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Choose locale" />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </Row>

      <Row>
        <Field
          label="Weekly time budget (minutes)"
          error={errors.weekly_time_budget_min?.message as string}
        >
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={10080}
            placeholder="e.g., 300"
            {...register("weekly_time_budget_min", {
              valueAsNumber: true,
              required: "Required",
              min: { value: 0, message: "Must be ≥ 0" },
              max: { value: 10080, message: "Max is 10080" },
            })}
          />
        </Field>

        <Field
          label="Preferred session length (minutes)"
          error={errors.preferred_session_min?.message as string}
        >
          <Input
            type="number"
            inputMode="numeric"
            min={10}
            max={480}
            placeholder="e.g., 45"
            {...register("preferred_session_min", {
              valueAsNumber: true,
              required: "Required",
              min: { value: 10, message: "Must be ≥ 10" },
              max: { value: 480, message: "Max is 480" },
            })}
          />
        </Field>
      </Row>
    </Section>
  );
}
