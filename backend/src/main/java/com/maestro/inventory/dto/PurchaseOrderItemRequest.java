package com.maestro.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record PurchaseOrderItemRequest(
        @NotNull Long productId,
        @NotNull @Positive Integer quantity,
        @NotNull @DecimalMin("0.00") BigDecimal unitPrice
) {}
