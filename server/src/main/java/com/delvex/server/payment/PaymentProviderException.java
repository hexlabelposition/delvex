package com.delvex.server.payment;

public class PaymentProviderException extends RuntimeException {
    public PaymentProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}
