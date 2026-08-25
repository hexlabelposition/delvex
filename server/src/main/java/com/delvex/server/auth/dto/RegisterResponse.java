package com.delvex.server.auth.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record RegisterResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String accessToken,
        @JsonIgnore String refreshToken) {

}
