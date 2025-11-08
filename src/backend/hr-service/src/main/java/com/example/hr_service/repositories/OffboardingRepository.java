package com.example.hr_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hr_service.models.Offboarding;
public interface OffboardingRepository extends JpaRepository<Offboarding, Long> {
}