package com.example.inventory_service.config;

import com.example.inventory_service.models.InventoryLevel;
import com.example.inventory_service.models.Item;
import com.example.inventory_service.models.Warehouse;
import com.example.inventory_service.repository.InventoryLevelRepository;
import com.example.inventory_service.repository.ItemRepository;
import com.example.inventory_service.repository.WarehouseRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeederConfig {

    @Bean
    CommandLineRunner seedSampleData(ItemRepository itemRepository,
                                     WarehouseRepository warehouseRepository,
                                     InventoryLevelRepository inventoryLevelRepository) {
        return args -> {
            if (itemRepository.count() > 0 || warehouseRepository.count() > 0) {
                return;
            }
            Item laptop = new Item();
            laptop.setSku("ITM-0001");
            laptop.setName("Laptop 14 inch");
            laptop.setDescription("Portable computer");
            laptop.setUnitOfMeasure("PCS");
            laptop.setReorderPoint(new BigDecimal("10"));
            laptop.setReorderQuantity(new BigDecimal("20"));

            Item mouse = new Item();
            mouse.setSku("ITM-0002");
            mouse.setName("Wireless Mouse");
            mouse.setDescription("2.4 GHz receiver");
            mouse.setUnitOfMeasure("PCS");
            mouse.setReorderPoint(new BigDecimal("30"));
            mouse.setReorderQuantity(new BigDecimal("50"));

            Warehouse mainWarehouse = new Warehouse();
            mainWarehouse.setCode("WH-NORTH");
            mainWarehouse.setName("Main Warehouse");
            mainWarehouse.setCity("Bogota");
            mainWarehouse.setCountry("Colombia");

            Warehouse remoteWarehouse = new Warehouse();
            remoteWarehouse.setCode("WH-SOUTH");
            remoteWarehouse.setName("Remote Warehouse");
            remoteWarehouse.setCity("Medellin");
            remoteWarehouse.setCountry("Colombia");

            itemRepository.saveAll(List.of(laptop, mouse));
            warehouseRepository.saveAll(List.of(mainWarehouse, remoteWarehouse));

            InventoryLevel laptopNorth = new InventoryLevel(laptop, mainWarehouse);
            laptopNorth.setQuantityOnHand(new BigDecimal("120"));

            InventoryLevel mouseNorth = new InventoryLevel(mouse, mainWarehouse);
            mouseNorth.setQuantityOnHand(new BigDecimal("200"));

            InventoryLevel mouseSouth = new InventoryLevel(mouse, remoteWarehouse);
            mouseSouth.setQuantityOnHand(new BigDecimal("80"));

            inventoryLevelRepository.saveAll(List.of(laptopNorth, mouseNorth, mouseSouth));
        };
    }
}