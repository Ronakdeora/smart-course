package com.smart.learning_service;

import com.smart.learning_service.services.rabbitmq.publisher.CoursePublisher;
import com.smart.learning_service.utils.dtos.CourseGenerationRequestDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class LearningServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LearningServiceApplication.class, args);
	}

//	@Bean
//	CommandLineRunner testRabbitMQ(CoursePublisher coursePublisher) {
//		return args -> {
//			CourseGenerationRequestDTO testRequest = new CourseGenerationRequestDTO();
//			testRequest.setRequestId(UUID.randomUUID().toString());
//			testRequest.setUserId("782377c3-5e45-476e-a0db-25e7b24a66d1");
//			testRequest.setTopic("Gram staining");
//			testRequest.setGradeLevel("Grade 8");
//			testRequest.setNumLessons(2);
//			testRequest.setSourceFilter("/microbiology");
//
//			coursePublisher.publishCourseGenerationRequest(testRequest);
//			System.out.println("Test course generation request sent to RabbitMQ.");
//		};
//	}

}
