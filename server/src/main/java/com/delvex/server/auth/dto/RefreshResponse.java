package com.delvex.server.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record RefreshResponse(
        String accessToken,
        @JsonIgnore String refreshToken) {

}
