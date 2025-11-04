package com.smart.learning_service.repository;

import com.smart.learning_service.model.LessonCheck;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import java.util.UUID;

public interface LessonCheckRepository extends ReactiveCrudRepository<LessonCheck, UUID> {
}
