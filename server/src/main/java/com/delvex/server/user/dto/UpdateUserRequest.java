package com.delvex.server.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 50, message = "First name must contain at most 50 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "First name must not be blank")
        String firstName,

        @Size(max = 50, message = "Last name must contain at most 50 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Last name must not be blank")
        String lastName) {

    @JsonIgnore
    @AssertTrue(message = "At least one profile field must be provided")
    public boolean isUpdateProvided() {
        return firstName != null || lastName != null;
    }
}
