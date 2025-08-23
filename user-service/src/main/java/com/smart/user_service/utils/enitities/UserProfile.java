package com.smart.user_service.utils.enitities;


import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.r2dbc.postgresql.codec.Json;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("user_profile")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {

    @Id
    @Column("user_id") private UUID id;

    @Column("email") private String email;
    @Column("full_name") private String fullName;
    @Column("standard_level") private String standardLevel;
    @Column("bio") private String bio;
    @Column("timezone") private String timezone;
    @Column("locale") private String locale;
    @Column("learning_style") private String learningStyle; // ensure column name matches db (snake vs camel)
    @Column("accessibility_notes") private String accessibilityNotes;
    @Column("goals") private String goals;
    @Column("prior_knowledge_tags") private String[] priorKnowledgeTags;

    @Column("ai_profile")
    private Json aiProfile;
    // or private JsonNode aiProfile;  (with converters)

    @Column("weekly_time_budget_min") private Integer weeklyTimeBudgetMin;
    @Column("preferred_session_min") private Integer preferredSessionMin;

    @CreatedDate @Column("created_at") private Instant createdAt;
    @LastModifiedDate @Column("updated_at") private Instant updatedAt;
}

