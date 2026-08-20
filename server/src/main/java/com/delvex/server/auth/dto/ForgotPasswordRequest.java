package com.delvex.server.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(
                min = 5,
                max = 254,
                message = "Email must contain between 5 and 254 characters")
        String email) {
}
