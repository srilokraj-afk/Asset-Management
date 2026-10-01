package com.enfec.one.asset.exception;

import jakarta.servlet.http.HttpServletRequest;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(AssetNotFoundException.class)
    ProblemDetail notFound(
            AssetNotFoundException ex,
            HttpServletRequest r
    ) {
        return problem(
                HttpStatus.NOT_FOUND,
                "ASSET_NOT_FOUND",
                ex.getMessage(),
                r
        );
    }

    @ExceptionHandler({
            InvalidAssetStatusException.class,
            DuplicateAssetException.class
    })
    ProblemDetail badRequest(
            RuntimeException ex,
            HttpServletRequest r
    ) {
        String code;

        if (ex instanceof InvalidAssetStatusException) {
            code = "INVALID_ASSET_STATUS";
        } else {
            code = "DUPLICATE_ASSET";
        }

        return problem(
                HttpStatus.BAD_REQUEST,
                code,
                ex.getMessage(),
                r
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail illegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest r
    ) {
        return problem(
                HttpStatus.BAD_REQUEST,
                "INVALID_ASSET_REQUEST",
                ex.getMessage(),
                r
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validation(
            MethodArgumentNotValidException ex,
            HttpServletRequest r
    ) {
        String m = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Request validation failed");

        return problem(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                m,
                r
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ProblemDetail unreadable(
            HttpMessageNotReadableException ex,
            HttpServletRequest r
    ) {
        return problem(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST_BODY",
                "Request body is invalid or malformed.",
                r
        );
    }

    private ProblemDetail problem(
            HttpStatus s,
            String code,
            String detail,
            HttpServletRequest r
    ) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(s, detail);

        p.setTitle(s.getReasonPhrase());
        p.setProperty(
                "code",
                code
        );
        p.setProperty(
                "timestamp",
                OffsetDateTime.now(ZoneOffset.UTC)
        );
        p.setProperty(
                "path",
                r.getRequestURI()
        );

        return p;
    }
}