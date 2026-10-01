package com.enfec.one.asset.dto.response;

import com.enfec.one.asset.user.UserAccount;

public record UserResponse(String username, String role, String displayName, String email, String department, boolean active) {
    public static UserResponse from(UserAccount u) {
        return new UserResponse(u.getUsername(), u.getRole(), u.getDisplayName(), u.getEmail(), u.getDepartment(), u.isActive());
    }
}
