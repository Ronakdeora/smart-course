package com.smart.learning_service.repository;

import com.smart.learning_service.model.LessonBody;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import java.util.UUID;

public interface LessonBodyRepository extends ReactiveCrudRepository<LessonBody, UUID> {
}
