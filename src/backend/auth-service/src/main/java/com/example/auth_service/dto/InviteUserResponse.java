package com.example.auth_service.dto;

public class InviteUserResponse {
    private UserResponse user;
    private String temporaryPassword;

    public InviteUserResponse() {
    }

    public InviteUserResponse(UserResponse user, String temporaryPassword) {
        this.user = user;
        this.temporaryPassword = temporaryPassword;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }
}
