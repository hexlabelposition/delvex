package com.delvex.server.auth.ratelimit;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@ConfigurationProperties(prefix = "rate-limit.auth")
@Validated
public class AuthRateLimitProperties {

    @NotNull
    private Duration window = Duration.ofMinutes(1);

    @Min(1)
    private int registerRequests = 5;

    @Min(1)
    private int loginRequests = 10;

    @Min(1)
    private int refreshRequests = 30;

    @Min(1)
    private int forgotPasswordRequests = 5;

    @Min(1)
    private int resetPasswordRequests = 10;

    @NotNull
    private List<String> trustedProxyCidrs = List.of();

    public Duration getWindow() {
        return window;
    }

    public void setWindow(Duration window) {
        this.window = window;
    }

    public int getRegisterRequests() {
        return registerRequests;
    }

    public void setRegisterRequests(int registerRequests) {
        this.registerRequests = registerRequests;
    }

    public int getLoginRequests() {
        return loginRequests;
    }

    public void setLoginRequests(int loginRequests) {
        this.loginRequests = loginRequests;
    }

    public int getRefreshRequests() {
        return refreshRequests;
    }

    public void setRefreshRequests(int refreshRequests) {
        this.refreshRequests = refreshRequests;
    }

    public int getForgotPasswordRequests() {
        return forgotPasswordRequests;
    }

    public void setForgotPasswordRequests(int forgotPasswordRequests) {
        this.forgotPasswordRequests = forgotPasswordRequests;
    }

    public int getResetPasswordRequests() {
        return resetPasswordRequests;
    }

    public void setResetPasswordRequests(int resetPasswordRequests) {
        this.resetPasswordRequests = resetPasswordRequests;
    }

    public List<String> getTrustedProxyCidrs() {
        return trustedProxyCidrs;
    }

    public void setTrustedProxyCidrs(List<String> trustedProxyCidrs) {
        this.trustedProxyCidrs = trustedProxyCidrs;
    }

    @AssertTrue(message = "Rate limit window must be positive")
    public boolean isWindowPositive() {
        return window != null
                && !window.isZero()
                && !window.isNegative();
    }
}
