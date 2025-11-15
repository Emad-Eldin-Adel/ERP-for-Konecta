package com.example.auth_service.services;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.auth_service.dto.InviteUserRequest;
import com.example.auth_service.dto.InviteUserResponse;
import com.example.auth_service.dto.UpdateUserRequest;
import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.dto.UserSummaryResponse;
import com.example.auth_service.models.Role;
import com.example.auth_service.models.User;
import com.example.auth_service.models.UserStatus;
import com.example.auth_service.repositories.UserRepository;

@Service
public class UserAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public UserAdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) {
                        return a.getId().compareTo(b.getId());
                    }
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();
    }

    @Transactional
    public InviteUserResponse inviteUser(InviteUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        String plainPassword = request.getPassword();
        if (plainPassword == null || plainPassword.isBlank()) {
            plainPassword = generateTemporaryPassword();
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail().toLowerCase(Locale.ROOT));
        user.setUsername(request.getEmail().toLowerCase(Locale.ROOT));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setPassword(passwordEncoder.encode(plainPassword));

        User saved = userRepository.save(user);
        return new InviteUserResponse(mapToResponse(saved), plainPassword);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return mapToResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse summary() {
        long total = userRepository.count();
        long active = userRepository.countByStatus(UserStatus.ACTIVE);
        long inactive = userRepository.countByStatus(UserStatus.INACTIVE);
        long admins = userRepository.countByRole(Role.ADMIN);
        long hr = userRepository.countByRole(Role.HR);
        long finance = userRepository.countByRole(Role.FINANCE);
        long inventory = userRepository.countByRole(Role.INVENTORY);
        long employees = userRepository.countByRole(Role.EMPLOYEE);

        return new UserSummaryResponse(total, active, inactive, admins, hr, finance, inventory, employees);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt());
    }

    private String generateTemporaryPassword() {
        byte[] bytes = new byte[6];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
