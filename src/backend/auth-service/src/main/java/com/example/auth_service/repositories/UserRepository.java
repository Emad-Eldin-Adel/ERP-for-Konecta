package com.example.auth_service.repositories;

import com.example.auth_service.models.Role;
import com.example.auth_service.models.User;
import com.example.auth_service.models.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);

    long countByRole(Role role);
}
