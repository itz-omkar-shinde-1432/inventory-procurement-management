package com.maestro.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderRequest(
        @NotNull Long supplierId,
        @Pattern(regexp = "DRAFT|ORDERED|CANCELLED") String status,
        LocalDate expectedDate,
        @NotBlank @Size(max = 120) String warehouse,
        @Size(max = 500) String notes,
        @NotEmpty List<@Valid PurchaseOrderItemRequest> items
) {}
