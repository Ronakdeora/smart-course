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
@Table("lesson_bodies")
public class LessonBody {
    @Id
    @Column("lesson_id")
    private UUID lessonId;

    @Column("content_md")
    private String contentMd;

    @Column("content_json")
    private String contentJson;

    @Column("updated_at")
    private OffsetDateTime updatedAt;
}
