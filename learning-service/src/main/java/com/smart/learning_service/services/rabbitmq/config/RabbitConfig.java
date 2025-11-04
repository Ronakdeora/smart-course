package com.smart.learning_service.services.rabbitmq.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Value("${spring.rabbitmq.exchange.course}")
    private String courseExchange;

    @Value("${spring.rabbitmq.queue.course_generate}")
    private String courseGenerationQueue;

    @Value("${spring.rabbitmq.queue.course_status}")
    private String courseStatusQueue;

    @Value("${spring.rabbitmq.route.course_generate}")
    private String courseGenerateRoutingKey;

    @Value("${spring.rabbitmq.route.course_status}")
    private String courseStatusRoutingKey;

    @Bean
    public Queue courseGenerationQueue() {
        return new Queue(courseGenerationQueue, true);
    }

    @Bean
    public Queue courseStatusQueue() {
        return new Queue(courseStatusQueue, true);
    }

    @Bean
    public TopicExchange courseExchange() {
        return new TopicExchange(courseExchange, true, false);
    }

    @Bean
    public Binding courseGenerationBinding() {
        return BindingBuilder.bind(courseGenerationQueue()).to(courseExchange()).with(courseGenerateRoutingKey);
    }

    @Bean
    public Binding courseStatusBinding() {
        return BindingBuilder.bind(courseStatusQueue()).to(courseExchange()).with(courseStatusRoutingKey);
    }

    @Bean
    public MessageConverter jacksonConverter(ObjectMapper mapper) {
        var conv = new Jackson2JsonMessageConverter(mapper);
        conv.setAlwaysConvertToInferredType(true);
        return conv;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf, MessageConverter mc) {
        var t = new RabbitTemplate(cf);
        t.setMessageConverter(mc);
        return t;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory cf, MessageConverter mc) {
        var f = new SimpleRabbitListenerContainerFactory();
        f.setConnectionFactory(cf);
        f.setMessageConverter(mc);
        f.setAcknowledgeMode(AcknowledgeMode.AUTO);
        f.setDefaultRequeueRejected(false);
        f.setAdviceChain(
                RetryInterceptorBuilder.stateless()
                        .maxAttempts(5)
                        .backOffOptions(1000, 2.0, 10_000)
                        .recoverer(new RejectAndDontRequeueRecoverer())
                        .build()
        );
        return f;
    }
}