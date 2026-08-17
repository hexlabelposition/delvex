package com.delvex.server.auth.ratelimit;

import java.time.Duration;
import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

@Component
public class RedisRateLimitStore implements RateLimitStore {

    private static final RedisScript<Long> INCREMENT_WITH_EXPIRY =
            RedisScript.of("""
                    local requests = redis.call('INCR', KEYS[1])
                    if requests == 1 then
                        redis.call('PEXPIRE', KEYS[1], ARGV[1])
                    end
                    return requests
                    """, Long.class);

    private final StringRedisTemplate redisTemplate;

    public RedisRateLimitStore(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public long increment(String key, Duration timeToLive) {
        try {
            Long requests = redisTemplate.execute(
                    INCREMENT_WITH_EXPIRY,
                    List.of(key),
                    Long.toString(timeToLive.toMillis()));

            if (requests == null) {
                throw new RateLimitStoreUnavailableException(
                        new IllegalStateException(
                                "Redis returned no rate limit value"));
            }

            return requests;
        } catch (DataAccessException exception) {
            throw new RateLimitStoreUnavailableException(exception);
        }
    }
}
