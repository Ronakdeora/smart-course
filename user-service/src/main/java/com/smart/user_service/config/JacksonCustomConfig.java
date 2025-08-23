package com.smart.user_service.config;


import io.r2dbc.postgresql.codec.Json;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonCustomConfig {

    public static class PgJsonSerializer extends com.fasterxml.jackson.databind.JsonSerializer<Json> {
        @Override public void serialize(Json v, com.fasterxml.jackson.core.JsonGenerator g,
                                        com.fasterxml.jackson.databind.SerializerProvider s) throws java.io.IOException {
            if (v == null) { g.writeNull(); return; }
            g.writeRawValue(v.asString()); // write the raw JSON stored in JSONB
        }
    }

    @Bean
    com.fasterxml.jackson.databind.Module r2dbcPgJsonModule() {
        var m = new com.fasterxml.jackson.databind.module.SimpleModule();
        m.addSerializer(Json.class, new PgJsonSerializer());
        return m;
    }
}
