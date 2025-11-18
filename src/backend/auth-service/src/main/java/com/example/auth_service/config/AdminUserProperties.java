package com.example.auth_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.admin")
public class AdminUserProperties {

    /**
     * Default admin display name. Change through env var APP_ADMIN_FULL-NAME.
     */
    private String fullName = "System Administrator";

    /**
     * Contact phone for the seeded admin account.
     */
    private String phone = "+10000000000";

    /**
     * Login email for the seeded admin.
     */
    private String email = "admin@konecta.com";

    private String password = "Admin@211";

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
