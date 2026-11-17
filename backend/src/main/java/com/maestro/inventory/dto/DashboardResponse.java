package com.maestro.inventory.dto;

import java.util.List;

public record DashboardResponse(long totalProducts, long totalStock, long lowStockCount, long totalSuppliers,
                               long totalPurchaseOrders, long pendingPurchaseOrders,
                               List<InventoryResponse> lowStock, List<ActivityResponse> recentActivity) {}
