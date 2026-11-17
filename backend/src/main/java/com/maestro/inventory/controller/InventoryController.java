package com.maestro.inventory.controller;

import com.maestro.inventory.dto.AdjustStockRequest;
import com.maestro.inventory.dto.InventoryResponse;
import com.maestro.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryResponse> findAll() {
        return inventoryService.findAll();
    }

    @PostMapping("/{id}/adjust")
    public InventoryResponse adjust(@PathVariable Long id, @Valid @RequestBody AdjustStockRequest request) {
        return inventoryService.adjust(id, request);
    }
}
