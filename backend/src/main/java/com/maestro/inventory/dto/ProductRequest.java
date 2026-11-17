package com.maestro.inventory.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 40) String sku,
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 80) String category,
        @NotNull @PositiveOrZero Integer minStock,
        @NotNull @DecimalMin("0.00") BigDecimal unitPrice,
        Long supplierId,
        @PositiveOrZero Integer quantity,
        @Size(max = 120) String warehouse
) {}
