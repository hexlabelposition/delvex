package com.delvex.server.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") @Size(min = 5, max = 254, message = "Email must contain between 5 and 254 characters") String email,

        @NotBlank(message = "Password is required") @Size(min = 8, max = 72, message = "Password must contain between 8 and 72 characters") String password,

        @NotBlank(message = "First name is required") @Size(min = 1, max = 50, message = "First name must contain between 1 and 50 characters") String firstName,

        @NotBlank(message = "Last name is required") @Size(min = 1, max = 50, message = "Last name must contain between 1 and 50 characters") String lastName) {

}
