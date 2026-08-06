package com.delvex.server.common.error;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import com.delvex.server.auth.EmailAlreadyExistsException;
import com.delvex.server.auth.InvalidCredentialsException;
import com.delvex.server.auth.InvalidRefreshTokenException;
import com.delvex.server.shipment.InvalidShipmentScheduleException;
import com.delvex.server.shipment.InvalidShipmentStateException;
import com.delvex.server.shipment.ShipmentNotFoundException;
import com.delvex.server.user.UserNotFoundException;

import jakarta.servlet.http.HttpServletRequest;
import tools.jackson.databind.exc.InvalidFormatException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            GlobalExceptionHandler.class);

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyRegistered(
            EmailAlreadyExistsException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.CONFLICT;

        logHandledException(status, exception, request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of());

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(
            InvalidCredentialsException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;

        logHandledException(status, exception, request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of());

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ApiError> handleInvalidRefreshToken(
            InvalidRefreshTokenException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;

        logHandledException(status, exception, request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of());

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(
            UserNotFoundException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND;

        logHandledException(status, exception, request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of());

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(ShipmentNotFoundException.class)
    public ResponseEntity<ApiError> handleShipmentNotFound(
            ShipmentNotFoundException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND;

        logHandledException(status, exception, request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of());

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(InvalidShipmentScheduleException.class)
    public ResponseEntity<ApiError> handleInvalidShipmentSchedule(
            InvalidShipmentScheduleException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        logHandledException(status, exception, request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of());

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(InvalidShipmentStateException.class)
    public ResponseEntity<ApiError> handleInvalidShipmentState(
            InvalidShipmentStateException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.CONFLICT;

        logHandledException(status, exception, request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of());

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableMessage(
            HttpMessageNotReadableException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        InvalidFormatException invalidFormatException =
                findInvalidFormatException(exception);

        logHandledException(status, exception, request);

        String message = "Malformed JSON request";
        Map<String, String> fieldErrors = Map.of();

        if (invalidFormatException != null
                && invalidFormatException.getTargetType().isEnum()) {
            String allowedValues = Arrays.stream(
                            invalidFormatException
                                    .getTargetType()
                                    .getEnumConstants())
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));

            message = "Validation failed";
            fieldErrors = Map.of(
                    "value",
                    "Must be one of: " + allowedValues);
        }

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                fieldErrors);

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiError> handleMethodValidation(
            HandlerMethodValidationException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        logHandledException(status, exception, request);

        exception.getParameterValidationResults()
                .forEach(result -> {
                    String parameterName = result
                            .getMethodParameter()
                            .getParameterName();

                    if (parameterName == null) {
                        parameterName = "argument"
                                + result.getMethodParameter()
                                        .getParameterIndex();
                    }

                    fieldErrors.putIfAbsent(
                            parameterName,
                            result.getResolvableErrors()
                                    .getFirst()
                                    .getDefaultMessage());
                });

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                "Validation failed",
                request.getRequestURI(),
                fieldErrors);

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        logHandledException(status, exception, request);
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(fieldError -> fieldErrors.putIfAbsent(
                        fieldError.getField(),
                        fieldError.getDefaultMessage()));

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                "Validation failed",
                request.getRequestURI(),
                fieldErrors);

        return ResponseEntity.status(status).body(error);
    }

    private InvalidFormatException findInvalidFormatException(
            Throwable throwable) {
        Throwable current = throwable;

        while (current != null) {
            if (current instanceof InvalidFormatException invalidFormat) {
                return invalidFormat;
            }
            current = current.getCause();
        }

        return null;
    }

    private void logHandledException(
            HttpStatus status,
            Exception exception,
            HttpServletRequest request) {
        LOGGER.warn(
                "request rejected status={} path={} exception={}",
                status.value(),
                request.getRequestURI(),
                exception.getClass().getSimpleName());
    }
}
