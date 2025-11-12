package com.example.auth_service.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.dto.InviteUserRequest;
import com.example.auth_service.dto.InviteUserResponse;
import com.example.auth_service.dto.UpdateUserRequest;
import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.dto.UserSummaryResponse;
import com.example.auth_service.services.UserAdminService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/auth/admin/users")
public class AdminUserController {

    private final UserAdminService userAdminService;

    public AdminUserController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers() {
        return ResponseEntity.ok(userAdminService.listUsers());
    }

    @GetMapping("/summary")
    public ResponseEntity<UserSummaryResponse> summary() {
        return ResponseEntity.ok(userAdminService.summary());
    }

    @PostMapping
    public ResponseEntity<InviteUserResponse> invite(@Valid @RequestBody InviteUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAdminService.inviteUser(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userAdminService.updateUser(id, request));
    }
}
