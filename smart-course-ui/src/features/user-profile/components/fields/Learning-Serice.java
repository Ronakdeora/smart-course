// This File Is For Referencing BackEnd Implementation Of Learning Service( Responsible For Course And Lesson Management)

package com.smart.learning_service.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smart.learning_service.model.Course;
import com.smart.learning_service.model.Lesson;
import com.smart.learning_service.services.CourseService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.smart.learning_service.utils.dtos.CourseContentDTO;
import com.smart.learning_service.utils.dtos.CourseGenerationRequestDTO;
import com.smart.learning_service.utils.dtos.CourseGenerationResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    @GetMapping(value = "/user/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<Course> getCoursesForUser(@PathVariable UUID userId) {
        logger.info("Received request to fetch courses for userId: {}", userId);
        return courseService.getCoursesForUser(userId);
    }

    @GetMapping(value = "/{courseId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<CourseContentDTO> getCourseById(@PathVariable UUID courseId) {
        logger.info("Received request to fetch course content for courseId: {}", courseId);
        return courseService.getCourseById(courseId)
            .doOnSuccess(dto -> logger.info("Successfully fetched course content for courseId: {}", courseId))
            .doOnError(e -> logger.error("Error fetching course content for courseId: {}: {}", courseId, e.getMessage(), e));
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<CourseGenerationResponseDTO> createCourse(@RequestBody CourseGenerationRequestDTO requestDTO) {
        logger.info("Received request to generate course for userId: {}, topic: {}", requestDTO.getUserId(), requestDTO.getTopic());
        return courseService.createCourse(requestDTO)
            .doOnSuccess(resp -> logger.info("Course generation request status for userId: {}: {}", requestDTO.getUserId(), resp.getStatus()))
            .doOnError(e -> logger.error("Error publishing course generation request for userId: {}: {}", requestDTO.getUserId(), e.getMessage(), e));
    }

    @GetMapping(value = "/{courseId}/lessons", produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<Lesson> getLessonsForCourse(@PathVariable UUID courseId) {
        logger.info("Received request to fetch lessons for courseId: {}", courseId);
        return courseService.getLessonsForCourse(courseId);
    }

    @GetMapping(value = "/lessons/{lessonId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Lesson> getLessonById(@PathVariable UUID lessonId) {
        logger.info("Received request to fetch lesson for lessonId: {}", lessonId);
        return courseService.getLessonById(lessonId)
            .doOnSuccess(lesson -> logger.info("Successfully fetched lesson for lessonId: {}", lessonId))
            .doOnError(e -> logger.error("Error fetching lesson for lessonId: {}: {}", lessonId, e.getMessage(), e));
    }
}



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


public class CourseGenerationResponseDTO {
    private String userId;
    private String courseId;
    private String status; // SUCCESS or FAILED
    private String message;
}
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
    private List<com.smart.learning_service.utils.dtos.LessonContentDTO> lessons;
}
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

