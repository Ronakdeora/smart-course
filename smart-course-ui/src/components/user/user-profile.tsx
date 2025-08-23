/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type LearningStyle =
  | "Visual"
  | "Auditory"
  | "Reading/Writing"
  | "Kinesthetic"
  | "Mixed";

type LangLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native";

type AIPace = "slow" | "normal" | "fast";
type AITone = "neutral" | "casual" | "formal";

type AICustomField = { key: string; value: string };

type UserProfileValues = {
  full_name: string;
  email: string;
  standard_level: string;
  bio: string;
  timezone: string;
  locale: string;
  weekly_time_budget_min: number;
  preferred_session_min: number;
  learning_style: LearningStyle;
  accessibility_notes: string;
  goals: string;
  prior_knowledge_tags: string[];
  ai_profile: {
    pace: AIPace;
    tone: AITone;
    custom: AICustomField[]; // dynamic user-added fields
  };
  language_proficiencies: {
    language_code: string;
    level: LangLevel;
    last_assessed_at?: string; // YYYY-MM-DD
  }[];
};

const TZ = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
];
const LOCALES = ["en-IN", "en-US", "en-GB", "hi-IN", "de-DE", "fr-FR"];
const LEARNING: LearningStyle[] = [
  "Visual",
  "Auditory",
  "Reading/Writing",
  "Kinesthetic",
  "Mixed",
];
const LEVELS: LangLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];
const PACE: AIPace[] = ["slow", "normal", "fast"];
const TONE: AITone[] = ["neutral", "casual", "formal"];

