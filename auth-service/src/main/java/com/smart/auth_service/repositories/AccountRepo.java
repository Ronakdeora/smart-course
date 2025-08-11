package com.smart.auth_service.repositories;

import com.smart.auth_service.entities.Account;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface AccountRepo extends ReactiveCrudRepository<Account, UUID> {
    Mono<Account> findByEmail(String email);  // works great with CITEXT
}

