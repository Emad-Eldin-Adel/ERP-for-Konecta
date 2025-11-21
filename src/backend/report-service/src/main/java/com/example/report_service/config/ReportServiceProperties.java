package com.example.report_service.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "report")
public class ReportServiceProperties {

    private final AuthProperties auth = new AuthProperties();
    private final ClientGroup clients = new ClientGroup();
    /**
     * Payroll period to request from finance service. "current" uses the latest closed month.
     */
    @NotBlank
    private String payrollPeriod = "current";
    private int hrMaxEmployees = 50;
    private int inventoryMaxItems = 50;

    public AuthProperties getAuth() {
        return auth;
    }

    public ClientGroup getClients() {
        return clients;
    }

    public String getPayrollPeriod() {
        return payrollPeriod;
    }

    public void setPayrollPeriod(String payrollPeriod) {
        this.payrollPeriod = payrollPeriod;
    }

    public int getHrMaxEmployees() {
        return hrMaxEmployees;
    }

    public void setHrMaxEmployees(int hrMaxEmployees) {
        this.hrMaxEmployees = hrMaxEmployees;
    }

    public int getInventoryMaxItems() {
        return inventoryMaxItems;
    }

    public void setInventoryMaxItems(int inventoryMaxItems) {
        this.inventoryMaxItems = inventoryMaxItems;
    }

    public static class AuthProperties {
        @NotEmpty
        private List<String> baseUrls = new ArrayList<>();
        @NotBlank
        private String email;
        @NotBlank
        private String password;

        public List<String> getBaseUrls() {
            return Collections.unmodifiableList(baseUrls);
        }

        public void setBaseUrls(List<String> baseUrls) {
            this.baseUrls = baseUrls == null ? new ArrayList<>() : new ArrayList<>(baseUrls);
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

    public static class ClientGroup {
        private final ClientProperties hr = new ClientProperties();
        private final ClientProperties finance = new ClientProperties();
        private final ClientProperties inventory = new ClientProperties();

        public ClientProperties getHr() {
            return hr;
        }

        public ClientProperties getFinance() {
            return finance;
        }

        public ClientProperties getInventory() {
            return inventory;
        }
    }

    public static class ClientProperties {
        private List<String> baseUrls = new ArrayList<>();

        public List<String> getBaseUrls() {
            return Collections.unmodifiableList(baseUrls);
        }

        public void setBaseUrls(List<String> baseUrls) {
            this.baseUrls = baseUrls == null ? new ArrayList<>() : new ArrayList<>(baseUrls);
        }
    }
}
