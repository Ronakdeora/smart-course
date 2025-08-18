package com.smart.user_service.services.rabbitmq.consumers;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@AllArgsConstructor
@Slf4j
@EnableRabbit
public class Listener {
//    @Value("${spring.rabbitmq.queue.user_created")
//    private String userCreateQ;

    private final DatabaseClient db;

    @RabbitListener(queues = "user.created.q")
    public void onRegistered(Map<String, String> evt) {
        UUID userId = UUID.fromString(evt.get("user_id"));
        String email = evt.get("email");
        String name = evt.get("full_name");

        log.info(String.valueOf(userId));
        log.info(email);
        log.info(name);
        try {
            Long n = db.sql("""
                            INSERT INTO user_profile (user_id, email, full_name)
                            VALUES (:id, :email, :name)
                            """)
                    .bind("id", userId)
                    .bind("email", email)
                    .bind("name", name)
                    .fetch()
                    .rowsUpdated()
                    .block();                      // <- execute now

            log.info("User Created Successfully"); // should be 1
        } catch (Exception e) {
            // Let the listener fail so the message can be retried/DLX as per your config
            throw e;
        }
    }
}
