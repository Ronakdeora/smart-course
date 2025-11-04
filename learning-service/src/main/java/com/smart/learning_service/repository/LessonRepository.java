package com.smart.learning_service.repository;

import com.smart.learning_service.model.Lesson;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import java.util.UUID;

public interface LessonRepository extends ReactiveCrudRepository<Lesson, UUID> {
}
