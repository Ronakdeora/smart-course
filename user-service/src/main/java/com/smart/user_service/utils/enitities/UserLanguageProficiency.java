package com.smart.user_service.utils.enitities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.time.LocalDate;
import java.util.UUID;

@Table("user_language_proficiencies")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserLanguageProficiency {

    public enum ProficiencyLevel { A1, A2, B1, B2, C1, C2, Native }

    @Id
    private Long id;

    @Column("user_id")
    private UUID userId;

    @Column("language_code")
    private String languageCode;

    @Column("level")
    private ProficiencyLevel level; // maps via String <-> enum; works fine for PG enum

    @Column("last_assessed_at")
    private LocalDate lastAssessedAt;
}

