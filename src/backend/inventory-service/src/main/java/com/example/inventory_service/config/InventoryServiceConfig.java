package com.example.inventory_service.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InventoryServiceConfig {

    @Bean
    public Clock utcClock() {
        return Clock.systemUTC();
    }
}