package com.maestro.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseOrderResponse(Long id, String orderNumber, Long supplierId, String supplierName,
                                    String status, LocalDate expectedDate, LocalDateTime createdAt,
                                    LocalDateTime receivedAt, String warehouse, String notes,
                                    List<Item> items, BigDecimal total) {
    public record Item(Long id, Long productId, String sku, String productName, Integer quantity,
                       BigDecimal unitPrice, BigDecimal lineTotal) {}
}
