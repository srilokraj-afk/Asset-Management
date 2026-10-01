package com.enfec.one.asset.dto.response;

public record LoginResponse(String message, String username, String role, String displayName, String email, String department, String sessionId) {}
