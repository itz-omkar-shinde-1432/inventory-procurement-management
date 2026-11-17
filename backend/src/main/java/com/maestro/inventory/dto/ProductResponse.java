package com.maestro.inventory.dto;

import java.math.BigDecimal;

public record ProductResponse(Long id, String sku, String name, String category, long quantity,
                              Integer minStock, BigDecimal unitPrice, Long supplierId, String supplierName) {}
