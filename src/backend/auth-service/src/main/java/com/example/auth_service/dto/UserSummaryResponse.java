package com.example.auth_service.dto;

public class UserSummaryResponse {
    private long total;
    private long active;
    private long inactive;
    private long admins;
    private long hr;
    private long finance;
    private long inventory;
    private long employees;

    public UserSummaryResponse(long total, long active, long inactive,
            long admins, long hr, long finance,
            long inventory, long employees) {
        this.total = total;
        this.active = active;
        this.inactive = inactive;
        this.admins = admins;
        this.hr = hr;
        this.finance = finance;
        this.inventory = inventory;
        this.employees = employees;
    }

    public long getTotal() {
        return total;
    }

    public long getActive() {
        return active;
    }

    public long getInactive() {
        return inactive;
    }

    public long getAdmins() {
        return admins;
    }

    public long getHr() {
        return hr;
    }

    public long getFinance() {
        return finance;
    }

    public long getInventory() {
        return inventory;
    }

    public long getEmployees() {
        return employees;
    }
}
