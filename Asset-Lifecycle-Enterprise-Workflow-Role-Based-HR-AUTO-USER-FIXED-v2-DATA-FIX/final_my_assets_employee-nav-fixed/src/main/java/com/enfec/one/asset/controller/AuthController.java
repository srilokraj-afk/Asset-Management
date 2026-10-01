package com.enfec.one.asset.controller;

import com.enfec.one.asset.auth.SessionAuthService;
import com.enfec.one.asset.dto.request.LoginRequest;
import com.enfec.one.asset.dto.response.LoginResponse;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SessionAuthService auth;

    public AuthController(SessionAuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return auth.login(request);
    }

    @PostMapping("/logout")
    public void logout(
            @RequestHeader("X-Session-Id") String session
    ) {
        auth.logout(session);
    }
}