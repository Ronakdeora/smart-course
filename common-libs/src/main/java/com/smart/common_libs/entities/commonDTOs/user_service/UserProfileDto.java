package com.smart.common_libs.entities.commonDTOs.user_service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record UserProfileDto(
        String email,
        String fullName,
        String standardLevel,
        String bio,
        String timezone,
        String locale,
        String learningStyle,
        String accessibilityNotes,
        String goals,
        String[] priorKnowledgeTags,
        Map<String,Object> aiProfile,
        List<LanguageProficiency> languageProficiencies,
        Integer weeklyTimeBudgetMin,
        Integer preferredSessionMin,
        Instant ifUnmodifiedSince // optimistic concurrency (matches current updated_at)
) {}
