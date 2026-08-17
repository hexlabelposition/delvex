package com.delvex.server.auth.ratelimit;

import java.time.Duration;

public interface RateLimitStore {

    long increment(String key, Duration timeToLive);
}
