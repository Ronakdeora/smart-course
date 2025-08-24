package com.smart.user_service.controllers;


import com.smart.common_libs.entities.commonDTOs.user_service.UserProfileDto;
import com.smart.common_libs.entities.responseDTOs.auth_service.StandardMessage;
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
@RequestMapping("/profile")
@AllArgsConstructor
public class ProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public Mono<ResponseEntity<UserProfile>> getUser(){
        return SecurityUtils.getUserId().flatMap(uuid ->
                userProfileService.getUserProfile(uuid).map(ResponseEntity::ok));
    }


    @PatchMapping
    public Mono<ResponseEntity<StandardMessage>> updateUserProfile(
            @RequestBody UserProfileDto req) {
        return userProfileService.patchProfile( req )
                .map(ResponseEntity::ok);
    }
}
