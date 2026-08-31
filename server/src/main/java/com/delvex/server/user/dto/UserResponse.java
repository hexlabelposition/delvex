package com.delvex.server.user.dto;

import java.time.Instant;
import java.util.UUID;

import com.delvex.server.user.User;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Instant createdAt,
        Instant updatedAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