function Section({
  title,
  children,
  description,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);
  const contentId = React.useId();
  const shouldReduce = useReducedMotion();
  const transition = shouldReduce ? { duration: 0 } : { duration: 0.24 };

  return (
    <Card className="border-none shadow-sm bg-white/80 backdrop-blur rounded-2xl transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={contentId}
            className="group w-full flex items-center justify-between text-left cursor-pointer rounded-xl px-2 py-1  focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : (
          <>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </>
        )}
      </CardHeader>

      <CardContent id={contentId}>
        {collapsible ? (
          <AnimatePresence initial={false}>
            <motion.div
              key="content"
              initial={open ? "open" : "collapsed"}
              animate={open ? "open" : "collapsed"}
              exit="collapsed"
              variants={{
                open: { height: "auto", opacity: 1 },
                collapsed: { height: 0, opacity: 0 },
              }}
              transition={transition}
              style={{ overflow: "hidden" }}
              aria-hidden={!open}
            >
              <div className="space-y-4">{children}</div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="space-y-4">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// Minimal tags input using shadcn Badge for chips
function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (t: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");
  function addTag(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  }
  return (
    <div className="rounded-2xl border bg-transparent px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-ring/40 ">
      {value.map((t) => (
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
          if (e.key === "Backspace" && draft === "" && value.length)
            onChange(value.slice(0, -1));
        }}
        placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-sm min-w-[8ch]"
      />
    </div>
  );
}

export default function UserProfileForm() {
  const {
    register,
    watch,
    setValue,
    control,
    reset,
    getValues,
    handleSubmit,
    formState,
  } = useForm<UserProfileValues>({
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      email: "",
      standard_level: "",
      bio: "",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      weekly_time_budget_min: 300,
      preferred_session_min: 45,
      learning_style: "Mixed",
      accessibility_notes: "",
      goals: "",
      prior_knowledge_tags: [],
      ai_profile: {
        pace: "normal",
        tone: "neutral",
        custom: [],
      },
      language_proficiencies: [],
    },
  });

  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: "language_proficiencies" });
  const {
    fields: customFields,
    append: appendCustom,
    remove: removeCustom,
  } = useFieldArray({ control, name: "ai_profile.custom" });

  const values = watch();
  const { errors, isSubmitting, isDirty } = formState;
  const [loadingDemo, setLoadingDemo] = React.useState(false);
  const [loadedAt, setLoadedAt] = React.useState<Date | null>(null);
  const [submitted, setSubmitted] = React.useState<any | null>(null);
  const [submittedAt, setSubmittedAt] = React.useState<Date | null>(null);

  function loadDemo() {
    setLoadingDemo(true);
    const demo: UserProfileValues = {
      full_name: "Anish Kumar",
      email: "anish@example.com",
      standard_level: "UG",
      bio: "Backend dev learning React. Loves DSA & system design.",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      weekly_time_budget_min: 360,
      preferred_session_min: 45,
      learning_style: "Mixed",
      accessibility_notes: "",
      goals: "Finish React + DSA track in 12 weeks; practice 3 mock tests.",
      prior_knowledge_tags: ["algebra", "git", "javascript"],
      ai_profile: {
        pace: "fast",
        tone: "casual",
        custom: [
          { key: "content_density", value: "balanced" },
          { key: "prefers_quizzes", value: "true" },
          { key: "include_examples", value: "true" },
          { key: "explanation_detail", value: "4" },
        ],
      },
      language_proficiencies: [
        {
          language_code: "en",
          level: "Native",
          last_assessed_at: "2024-06-01",
        },
        { language_code: "hi", level: "B2", last_assessed_at: "2023-12-15" },
      ],
    };
    setTimeout(() => {
      reset(demo);
      setLoadingDemo(false);
      setLoadedAt(new Date());
    }, 400);
  }

  function clearForm() {
    reset({
      full_name: "",
      email: "",
      standard_level: "",
      bio: "",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      weekly_time_budget_min: 300,
      preferred_session_min: 45,
      learning_style: "Mixed",
      accessibility_notes: "",
      goals: "",
      prior_knowledge_tags: [],
      ai_profile: { pace: "normal", tone: "neutral", custom: [] },
      language_proficiencies: [],
    });
    setLoadedAt(null);
  }

  function patchTimeAndLocaleOnly() {
    const current = getValues();
    reset(
      { ...current, timezone: "UTC", locale: "en-US" },
      { keepDirty: true }
    );
    setLoadedAt(new Date());
  }

  function handleAddCustom() {
    const name = window.prompt("Add preference name (e.g., prefers_quizzes)");
    if (!name) return;
    const key = name.trim();
    if (!key) return;
    const reserved = ["pace", "tone"]; // cannot override defaults
    const existing = new Set([
      ...(values.ai_profile.custom?.map((c) => c.key) || []),
      ...reserved,
    ]);
    if (existing.has(key)) {
      window.alert(`Field "${key}" already exists.`);
      return;
    }
    appendCustom({ key, value: "" });
  }

  async function onSubmit(data: UserProfileValues) {
    if (
      data.preferred_session_min > data.weekly_time_budget_min &&
      data.weekly_time_budget_min > 0
    ) {
      alert("Session length cannot exceed weekly time budget (in minutes).");
      return;
    }

    // Build ai_profile with defaults + custom fields (flattened)
    const ai: Record<string, unknown> = {
      pace: data.ai_profile.pace,
      tone: data.ai_profile.tone,
    };
    for (const cf of data.ai_profile.custom || []) {
      const k = (cf.key || "").trim();
      if (!k) continue;
      // keep value as string; could smart-cast but keeping simple
      ai[k] = cf.value;
    }

    const payload = {
      full_name: data.full_name,
      email: data.email,
      standard_level: data.standard_level,
      bio: data.bio,
      timezone: data.timezone,
      locale: data.locale,
      weekly_time_budget_min: data.weekly_time_budget_min,
      preferred_session_min: data.preferred_session_min,
      learning_style: data.learning_style,
      accessibility_notes: data.accessibility_notes,
      goals: data.goals,
      prior_knowledge_tags: Array.from(
        new Set(data.prior_knowledge_tags.map((t) => t.trim()).filter(Boolean))
      ),
      ai_profile: ai,
      language_proficiencies: (data.language_proficiencies || []).map((lp) => ({
        language_code: lp.language_code,
        level: lp.level,
        last_assessed_at: lp.last_assessed_at
          ? new Date(lp.last_assessed_at).toISOString()
          : null,
      })),
      derived: {
        sessions_per_week:
          data.preferred_session_min > 0
            ? Math.max(
                1,
                Math.floor(
                  data.weekly_time_budget_min / data.preferred_session_min
                )
              )
            : 0,
      },
    };

    // Console log only (as requested)
    console.log("UserProfile DTO:", payload);

    await new Promise((r) => setTimeout(r, 300));
    setSubmitted(payload);
    setSubmittedAt(new Date());
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            User Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            AI Profile now supports custom preferences via + button.
          </p>
          {loadedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Last patched at{" "}
              <time dateTime={loadedAt.toISOString()}>
                {loadedAt.toLocaleTimeString()}
              </time>
            </p>
          )}
          {submittedAt && (
            <p className="text-xs text-muted-foreground">
              Last submitted at{" "}
              <time dateTime={submittedAt.toISOString()}>
                {submittedAt.toLocaleTimeString()}
              </time>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={loadDemo}
            disabled={loadingDemo}
            variant="secondary"
            className="rounded-xl"
          >
            {loadingDemo ? "Loading…" : "Load demo data"}
          </Button>
          <Button
            type="button"
            onClick={patchTimeAndLocaleOnly}
            variant="outline"
            className="rounded-xl"
          >
            Patch timezone + locale
          </Button>
          <Button
            type="button"
            onClick={clearForm}
            variant="outline"
            className="rounded-xl"
          >
            Clear
          </Button>
        </div>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Identity (NOT collapsible) */}
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
                validate: (v) =>
                  (v?.length ?? 0) <= 400 || "Max 400 characters",
              })}
            />
            <div className="text-[10px] text-muted-foreground text-right">
              {values.bio?.length ?? 0}/400
            </div>
          </Field>
        </Section>

        {/* Preferences (collapsible, collapsed by default) */}
        <Section
          title="Preferences"
          description="Time, region, and format settings."
          collapsible
          defaultOpen={false}
        >
          <Row>
            <Field label="Timezone">
              <Controller
                control={control}
                name="timezone"
                rules={{ required: "Timezone is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={`rounded-xl cursor-pointer  ${
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
              {errors.timezone && (
                <p className="text-xs text-red-600">
                  {errors.timezone.message as string}
                </p>
              )}
            </Field>
            <Field label="Locale">
              <Controller
                control={control}
                name="locale"
                rules={{ required: "Locale is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={`rounded-xl cursor-pointer  ${
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
              {errors.locale && (
                <p className="text-xs text-red-600">
                  {errors.locale.message as string}
                </p>
              )}
            </Field>
          </Row>
          <Row>
            <Field label="Weekly time budget (minutes)">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={10080}
                placeholder="e.g., 300"
                aria-invalid={!!errors.weekly_time_budget_min}
                className={
                  errors.weekly_time_budget_min ? "border-red-500" : undefined
                }
                {...register("weekly_time_budget_min", {
                  valueAsNumber: true,
                  required: "Required",
                  min: { value: 0, message: "Must be ≥ 0" },
                  max: { value: 10080, message: "Max is 10080" },
                })}
              />
              {errors.weekly_time_budget_min && (
                <p className="text-xs text-red-600">
                  {errors.weekly_time_budget_min.message as string}
                </p>
              )}
            </Field>
            <Field label="Preferred session length (minutes)">
              <Input
                type="number"
                inputMode="numeric"
                min={10}
                max={480}
                placeholder="e.g., 45"
                aria-invalid={!!errors.preferred_session_min}
                className={
                  errors.preferred_session_min ? "border-red-500" : undefined
                }
                {...register("preferred_session_min", {
                  valueAsNumber: true,
                  required: "Required",
                  min: { value: 10, message: "Must be ≥ 10" },
                  max: { value: 480, message: "Max is 480" },
                })}
              />
              {errors.preferred_session_min && (
                <p className="text-xs text-red-600">
                  {errors.preferred_session_min.message as string}
                </p>
              )}
            </Field>
          </Row>
        </Section>

        {/* AI Profile (defaults + custom) (collapsible, collapsed by default) */}
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

        {/* Language Proficiency (collapsible, collapsed by default) */}
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
                          errors.language_proficiencies[idx]?.language_code
                            ?.message
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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

        {/* Prior knowledge (tags) (collapsible, collapsed by default) */}
        <Section
          title="Prior knowledge"
          description="Add tags and press Enter or comma."
          collapsible
          defaultOpen={false}
        >
          <Field label="Tags">
            <TagsInput
              value={values.prior_knowledge_tags}
              onChange={(tags) =>
                setValue("prior_knowledge_tags", tags, { shouldDirty: true })
              }
              placeholder="algebra, data structures, git"
            />
          </Field>
        </Section>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            className="rounded-xl"
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="rounded-xl"
            disabled={isSubmitting || (!isDirty && !submitted)}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </form>

      {submitted && (
        <Section
          title="Submitted payload"
          description="This is what would be sent to your API."
          collapsible
          defaultOpen={false}
        >
          <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-auto">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </Section>
      )}
    </div>
  );
}
