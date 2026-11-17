package com.maestro.inventory.dto;

public record InventoryResponse(Long id, Long productId, String productName, String sku, String warehouse,
                                Integer available, Integer reserved, Integer minStock, String status) {}
