package com.enfec.one.asset.user;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "app_users", uniqueConstraints = @UniqueConstraint(name = "uk_app_users_username", columnNames = "username"))
public class UserAccount {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 100) private String username;
    @Column(name = "password_hash", nullable = false, length = 128) private String passwordHash;
    @Column(nullable = false, length = 20) private String role;
    @Column(name = "display_name", nullable = false, length = 150) private String displayName;
    @Column(length = 200) private String email;
    @Column(length = 100) private String department;
    @Column(nullable = false) private boolean active;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;

    protected UserAccount() {}
    public UserAccount(String username, String passwordHash, String role, String displayName, String email, String department) {
        this.username=username; this.passwordHash=passwordHash; this.role=role; this.displayName=displayName;
        this.email=email; this.department=department; this.active=true; this.createdAt=OffsetDateTime.now(ZoneOffset.UTC);
    }
    public UUID getId(){return id;} public String getUsername(){return username;} public String getPasswordHash(){return passwordHash;}
    public String getRole(){return role;} public String getDisplayName(){return displayName;} public String getEmail(){return email;}
    public String getDepartment(){return department;} public boolean isActive(){return active;}
}
