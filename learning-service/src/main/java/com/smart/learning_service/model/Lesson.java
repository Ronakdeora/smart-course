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
@Table("lessons")
public class Lesson {
    @Id
    private UUID id;

    @Column("course_id")
    private UUID courseId;

    @Column("lesson_number")
    private int lessonNumber;

    private String title;
    private String description;

    @Column("key_concepts")
    private String[] keyConcepts;

    @Column("learning_objectives")
    private String[] learningObjectives;

    private String[] sources;

    @Column("generated_at")
    private OffsetDateTime generatedAt;
    @Column("created_at")
    private OffsetDateTime createdAt;
    @Column("updated_at")
    private OffsetDateTime updatedAt;
}
