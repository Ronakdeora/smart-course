package com.smart.auth_service.utils.repositories;

import com.smart.auth_service.utils.entities.Account;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface AccountRepo extends ReactiveCrudRepository<Account, UUID> {
    Mono<Account> findByEmail(String email);  // works great with CITEXT
    Mono<Account> findByGoogleId(String googleId);  // find by Google OAuth ID
}

