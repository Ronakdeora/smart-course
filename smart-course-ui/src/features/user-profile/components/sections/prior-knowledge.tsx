import { Section } from "../fields/section";
import { Field } from "../fields/field";
import { TagsInput } from "../fields/tags-input";
import type { UserProfileFormValues } from "@/features/user-profile/utils/types";
import { useFormContext } from "react-hook-form";

const PriorKnowledgeSection = () => {
  const { watch, setValue } = useFormContext<UserProfileFormValues>();
  const values = watch().prior_knowledge_tags;
  return (
    <Section
      title="Prior knowledge"
      description="Add tags and press Enter or comma."
      collapsible
      defaultOpen={false}
    >
      <Field label="Tags">
        <TagsInput
          value={values}
          onChange={(tags) =>
            setValue("prior_knowledge_tags", tags, { shouldDirty: true })
          }
          placeholder="algebra, data structures, git"
        />
      </Field>
    </Section>
  );
};

export default PriorKnowledgeSection;
