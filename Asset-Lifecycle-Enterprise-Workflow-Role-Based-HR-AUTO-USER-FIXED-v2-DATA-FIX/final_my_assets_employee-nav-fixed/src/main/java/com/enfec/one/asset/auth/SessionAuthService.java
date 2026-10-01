package com.enfec.one.asset.auth;

import com.enfec.one.asset.dto.request.LoginRequest;
import com.enfec.one.asset.dto.response.LoginResponse;
import com.enfec.one.asset.user.UserAccount;
import com.enfec.one.asset.user.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionAuthService {
    public record User(String username, String role, String displayName, String email, String department) {}

    private final UserAccountRepository userRepository;
    private final Map<String, User> sessions = new ConcurrentHashMap<>();

    public SessionAuthService(UserAccountRepository userRepository){ this.userRepository=userRepository; }

    @Transactional
    public void initializeDefaultUsers() {
        if (!userRepository.existsByUsernameIgnoreCase("admin")) {
            saveUser("admin","admin123","ADMIN","System Administrator","admin@enfec.com","IT");
        }
        if (!userRepository.existsByUsernameIgnoreCase("ravi")) {
            saveUser("ravi","ravi123","EMPLOYEE","Ravi","ravi@enfec.com","Engineering");
        }
        if (!userRepository.existsByUsernameIgnoreCase("hr")) saveUser("hr","hr123","HR","HR Admin","hr@enfec.com","HR");
        if (!userRepository.existsByUsernameIgnoreCase("manager")) saveUser("manager","manager123","MANAGER","Engineering Manager","manager@enfec.com","Engineering");
        if (!userRepository.existsByUsernameIgnoreCase("finance")) saveUser("finance","finance123","FINANCE","Finance Officer","finance@enfec.com","Finance");
        if (!userRepository.existsByUsernameIgnoreCase("vp")) saveUser("vp","vp123","VP","VP Executive","vp@enfec.com","Leadership");
        if (!userRepository.existsByUsernameIgnoreCase("procurement")) saveUser("procurement","proc123","PROCUREMENT","Procurement Officer","procurement@enfec.com","Procurement");
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String username=normalizeUsername(request.username());
        String password=request.password()==null?"":request.password();
        UserAccount account=userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if(!account.isActive() || !matches(password, account.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        User user=toUser(account);
        String sessionId=UUID.randomUUID().toString();
        sessions.put(sessionId,user);
        return new LoginResponse("Login successful",user.username(),user.role(),user.displayName(),user.email(),user.department(),sessionId);
    }

    @Transactional
    public User createUserAccount(String username,String password,String role,String displayName,String email,String department) {
        username=normalizeUsername(username);
        if(username.isBlank()) throw new IllegalArgumentException("Username is required");
        if(password==null||password.isBlank()) throw new IllegalArgumentException("Password is required");
        role=role==null?"":role.trim().toUpperCase();
        if(!Set.of("ADMIN","EMPLOYEE","HR","MANAGER","FINANCE","VP","PROCUREMENT").contains(role)) throw new IllegalArgumentException("Invalid role. Allowed roles: ADMIN, EMPLOYEE, HR, MANAGER, FINANCE, VP, PROCUREMENT");
        if(userRepository.existsByUsernameIgnoreCase(username)) throw new IllegalArgumentException("Username already exists: "+username);
        if(displayName==null||displayName.isBlank()) throw new IllegalArgumentException("Display name is required");
        UserAccount saved=saveUser(username,password,role,displayName.trim(),clean(email),clean(department));
        return toUser(saved);
    }

    /** Backward-compatible alias for services that may already call createUser. */
    @Transactional
    public User createUser(String username,String password,String role,String displayName,String email,String department) {
        return createUserAccount(username,password,role,displayName,email,department);
    }


    public List<User> allUsers() {
        return userRepository.findAllByOrderByDisplayNameAsc().stream().map(this::toUser).toList();
    }

    public User getUser(String username) {
        if(username==null||username.isBlank()) return null;
        return userRepository.findByUsernameIgnoreCase(normalizeUsername(username)).map(this::toUser).orElse(null);
    }

    public boolean userExists(String username) {
        return username!=null&&!username.isBlank()&&userRepository.existsByUsernameIgnoreCase(normalizeUsername(username));
    }

    public User require(String sessionId) {
        if(sessionId==null||sessionId.isBlank()) throw new IllegalArgumentException("Session expired or invalid. Please sign in again.");
        User user=sessions.get(sessionId);
        if(user==null) throw new IllegalArgumentException("Session expired or invalid. Please sign in again.");
        return user;
    }

    public User requireRole(String sessionId,String role) {
        User user=require(sessionId);
        if(role==null||!role.equalsIgnoreCase(user.role())) throw new IllegalArgumentException("Access denied for role "+user.role());
        return user;
    }

    public void logout(String sessionId){if(sessionId!=null&&!sessionId.isBlank()) sessions.remove(sessionId);}

    private UserAccount saveUser(String username,String password,String role,String displayName,String email,String department){
        return userRepository.save(new UserAccount(username,hash(password),role,displayName,email,department));
    }
    private User toUser(UserAccount a){return new User(a.getUsername(),a.getRole(),a.getDisplayName(),a.getEmail(),a.getDepartment());}
    private String normalizeUsername(String username){return username==null?"":username.trim().toLowerCase();}
    private String clean(String value){return value==null?"":value.trim();}
    private String hash(String value){
        try {
            MessageDigest digest=MessageDigest.getInstance("SHA-256");
            byte[] bytes=digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder out=new StringBuilder();
            for(byte b:bytes) out.append(String.format("%02x",b));
            return out.toString();
        } catch(NoSuchAlgorithmException e){throw new IllegalStateException("SHA-256 is unavailable",e);}
    }
    private boolean matches(String raw,String storedHash){
        return MessageDigest.isEqual(hash(raw).getBytes(StandardCharsets.UTF_8),storedHash.getBytes(StandardCharsets.UTF_8));
    }
}
