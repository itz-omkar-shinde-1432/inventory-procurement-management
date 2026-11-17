package com.maestro.inventory.dto;

import java.time.LocalDateTime;

public record ActivityResponse(Long id, String type, String productName, Integer quantity,
                               String warehouse, LocalDateTime at, String note) {}
