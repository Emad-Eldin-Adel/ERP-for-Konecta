package com.example.auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.example.auth_service.config.AdminUserProperties;
import com.example.auth_service.config.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties({ JwtProperties.class, AdminUserProperties.class })
public class AuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

}
