package com.delvex.server.auth.dto;

import java.util.UUID;

public record LoginResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String accessToken,
        String refreshToken) {

}
