package com.smart.auth_service.services.rabbitmq.publishers;

import com.smart.auth_service.services.rabbitmq.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MQPublisher {

    private final RabbitTemplate rabbit;

    public void userRegistered(UUID userId, String email, String full_name ){
        Map<String,String> payload = Map.of("user_id", userId.toString(), "email", email, "full_name", full_name);
        rabbit.convertAndSend(RabbitConfig.EXCHANGE_NAME,RabbitConfig.ROUTING_KEY,payload);
    }

}
