package com.smart.learning_service.repository;

import com.smart.learning_service.model.Course;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import java.util.UUID;

public interface CourseRepository extends ReactiveCrudRepository<Course, UUID> {
}
