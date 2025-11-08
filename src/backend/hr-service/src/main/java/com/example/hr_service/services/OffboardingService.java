package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Offboarding;
import com.example.hr_service.repositories.OffboardingRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OffboardingService {
    private final OffboardingRepository repo;

    public Offboarding save(Offboarding o) {
        return repo.save(o);
    }

    public Offboarding findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Offboarding not found"));
    }

    public List<Offboarding> findAll() {
        return repo.findAll();
    }
}