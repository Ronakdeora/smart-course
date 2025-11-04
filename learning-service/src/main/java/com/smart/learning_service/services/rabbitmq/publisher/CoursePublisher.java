package com.smart.learning_service.services.rabbitmq.publisher;

import com.smart.learning_service.utils.dtos.CourseGenerationRequestDTO;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CoursePublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${spring.rabbitmq.exchange.course}")
    private String courseExchange;

    @Value("${spring.rabbitmq.route.course_generate}")
    private String courseGenerateRoutingKey;

    public CoursePublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishCourseGenerationRequest(CourseGenerationRequestDTO request) {
        try {
            rabbitTemplate.convertAndSend(courseExchange, courseGenerateRoutingKey, request);
            System.out.println("Course generation request published for user: " + request.getUserId());
        } catch (Exception e) {
            System.err.println("Failed to publish course generation request: " + e.getMessage());
            throw new RuntimeException("Failed to publish course generation request", e);
        }
    }
}