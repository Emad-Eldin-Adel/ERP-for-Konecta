package com.example.hr_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.hr_service.models.Training;
import com.example.hr_service.repositories.TrainingRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainingService {
    private final TrainingRepository repo;

    public Training save(Training t) {
        return repo.save(t);
    }

    public Training findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Training not found"));
    }

    public List<Training> findAll() {
        return repo.findAll();
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}