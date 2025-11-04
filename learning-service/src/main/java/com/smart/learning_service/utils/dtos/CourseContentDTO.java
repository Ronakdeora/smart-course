package com.smart.learning_service.utils.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseContentDTO {
    private UUID id;
    private String title;
    private String topic;
    private String gradeLevel;
    private String sourceFilter;
    private int totalLessons;
    private String outlineJson;
    private String status;
    private String errorMessage;
    private List<LessonContentDTO> lessons;
}

