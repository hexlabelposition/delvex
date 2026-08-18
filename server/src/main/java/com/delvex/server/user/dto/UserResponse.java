package com.delvex.server.user.dto;

import java.time.Instant;
import java.util.UUID;

import com.delvex.server.user.User;
import com.delvex.server.user.UserRole;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        UserRole role,
        Instant createdAt,
        Instant updatedAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
