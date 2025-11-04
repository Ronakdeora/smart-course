package com.smart.user_service.services.rabbitmq.config;

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

    @Value("${spring.rabbitmq.exchange.user")
    private String userExchange;
    @Value("${spring.rabbitmq.queue.user_created")
    private String userCreateQ;
    @Value("${spring.rabbitmq.route.user_created")
    private String userRoutingKey;


//    private String userExchange = "user.exchange";
//    private String userCreateQ = "user.created.q";
//    private String userRoutingKey = "user.created";


    @Bean
    public Queue userCreateQueue() {
        return new Queue(userCreateQ); // durable
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(userExchange, true, false); // durable, not auto-delete
    }
    @Bean
    public Binding userBinding(Queue authQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(authQueue).to(authExchange).with(userRoutingKey);
    }

    @Bean
    public MessageConverter jacksonConverter(ObjectMapper mapper) {
        var conv = new Jackson2JsonMessageConverter(mapper);
        conv.setAlwaysConvertToInferredType(true); // infer type from listener arg
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
                        .maxAttempts(5)                         // total tries = 5
                        .backOffOptions(1000, 2.0, 10_000)      // 1s, 2x, max 10s (example)
                        .recoverer(new RejectAndDontRequeueRecoverer())
                        .build()
        );
        return f;
    }

}
