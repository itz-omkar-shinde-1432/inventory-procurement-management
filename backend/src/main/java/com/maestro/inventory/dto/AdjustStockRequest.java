package com.maestro.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;

public record AdjustStockRequest(
        @NotBlank @Pattern(regexp = "IN|OUT") String type,
        @NotNull @Positive Integer quantity
) {}
