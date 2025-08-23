import { Textarea } from "@/components/ui/textarea";
import { Field } from "../fields/field";
import { Section } from "../fields/section";
import { Row } from "../fields/row";
import { Input } from "@/components/ui/input";
import type { UserProfileFormValues } from "@/features/types";
import { useFormContext, Controller } from "react-hook-form";
import { LEARNING } from "../../utils/constants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// features/user-profile/components/sections/IdentitySection.tsx
export function IdentitySection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<UserProfileFormValues>();
  const bio = watch("bio") ?? "";

  return (
    <Section
      title="Identity"
      description="Basic details used across your account."
    >
      <Row>
        <Field label="Full name">
          <Input
            placeholder="e.g., Anish Kumar"
            aria-invalid={!!errors.full_name}
            className={errors.full_name ? "border-red-500" : undefined}
            {...register("full_name", {
              required: "Full name is required",
            })}
          />
          {errors.full_name && (
            <p className="text-xs text-red-600">
              {errors.full_name.message as string}
            </p>
          )}
        </Field>
        <Field label="Email">
          <Input
            placeholder="name@example.com"
            type="email"
            aria-invalid={!!errors.email}
            className={errors.email ? "border-red-500" : undefined}
            {...register("email", {
              required: "Email is required",
              validate: (v) =>
                (v && v.includes("@") && v.includes(".")) ||
                "Enter a valid email",
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-600">
              {errors.email.message as string}
            </p>
          )}
        </Field>
      </Row>
      <Row>
        <Field label="Standard / Level">
          <Input
            placeholder="e.g., 8th, UG, Working Pro"
            {...register("standard_level")}
          />
        </Field>
        <Field label="Learning style">
          <Controller
            control={control}
            name="learning_style"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="rounded-xl cursor-pointer ">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </Row>
      <Field label="Bio (max 400 chars)">
        <Textarea
          rows={3}
          maxLength={400}
          placeholder="Short intro (what you're learning, interests)"
          aria-invalid={!!errors.bio}
          className={errors.bio ? "border-red-500" : undefined}
          {...register("bio", {
            validate: (v) => (v?.length ?? 0) <= 400 || "Max 400 characters",
          })}
        />
        <div className="text-[10px] text-muted-foreground text-right">
          {bio?.length ?? 0}/400
        </div>
      </Field>
    </Section>
  );
}
