package com.smart.user_service.services;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart.common_libs.entities.commonDTOs.user_service.UserProfileDto;
import com.smart.user_service.security.SecurityUtils;
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
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.BiConsumer;

@Service
@AllArgsConstructor
@Slf4j
public class UserProfileService {

    private final ObjectMapper mapper;
    private final R2dbcEntityTemplate template;

    private static Json toPgJson(Map<String,Object> node, ObjectMapper mapper) {
        if (node == null) return null;
        try { return Json.of(mapper.writeValueAsString(node)); }
        catch (Exception e) { throw new RuntimeException("ai_profile JSON serialization failed", e); }
    }

    public Mono<UserProfile> findOne(UUID userId) {
        return template.selectOne(
                Query.query(Criteria.where("user_id").is(userId)),
                UserProfile.class
        );
    }
    public Mono<UserProfile> patchProfile( UserProfileDto req) {
        log.debug("{}",req);
        return SecurityUtils.getUserId().flatMap(userId ->
        {
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

            add.accept("email", req.email());
            add.accept("full_name", req.fullName());
            add.accept("standard_level", req.standardLevel());
            add.accept("bio", req.bio());
            add.accept("timezone", req.timezone());
            add.accept("locale", req.locale());
            add.accept("learning_style", req.learningStyle());
            add.accept("accessibility_notes", req.accessibilityNotes());
            add.accept("goals", req.goals());

            // ARRAY (_varchar). If you stored TEXT[], use VARCHAR_ARRAY or TEXT_ARRAY.
            if (req.priorKnowledgeTags() != null) {
                add.accept("prior_knowledge_tags", Parameters.in(PostgresqlObjectId.VARCHAR_ARRAY, req.priorKnowledgeTags()));
            }

            // JSONB
            if (req.aiProfile() != null) {
                add.accept("ai_profile", Parameters.in(PostgresqlObjectId.JSONB, toPgJson(req.aiProfile(), mapper)));
            }

            add.accept("weekly_time_budget_min", req.weeklyTimeBudgetMin());
            add.accept("preferred_session_min", req.preferredSessionMin());

            if (params.isEmpty()) {
                return findOne(userId); // nothing to update
            }

            sql.append(", updated_at = NOW() ");
            sql.append("WHERE user_id = :userId ");
            params.put("userId", userId);

            if (req.ifUnmodifiedSince() != null) {
                sql.append("AND updated_at = :prevUpdatedAt ");
                params.put("prevUpdatedAt", req.ifUnmodifiedSince());
            }

            sql.append("RETURNING *");

            var spec = template.getDatabaseClient().sql(sql.toString());
            for (var e : params.entrySet()) {
                spec = spec.bind(e.getKey(), e.getValue());
            }

            return spec.map((row, meta) -> template.getConverter().read(UserProfile.class, row, meta))
                    .one();
        });
    }
}
