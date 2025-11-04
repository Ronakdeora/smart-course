package com.smart.user_service.services;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart.common_libs.entities.commonDTOs.user_service.UserProfileDto;
import com.smart.common_libs.entities.responseDTOs.auth_service.StandardMessage;
import com.smart.common.security.SecurityUtils;
import com.smart.user_service.utils.enitities.UserLanguageProficiency;
import com.smart.user_service.utils.enitities.UserProfile;
import io.r2dbc.postgresql.codec.Json;
import io.r2dbc.postgresql.codec.PostgresqlObjectId;
import io.r2dbc.spi.Parameters;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.relational.core.query.Criteria;
import org.springframework.data.relational.core.query.Query;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.BiConsumer;

@Service
@AllArgsConstructor
@Slf4j
public class UserProfileService {

    private final ObjectMapper mapper;
    private final R2dbcEntityTemplate template;

    public Mono<UserProfile> getUserProfile(UUID userId) {
        Mono<UserProfile> profileMono = template.selectOne(
                Query.query(Criteria.where("user_id").is(userId)),
                UserProfile.class
        );

        Mono<List<UserLanguageProficiency>> langsMono = template.select(
                Query.query(Criteria.where("user_id").is(userId)),
                UserLanguageProficiency.class
        ).collectList();

        return profileMono.zipWith(langsMono,(profile,langs) -> {
            if (profile != null ) profile.setLanguageProficiencies(langs);
            return profile;
        });
    }

    private Mono<Void> replaceLanguageProficiencies(UUID userId, UserProfileDto req) {
        var list = req.languageProficiencies();
        if (list == null) return Mono.empty(); // no change requested

        Mono<Long> deleteAll = template.getDatabaseClient()
                .sql("DELETE FROM user_language_proficiencies WHERE user_id = :userId")
                .bind("userId", userId)
                .fetch().rowsUpdated();

        // If list is empty, just clear and return
        if (list.isEmpty()) return deleteAll.then();

        final String INSERT = """
      INSERT INTO user_language_proficiencies
        (user_id, language_code, level, last_assessed_at)
      VALUES (:userId, :code, :level::proficiency_level, :last)
    """;

        Mono<Void> inserts = Flux.fromIterable(list)
                .concatMap(lp -> {
                    var spec = template.getDatabaseClient()
                            .sql(INSERT)
                            .bind("userId", userId)
                            .bind("code", lp.languageCode().trim().toLowerCase())
                            .bind("level", lp.level()); // "A1".."C2","Native"

                    if (lp.lastAssessedAt() != null && !lp.lastAssessedAt().isBlank()) {
                        LocalDate ld = LocalDate.parse(lp.lastAssessedAt()); // "2024-06-01"
                        spec = spec.bind("last", ld);
                    } else {
                        spec = spec.bindNull("last", LocalDate.class);
                    }
                    return spec.fetch().rowsUpdated();
                })
                .then();

        return deleteAll.then(inserts);
    }


    public Mono<StandardMessage> patchProfile(UserProfileDto req) {
        log.debug("{}", req);
        return SecurityUtils.getUserId().flatMap(userId -> {
            StringBuilder sql = new StringBuilder("UPDATE user_profile SET ");
            Map<String, Object> params = new LinkedHashMap<>();

            BiConsumer<String, Object> add = (col, val) -> {
                if (val != null) {
                    if (!params.isEmpty()) sql.append(", ");
                    String p = col.replaceAll("[^a-zA-Z0-9]", "");
                    sql.append(col).append(" = :").append(p);
                    params.put(p, val);
                }
            };

            // fields
            add.accept("email", req.email());
            add.accept("full_name", req.fullName());
            add.accept("standard_level", req.standardLevel());
            add.accept("bio", req.bio());
            add.accept("timezone", req.timezone());
            add.accept("locale", req.locale());
            add.accept("learning_style", req.learningStyle());
            add.accept("accessibility_notes", req.accessibilityNotes());
            add.accept("goals", req.goals());

            if (req.priorKnowledgeTags() != null) {
                add.accept("prior_knowledge_tags",
                        Parameters.in(PostgresqlObjectId.VARCHAR_ARRAY, req.priorKnowledgeTags()));
            }
            if (req.aiProfile() != null) {
                add.accept("ai_profile",
                        Parameters.in(PostgresqlObjectId.JSONB, toPgJson(req.aiProfile(), mapper)));
            }

            add.accept("weekly_time_budget_min", req.weeklyTimeBudgetMin());
            add.accept("preferred_session_min", req.preferredSessionMin());

            // Nothing to update -> return message (IMPORTANT: no UserProfile here)
            if (params.isEmpty()) {
                return Mono.just(new StandardMessage("No changes to update"));
            }

            // Build SQL (no RETURNING, since we won't read rows)
            sql.append(", updated_at = NOW() WHERE user_id = :userId ");
            params.put("userId", userId);

            if (req.ifUnmodifiedSince() != null) {
                sql.append("AND updated_at = :prevUpdatedAt ");
                params.put("prevUpdatedAt", req.ifUnmodifiedSince());
            }

            Mono<Long> updateProfile = template.getDatabaseClient()
                    .sql(String.valueOf(sql))
                    .bind("userId", userId)
                    .bindValues(params)
                    .fetch().rowsUpdated();

            // Chain: update profile -> upsert languages -> return message
            return updateProfile
                    .then(replaceLanguageProficiencies(userId, req))
                    .thenReturn(new StandardMessage("Profile updated successfully"));
        });
    }



    private static Json toPgJson(Map<String,Object> node, ObjectMapper mapper) {
        if (node == null) return null;
        try { return Json.of(mapper.writeValueAsString(node)); }
        catch (Exception e) { throw new RuntimeException("ai_profile JSON serialization failed", e); }
    }
}
