package com.enfec.one.asset.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);
    List<UserAccount> findAllByOrderByDisplayNameAsc();
    List<UserAccount> findAllByRoleAndActiveTrueOrderByDisplayNameAsc(String role);
}
