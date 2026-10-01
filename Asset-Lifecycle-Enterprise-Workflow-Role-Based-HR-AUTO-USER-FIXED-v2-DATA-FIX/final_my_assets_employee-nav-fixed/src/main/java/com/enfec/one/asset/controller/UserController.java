package com.enfec.one.asset.controller;

import com.enfec.one.asset.auth.SessionAuthService;
import com.enfec.one.asset.audit.AuditLog;
import com.enfec.one.asset.audit.AuditLogRepository;
import com.enfec.one.asset.dto.request.CreateUserRequest;
import com.enfec.one.asset.dto.response.UserResponse;
import com.enfec.one.asset.user.UserAccountRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final SessionAuthService auth;
    private final UserAccountRepository repository;
    private final AuditLogRepository auditLogRepository;

    public UserController(SessionAuthService auth, UserAccountRepository repository, AuditLogRepository auditLogRepository) { this.auth=auth; this.repository=repository; this.auditLogRepository=auditLogRepository; }

    @GetMapping
    public List<UserResponse> all(@RequestHeader("X-Session-Id") String session) {
        auth.requireRole(session, "ADMIN");
        return repository.findAllByOrderByDisplayNameAsc().stream().map(UserResponse::from).toList();
    }

    @GetMapping("/employees")
    public List<UserResponse> employees(@RequestHeader("X-Session-Id") String session) {
        auth.requireRole(session, "ADMIN");
        return repository.findAllByRoleAndActiveTrueOrderByDisplayNameAsc("EMPLOYEE").stream().map(UserResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@RequestHeader("X-Session-Id") String session, @Valid @RequestBody CreateUserRequest request) {
        auth.requireRole(session, "ADMIN");
        SessionAuthService.User created = auth.createUserAccount(request.username(), request.password(), request.role(), request.displayName(), request.email(), request.department());
        var admin = auth.require(session);
        auditLogRepository.save(new AuditLog(admin.username(), "USER_CREATED", "USER", created.username(), created.role()+" / "+created.displayName()));
        return new UserResponse(created.username(), created.role(), created.displayName(), created.email(), created.department(), true);
    }
}
