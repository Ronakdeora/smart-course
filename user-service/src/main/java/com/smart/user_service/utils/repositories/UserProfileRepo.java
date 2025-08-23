package com.smart.user_service.utils.repositories;

import com.smart.user_service.utils.enitities.UserProfile;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import java.util.UUID;

public interface UserProfileRepo extends ReactiveCrudRepository<UserProfile, UUID> {
}
