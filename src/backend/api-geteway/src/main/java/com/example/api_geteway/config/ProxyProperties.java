package com.example.api_geteway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.proxy")
public class ProxyProperties {

    /**
     * Base URL for the auth service (including path prefix, e.g. /api/auth).
     */
    private String authBaseUrl = "http://auth-service:8081/api/auth";

    /**
     * Base URL for the HR service (including path prefix, e.g. /api/hr).
     */
    private String hrBaseUrl = "http://hr-service:8083/api/hr";

    /**
     * Base URL for the finance service (including path prefix, e.g. /api/finance).
     */
    private String financeBaseUrl = "http://finance-service:5288/api/finance";

    /**
     * Base URL for the inventory service (including path prefix, e.g. /api/inventory).
     */
    private String inventoryBaseUrl = "http://inventory-service:8094/api/inventory";

    /**
     * Base URL for the reporting service (including path prefix).
     */
    private String reportingBaseUrl = "http://report-service:8080/api/reporting";

    public String getAuthBaseUrl() {
        return authBaseUrl;
    }

    public void setAuthBaseUrl(String authBaseUrl) {
        this.authBaseUrl = authBaseUrl;
    }

    public String getHrBaseUrl() {
        return hrBaseUrl;
    }

    public void setHrBaseUrl(String hrBaseUrl) {
        this.hrBaseUrl = hrBaseUrl;
    }

    public String getFinanceBaseUrl() {
        return financeBaseUrl;
    }

    public void setFinanceBaseUrl(String financeBaseUrl) {
        this.financeBaseUrl = financeBaseUrl;
    }

    public String getInventoryBaseUrl() {
        return inventoryBaseUrl;
    }

    public void setInventoryBaseUrl(String inventoryBaseUrl) {
        this.inventoryBaseUrl = inventoryBaseUrl;
    }

    public String getReportingBaseUrl() {
        return reportingBaseUrl;
    }

    public void setReportingBaseUrl(String reportingBaseUrl) {
        this.reportingBaseUrl = reportingBaseUrl;
    }
}
