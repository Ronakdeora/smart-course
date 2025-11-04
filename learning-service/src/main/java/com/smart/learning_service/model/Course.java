package com.smart.learning_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("courses")
public class Course {
    @Id
    private UUID id;

    @Column("user_id")
    private UUID userId;

    private String title;
    private String topic;
    @Column("grade_level")
    private String gradeLevel;
    @Column("source_filter")
    private String sourceFilter;
    @Column("total_lessons")
    private int totalLessons;
    @Column("outline_json")
    private String outlineJson;
    private String status;
    @Column("error_message")
    private String errorMessage;
    @Column("generated_at")
    private OffsetDateTime generatedAt;
    @Column("created_at")
    private OffsetDateTime createdAt;
    @Column("updated_at")
    private OffsetDateTime updatedAt;
}
