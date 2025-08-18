package com.smart.auth_service.services.rabbitmq.config;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

//    @Value("${spring.rabbitmq.exchange.user")
//    private String userExchange;
//    @Value("${spring.rabbitmq.queue.user_created")
//    private String userCreateQ;
//    @Value("${spring.rabbitmq.route.user_created")
//    private String userRoutingKey;


    private String userExchange = "user.exchange";
    private String userCreateQ = "user.deleted.q";
    private String userRoutingKey = "user.deleted";

    @Bean
    public Queue authQueue() {
        return new Queue(userCreateQ); // durable
    }

    @Bean
    public TopicExchange authExchange() {
        return new TopicExchange(userExchange, true, false); // durable, not auto-delete
    }
    @Bean
    public Binding authBinding(Queue authQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(authQueue).to(authExchange).with(userRoutingKey);
    }

    @Bean
    public MessageConverter messageConverter(ObjectMapper mapper) {
        var c = new Jackson2JsonMessageConverter(mapper);
        c.setAlwaysConvertToInferredType(true);
        return c;
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
        return f;
    }
}
