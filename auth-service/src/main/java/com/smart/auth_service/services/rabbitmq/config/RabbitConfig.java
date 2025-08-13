package com.smart.auth_service.services.rabbitmq.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitConfig {

    public static final String QUEUE_NAME = "auth.queue";
    public static final String EXCHANGE_NAME = "auth.exchange";
    public static final String ROUTING_KEY = "auth.created";

    // for user registration
    @Bean
    public Queue orderQueue() {
        return new Queue(QUEUE_NAME, false); // durable
    }

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue orderQueue, TopicExchange orderExchange) {
        return BindingBuilder
                .bind(orderQueue)
                .to(orderExchange)
                .with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter(
            ObjectMapper mapper) {
        var c = new Jackson2JsonMessageConverter(mapper);
        c.setAlwaysConvertToInferredType(true);
        return c;
    }
}
