package com.example.inventory_service.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.inventory_service.models.Item;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, UUID id);

    Optional<Item> findByIdAndActiveTrue(UUID id);

    Page<Item> findAllByActiveTrue(Pageable pageable);
}
