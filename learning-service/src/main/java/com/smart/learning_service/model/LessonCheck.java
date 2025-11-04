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
@Table("lesson_checks")
public class LessonCheck {
    @Id
    private UUID id;

    @Column("lesson_id")
    private UUID lessonId;

    @Column("q_order")
    private int qOrder;

    private String question;
    private String answer;

    @Column("created_at")
    private OffsetDateTime createdAt;
}
