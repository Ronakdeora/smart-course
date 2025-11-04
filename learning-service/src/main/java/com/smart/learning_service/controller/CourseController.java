package com.smart.learning_service.controller;

import com.smart.common.security.SecurityUtils;
import com.smart.learning_service.model.Course;
import com.smart.learning_service.model.Lesson;
import com.smart.learning_service.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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

    @GetMapping(value = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<Course> getCoursesForUser() {
        return SecurityUtils.getUserId()
                .doOnNext(userId -> logger.info("Received request to fetch courses for userId: {}", userId))
                .flatMapMany(courseService::getCoursesForUser)
                .switchIfEmpty(Flux.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated")));
    }

    @GetMapping(value = "/{courseId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<CourseContentDTO> getCourseById(@PathVariable("courseId") UUID courseId) {
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
    public Flux<Lesson> getLessonsForCourse(@PathVariable("courseId") UUID courseId) {
        logger.info("Received request to fetch lessons for courseId: {}", courseId);
        return courseService.getLessonsForCourse(courseId);
    }

    @GetMapping(value = "/lessons/{lessonId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Lesson> getLessonById(@PathVariable("lessonId") UUID lessonId) {
        logger.info("Received request to fetch lesson for lessonId: {}", lessonId);
        return courseService.getLessonById(lessonId)
            .doOnSuccess(lesson -> logger.info("Successfully fetched lesson for lessonId: {}", lessonId))
            .doOnError(e -> logger.error("Error fetching lesson for lessonId: {}: {}", lessonId, e.getMessage(), e));
    }
}
