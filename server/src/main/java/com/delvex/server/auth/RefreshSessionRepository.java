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

public interface RefreshSessionRepository
        extends JpaRepository<RefreshSession, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshSession> findByRefreshTokenHash(
            String refreshTokenHash);

    @Modifying(
            flushAutomatically = true,
            clearAutomatically = true)
    @Query("""
            delete from RefreshSession session
            where session.expiresAt <= :now
               or session.revokedAt is not null
            """)
    int deleteInactiveSessions(@Param("now") Instant now);

    @Modifying(flushAutomatically = true)
    @Query("""
            update RefreshSession session
            set session.revokedAt = :now
            where session.userId = :userId
              and session.revokedAt is null
              and session.expiresAt > :now
            """)
    int revokeActiveByUserId(
            @Param("userId") UUID userId,
            @Param("now") Instant now);
}
