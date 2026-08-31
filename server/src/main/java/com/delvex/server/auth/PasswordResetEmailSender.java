package com.delvex.server.auth;

public interface PasswordResetEmailSender {

    void send(PasswordResetEmail email);
}
