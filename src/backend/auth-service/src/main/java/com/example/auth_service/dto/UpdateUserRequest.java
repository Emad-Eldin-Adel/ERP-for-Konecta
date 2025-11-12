package com.example.auth_service.dto;

import com.example.auth_service.models.Role;
import com.example.auth_service.models.UserStatus;

import jakarta.validation.constraints.Size;

public class UpdateUserRequest {

    private String fullName;
    private String phone;
    private Role role;
    private UserStatus status;

    @Size(min = 8, max = 120)
    private String password;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
