package com.smart.learning_service.services.rabbitmq.consumer;

import com.smart.learning_service.utils.dtos.CourseGenerationResponseDTO;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class CourseConsumer {

    @RabbitListener(queues = "${spring.rabbitmq.queue.course_status}")
    public void handleCourseGenerationResponse(CourseGenerationResponseDTO response) {
        try {
            System.out.println("Received course generation response for user: " + response.getStatus());

            if ("SUCCESS".equalsIgnoreCase(response.getStatus())) {
                handleSuccessfulCourseGeneration(response);
            } else if ("FAILED".equalsIgnoreCase(response.getStatus())) {
                handleFailedCourseGeneration(response);
            }

        } catch (Exception e) {
            System.err.println("Error processing course generation response: " + e.getMessage());
        }
    }

    private void handleSuccessfulCourseGeneration(CourseGenerationResponseDTO response) {
        System.out.println("Course generated successfully!");
        System.out.println("Course ID: " + response.getCourseId());
        System.out.println("User ID: " + response.getUserId());
        System.out.println("Message: " + response.getMessage());

        // Add your business logic here
        // For example: update database, send notification, etc.
    }

    private void handleFailedCourseGeneration(CourseGenerationResponseDTO response) {
        System.out.println("Course generation failed!");
        System.out.println("User ID: " + response.getUserId());
        System.out.println("Error Message: " + response.getMessage());

        // Add your error handling logic here
        // For example: log error, notify user, retry logic, etc.
    }
}