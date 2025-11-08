package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Onboarding;
import com.example.hr_service.repositories.OnboardingRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {
    private final OnboardingRepository repo;

    public Onboarding save(Onboarding o) {
        return repo.save(o);
    }

    public Onboarding findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Onboarding not found"));
    }

    public List<Onboarding> findAll() {
        return repo.findAll();
    }
}