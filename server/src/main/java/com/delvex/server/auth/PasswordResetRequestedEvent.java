package com.delvex.server.auth;

public record PasswordResetRequestedEvent(
        String email,
        String token) {
}
