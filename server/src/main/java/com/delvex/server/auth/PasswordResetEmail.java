package com.delvex.server.auth;

public record PasswordResetEmail(
        String from,
        String to,
        String subject,
        String text) {
}
