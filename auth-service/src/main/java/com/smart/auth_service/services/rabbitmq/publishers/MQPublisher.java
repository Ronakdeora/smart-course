package com.smart.auth_service.services.rabbitmq.publishers;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@EnableRabbit
public class MQPublisher {
    public static final String EXCHANGE_NAME = "user.exchange";
    public static final String ROUTING_KEY = "user.created";

    private final RabbitTemplate rabbit;

    public void userRegistered(UUID userId, String email, String full_name ){
        Map<String,String> payload = Map.of("user_id", userId.toString(), "email", email, "full_name", full_name);
        rabbit.convertAndSend(EXCHANGE_NAME,ROUTING_KEY,payload);
    }

}
