package com.example.hr_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hr_service.models.Onboarding;

public interface OnboardingRepository extends JpaRepository<Onboarding, Long> {
}