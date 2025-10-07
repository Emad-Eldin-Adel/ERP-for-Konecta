# Konecta ERP System – Full Stack Development

This repository contains the **Full Stack Development track** implementation for the **Konecta ERP System**, part of the Konecta Internship Program – Cycle 3 Graduation Project.

The Full Stack team is responsible for designing and building the **core architecture, backend microservices, and frontend interface** of the ERP system that integrates all major business modules including **HR, Finance, and Inventory**.

---

## 🧭 Project Overview

**Konecta ERP** is an enterprise-grade system that unifies Konecta’s core functions — Finance, HR, Operations, Sales, IT, and Analytics — into one cloud-based platform.  
Our full-stack solution is based on a **microservices architecture** to ensure scalability, modularity, and easy maintenance.

---

## 🏗️ System Architecture

### 🔹 Backend (Microservices)
The backend is distributed across **Java Spring Boot** and **ASP.NET Core** microservices, each responsible for a specific domain.

| Service | Technology | Key Responsibilities |
|----------|-------------|----------------------|
| **Auth Service** | Spring Boot | JWT authentication, user and role management, RBAC. |
| **Finance Service** | ASP.NET Core | Payroll, invoicing, and budget control. |
| **HR Service** | Spring Boot | Employee management, attendance, and performance tracking. |
| **Inventory Service** | ASP.NET Core | Product, supplier, and stock management. |
| **Reporting Service** | Spring Boot | Dashboard data aggregation and export (PDF, Excel). |
| **Gateway Service** | Spring Boot | Central entry point (API Gateway). |
| **Config Server** | Spring Boot | Centralized configuration management. |

**Architecture Components**
- **API Gateway:** Spring Cloud Gateway / Ocelot  
- **Service Discovery:** Eureka / Consul  
- **Configuration Management:** Spring Cloud Config Server  
- **Resilience Patterns:** Resilience4j (Java) / Polly (.NET)  

---

### 🔹 Frontend (Angular)
A unified **Angular** dashboard serves as the interface for all ERP modules.

**Frontend Stack**
- **Framework:** Angular 18  
- **UI Library:** PrimeNG / Angular Material  
- **Auth:** JWT-based authentication with interceptors  
- **Architecture:** Modular & Lazy Loaded per ERP domain (HR, Finance, Inventory, etc.)  
- **Charts & Reports:** Chart.js / ApexCharts integration  

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Angular 18, TypeScript, PrimeNG |
| **Backend (Java)** | Spring Boot 3, Maven, JPA/Hibernate |
| **Backend (.NET)** | ASP.NET Core 8, Entity Framework Core |
| **Database** | MySQL / MariaDB |
| **Communication** | REST APIs |
| **Security** | JWT Authentication, RBAC, Circuit Breaker, HTTPS |
| **Resilience** | Retry, Fallback, Bulkhead via Resilience4j & Polly |


