package com.smart.learning_service.services;

import com.smart.common.security.SecurityUtils;
import com.smart.learning_service.model.Course;
import com.smart.learning_service.model.Lesson;
import com.smart.learning_service.model.LessonBody;
import com.smart.learning_service.repository.CourseRepository;
import com.smart.learning_service.repository.LessonRepository;
import com.smart.learning_service.repository.LessonBodyRepository;
import com.smart.learning_service.repository.LessonCheckRepository;
import com.smart.learning_service.services.rabbitmq.publisher.CoursePublisher;
import com.smart.learning_service.utils.dtos.CourseContentDTO;
import com.smart.learning_service.utils.dtos.CourseGenerationRequestDTO;
import com.smart.learning_service.utils.dtos.CourseGenerationResponseDTO;
import com.smart.learning_service.utils.dtos.LessonContentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonBodyRepository lessonBodyRepository;
    private final LessonCheckRepository lessonCheckRepository;
    private final CoursePublisher coursePublisher;

    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    public Flux<Course> getCoursesForUser(UUID userId) {
        return courseRepository.findAll()
                .filter(course -> course.getUserId().equals(userId));
    }

    public Mono<CourseContentDTO> getCourseById(UUID courseId) {
        logger.info("Fetching course content for courseId: {}", courseId);
        return courseRepository.findById(courseId)
            .flatMap(course -> lessonRepository.findAll()
                .filter(lesson -> lesson.getCourseId().equals(courseId))
                .flatMap(lesson -> lessonBodyRepository.findById(lesson.getId())
                    .map(lessonBody -> {
                        logger.debug("Fetched lesson body for lessonId: {}", lesson.getId());
                        return new LessonContentDTO(
                            lesson.getId(),
                            lesson.getTitle(),
                            lesson.getDescription(),
                            lesson.getLessonNumber(),
                            lesson.getKeyConcepts(),
                            lesson.getLearningObjectives(),
                            lesson.getSources(),
                            lessonBody.getContentMd(),
                            lessonBody.getContentJson()
                        );
                    })
                )
                .collectList()
                .map(lessonContentList -> {
                    logger.info("Aggregated {} lessons for courseId: {}", lessonContentList.size(), courseId);
                    return new CourseContentDTO(
                        course.getId(),
                        course.getTitle(),
                        course.getTopic(),
                        course.getGradeLevel(),
                        course.getSourceFilter(),
                        course.getTotalLessons(),
                        course.getOutlineJson(),
                        course.getStatus(),
                        course.getErrorMessage(),
                        lessonContentList
                    );
                })
            )
            .doOnError(e -> logger.error("Error fetching course content for courseId: {}: {}", courseId, e.getMessage(), e));
    }

    public Mono<CourseGenerationResponseDTO> createCourse(CourseGenerationRequestDTO requestDTO) {
        // Ensure there's a requestId
        if (!StringUtils.hasText(requestDTO.getRequestId())) {
            requestDTO.setRequestId(UUID.randomUUID().toString());
        }

        // Resolve userId from SecurityUtils as a String (empty string = no user).
        return SecurityUtils.getUserId()
            .map(UUID::toString)
            .defaultIfEmpty("") // use empty sentinel to avoid null emissions
            .flatMap(userIdStr -> {
                // If security provides a user and DTO doesn't have one, set it.
                if (StringUtils.hasText(userIdStr) && !StringUtils.hasText(requestDTO.getUserId())) {
                    requestDTO.setUserId(userIdStr);
                }

                logger.info("Publishing course generation request for userId: {}, topic: {}", requestDTO.getUserId(), requestDTO.getTopic());

                // Use Mono.defer so synchronous exceptions from the publisher become onError signals
                return Mono.defer(() -> {
                    coursePublisher.publishCourseGenerationRequest(requestDTO);
                    logger.info("Course generation request published for requestId: {}", requestDTO.getRequestId());
                    return Mono.just(new CourseGenerationResponseDTO(
                        requestDTO.getUserId(),
                        null,
                        "QUEUED",
                        "Course generation request submitted."
                    ));
                });
            })
            .onErrorResume(e -> {
                logger.error("Unexpected error creating course for requestId {}: {}", requestDTO.getRequestId(), e.getMessage(), e);
                return Mono.just(new CourseGenerationResponseDTO(
                    requestDTO.getUserId(),
                    null,
                    "FAILED",
                    "Failed to submit course generation request: " + e.getMessage()
                ));
            });
    }

    public Flux<Lesson> getLessonsForCourse(UUID courseId) {
        return lessonRepository.findAll()
                .filter(lesson -> lesson.getCourseId().equals(courseId));
    }

    public Mono<Lesson> getLessonById(UUID lessonId) {
        return lessonRepository.findById(lessonId);
    }
}
