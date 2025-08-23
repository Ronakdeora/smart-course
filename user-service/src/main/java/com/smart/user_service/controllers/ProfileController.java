package com.smart.user_service.controllers;


import com.smart.common_libs.entities.commonDTOs.user_service.UserProfileDto;
import com.smart.user_service.security.SecurityUtils;
import com.smart.user_service.services.UserProfileService;
import com.smart.user_service.utils.enitities.UserProfile;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class ProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public Mono<String> getUser(){
        return SecurityUtils.getUserName();
    }


    @PatchMapping
    public Mono<ResponseEntity<UserProfile>> patch(
            @RequestBody UserProfileDto req) {
        return userProfileService.patchProfile( req )
                .map(ResponseEntity::ok);
    }
}
