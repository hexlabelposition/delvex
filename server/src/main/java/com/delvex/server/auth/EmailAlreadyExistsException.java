package com.delvex.server.auth;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException() {
        this(null);
    }

    public EmailAlreadyExistsException(Throwable cause) {
        super("Email is already registered", cause);
    }

}
