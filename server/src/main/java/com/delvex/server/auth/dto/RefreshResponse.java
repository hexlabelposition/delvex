package com.delvex.server.auth.dto;

public record RefreshResponse(
        String accessToken,
        String refreshToken) {

}
