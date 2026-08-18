package com.delvex.server.auth.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.delvex.server.user.UserRole;

public record RegisterResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        UserRole role,
        String accessToken,
        @JsonIgnore String refreshToken) {

}
