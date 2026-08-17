package com.delvex.server.auth.ratelimit;

public class RateLimitStoreUnavailableException extends RuntimeException {

    public RateLimitStoreUnavailableException(Throwable cause) {
        super("Rate limit store is unavailable", cause);
    }
}
