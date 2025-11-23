package com.example.api_geteway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.example.api_geteway.config.ProxyProperties;

@SpringBootApplication
@EnableConfigurationProperties(ProxyProperties.class)
public class ApiGetewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGetewayApplication.class, args);
	}

}
