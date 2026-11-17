package com.maestro.inventory.service;

import com.maestro.inventory.dto.*;
import com.maestro.inventory.entity.StockMovement;
import com.maestro.inventory.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DashboardService {
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository orderRepository;
    private final StockRecordRepository stockRepository;
    private final StockMovementRepository movementRepository;
    private final InventoryService inventoryService;

    public DashboardService(ProductRepository productRepository, SupplierRepository supplierRepository,
                            PurchaseOrderRepository orderRepository, StockRecordRepository stockRepository,
                            StockMovementRepository movementRepository, InventoryService inventoryService) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.orderRepository = orderRepository;
        this.stockRepository = stockRepository;
        this.movementRepository = movementRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse summary() {
        List<InventoryResponse> records = stockRepository.findAllByOrderByIdAsc().stream()
                .map(inventoryService::toResponse).toList();
        List<InventoryResponse> lowStock = records.stream()
                .filter(record -> !record.status().equals("In Stock")).toList();
        List<ActivityResponse> activity = movementRepository.findTop8ByOrderByOccurredAtDesc().stream()
                .map(this::toActivity).toList();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatusNotIn(List.of("RECEIVED", "CANCELLED"));
        long lowStockProducts = lowStock.stream().map(InventoryResponse::productId).distinct().count();
        return new DashboardResponse(productRepository.count(), stockRepository.sumAvailable(), lowStockProducts,
                supplierRepository.count(), totalOrders, pendingOrders, lowStock, activity);
    }

    private ActivityResponse toActivity(StockMovement movement) {
        return new ActivityResponse(movement.getId(), movement.getType(), movement.getProduct().getName(),
                movement.getQuantity(), movement.getWarehouse(), movement.getOccurredAt(), movement.getNote());
    }
}
