package com.example.auth_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;

import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.auth_service.models.Role;
import com.example.auth_service.models.User;
import com.example.auth_service.models.UserStatus;
import com.example.auth_service.repositories.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminUserProperties properties;

    public AdminUserInitializer(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminUserProperties properties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Optional<User> existing = userRepository.findByEmail(properties.getEmail());
        if (existing.isPresent()) {
            User user = existing.get();
            boolean updated = syncExistingUser(user);
            if (updated) {
                userRepository.save(user);
                log.info("Synchronized seeded admin user {}", properties.getEmail());
            } else {
                log.info("Admin user {} already up-to-date.", properties.getEmail());
            }
            return;
        }

        User admin = new User();
        admin.setFullName(properties.getFullName());
        admin.setPhone(properties.getPhone());
        admin.setEmail(properties.getEmail());
        admin.setUsername(properties.getEmail());
        admin.setPassword(passwordEncoder.encode(properties.getPassword()));
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);

        userRepository.save(admin);
        log.info("Seeded default admin account with email {}", properties.getEmail());
    }

    private boolean syncExistingUser(User user) {
        boolean updated = false;
        if (!passwordEncoder.matches(properties.getPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(properties.getPassword()));
            updated = true;
        }
        if (user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
            updated = true;
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            user.setStatus(UserStatus.ACTIVE);
            updated = true;
        }
        if (!properties.getEmail().equals(user.getUsername())) {
            user.setUsername(properties.getEmail());
            updated = true;
        }
        if (!properties.getFullName().equals(user.getFullName())) {
            user.setFullName(properties.getFullName());
            updated = true;
        }
        if (!properties.getPhone().equals(user.getPhone())) {
            user.setPhone(properties.getPhone());
            updated = true;
        }
        return updated;
    }
}
