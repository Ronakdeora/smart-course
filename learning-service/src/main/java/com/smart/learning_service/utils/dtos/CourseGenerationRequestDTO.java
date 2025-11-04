package com.smart.learning_service.utils.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseGenerationRequestDTO {
    @JsonProperty("request_id")
    private String requestId;
    @JsonProperty("user_id")
    private String userId;
    @JsonProperty("topic")
    private String topic;
    @JsonProperty("grade_level")
    private String gradeLevel;
    @JsonProperty("num_lessons")
    private int numLessons;
    @JsonProperty("source_filter")
    private String sourceFilter;
}
