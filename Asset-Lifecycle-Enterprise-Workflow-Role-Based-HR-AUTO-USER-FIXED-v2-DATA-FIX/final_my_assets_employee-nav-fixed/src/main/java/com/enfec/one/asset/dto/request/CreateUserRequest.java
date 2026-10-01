package com.enfec.one.asset.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
    @NotBlank String username,
    @NotBlank String password,
    @NotBlank String role,
    @NotBlank String displayName,
    @Email String email,
    String department
) {}
