package com.smart.user_service.utils.repositories;

import com.smart.user_service.utils.enitities.UserLanguageProficiency;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface UserLanguageProficiencyRepo extends ReactiveCrudRepository<UserLanguageProficiency, Long> {
}
