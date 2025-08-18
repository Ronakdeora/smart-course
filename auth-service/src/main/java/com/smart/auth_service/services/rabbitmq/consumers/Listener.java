package com.smart.auth_service.services.rabbitmq.consumers;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@AllArgsConstructor
@Slf4j
@EnableRabbit
public class Listener {
//    private final DatabaseClient db;

    @RabbitListener(queues = "user.deleted.q")
    public void onRegistered(Map<String, String> evt) {
        UUID userId = UUID.fromString(evt.get("user_id"));
        String email = evt.get("email");
        String name = evt.get("full_name");
        log.info("{},{},{}",userId,email,name);
    }
}

