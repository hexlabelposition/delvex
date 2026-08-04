package com.delvex.server.auth.dto;

import java.util.UUID;

public record RegisterResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String accessToken,
        String refreshToken) {

}
