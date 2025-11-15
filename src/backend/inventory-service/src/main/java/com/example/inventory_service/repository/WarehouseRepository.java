package com.example.inventory_service.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.inventory_service.models.Warehouse;

public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, UUID id);

    Optional<Warehouse> findByIdAndActiveTrue(UUID id);

    Page<Warehouse> findAllByActiveTrue(Pageable pageable);
}
