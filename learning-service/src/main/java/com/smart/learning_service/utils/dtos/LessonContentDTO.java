package com.smart.learning_service.utils.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LessonContentDTO {
    private UUID id;
    private String title;
    private String description;
    private int lessonNumber;
    private String[] keyConcepts;
    private String[] learningObjectives;
    private String[] sources;
    private String contentMd;
    private String contentJson;
}

