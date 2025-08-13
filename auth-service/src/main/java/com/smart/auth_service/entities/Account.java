package com.smart.auth_service.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id @Column("id") private UUID id;
    @Column("email") private String email;
    @Column("full_name") private String fullName;

    @JsonIgnore
    @Column("password_hash") private String passwordHash;

    @Column("is_active") private boolean isActive = true;
    @Column("email_verified_at") private Instant emailVerifiedAt;
    @CreatedDate @Column("created_at") private Instant createdAt;
    @LastModifiedDate @Column("updated_at") private Instant updatedAt;
}


