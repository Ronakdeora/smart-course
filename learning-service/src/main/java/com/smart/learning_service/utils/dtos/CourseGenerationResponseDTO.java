package com.smart.learning_service.utils.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseGenerationResponseDTO {
    private String userId;
    private String courseId;
    private String status; // SUCCESS or FAILED
    private String message;
}
