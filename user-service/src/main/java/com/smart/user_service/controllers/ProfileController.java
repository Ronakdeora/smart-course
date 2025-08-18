package com.smart.user_service.controllers;


import com.smart.user_service.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/user")
public class ProfileController {

    @GetMapping("/getUser")
    public Mono<String> getUser(){
        return SecurityUtils.getUserName();
    }
}
