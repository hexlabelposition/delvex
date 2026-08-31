package com.delvex.server.auth;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Modifying(flushAutomatically = true)
    @Query("""
            update PasswordResetToken token
            set token.usedAt = :usedAt
            where token.userId = :userId
              and token.usedAt is null
            """)
    int invalidateUnusedByUserId(
            @Param("userId") UUID userId,
            @Param("usedAt") Instant usedAt);

    @Modifying(flushAutomatically = true)
    @Query("""
            delete from PasswordResetToken token
            where token.expiresAt <= :now
               or token.usedAt is not null
            """)
    int deleteInactiveTokens(@Param("now") Instant now);
}
