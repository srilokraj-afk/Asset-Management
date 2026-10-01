package com.enfec.one.asset.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DefaultUserInitializer implements CommandLineRunner {
    private final SessionAuthService auth;
    public DefaultUserInitializer(SessionAuthService auth){this.auth=auth;}
    @Override public void run(String... args){auth.initializeDefaultUsers();}
}
