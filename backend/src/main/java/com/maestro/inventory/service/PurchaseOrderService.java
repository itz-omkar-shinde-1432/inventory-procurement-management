package com.maestro.inventory.service;

import com.maestro.inventory.dto.PurchaseOrderItemRequest;
import com.maestro.inventory.dto.PurchaseOrderRequest;
import com.maestro.inventory.dto.PurchaseOrderResponse;
import com.maestro.inventory.entity.*;
import com.maestro.inventory.exception.ConflictException;
import com.maestro.inventory.exception.ResourceNotFoundException;
import com.maestro.inventory.repository.PurchaseOrderRepository;
import com.maestro.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class PurchaseOrderService {
    private final PurchaseOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SupplierService supplierService;
    private final InventoryService inventoryService;

    public PurchaseOrderService(PurchaseOrderRepository orderRepository, ProductRepository productRepository,
                                SupplierService supplierService, InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.supplierService = supplierService;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> findAll() {
        return orderRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse findById(Long id) {
        return toResponse(getOrder(id));
    }

    public PurchaseOrderResponse create(PurchaseOrderRequest request) {
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderNumber("PO-" + LocalDate.now().toString().replace("-", "") + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT));
        order.setCreatedAt(LocalDateTime.now());
        apply(order, request, true);
        return toResponse(orderRepository.save(order));
    }

    public PurchaseOrderResponse update(Long id, PurchaseOrderRequest request) {
        PurchaseOrder order = getOrder(id);
        if (!order.getStatus().equals("DRAFT") && !order.getStatus().equals("ORDERED")) {
            throw new ConflictException("Only draft or ordered purchase orders can be edited.");
        }
        apply(order, request, false);
        return toResponse(orderRepository.save(order));
    }

    public PurchaseOrderResponse receive(Long id) {
        PurchaseOrder order = getOrder(id);
        if (!order.getStatus().equals("ORDERED")) {
            throw new ConflictException("Only an ordered purchase order can be received.");
        }
        for (PurchaseOrderItem item : order.getItems()) {
            inventoryService.receive(item.getProduct(), order.getWarehouse(), item.getQuantity(), order.getOrderNumber());
        }
        order.setStatus("RECEIVED");
        order.setReceivedAt(LocalDateTime.now());
        return toResponse(orderRepository.save(order));
    }

    public void delete(Long id) {
        PurchaseOrder order = getOrder(id);
        if (order.getStatus().equals("RECEIVED")) {
            throw new ConflictException("Received purchase orders are retained for audit history.");
        }
        orderRepository.delete(order);
    }

    private void apply(PurchaseOrder order, PurchaseOrderRequest request, boolean creating) {
        Supplier supplier = supplierService.getSupplier(request.supplierId());
        String status = request.status() == null || request.status().isBlank()
                ? (creating ? "DRAFT" : order.getStatus()) : request.status();
        if (!List.of("DRAFT", "ORDERED", "CANCELLED").contains(status)) {
            throw new IllegalArgumentException("Purchase order status is not valid.");
        }
        order.setSupplier(supplier);
        order.setStatus(status);
        order.setExpectedDate(request.expectedDate());
        order.setWarehouse(request.warehouse().trim());
        order.setNotes(request.notes() == null || request.notes().isBlank() ? null : request.notes().trim());
        order.clearItems();
        for (PurchaseOrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product " + itemRequest.productId() + " was not found."));
            order.addItem(new PurchaseOrderItem(product, itemRequest.quantity(), itemRequest.unitPrice()));
        }
    }

    private PurchaseOrder getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order " + id + " was not found."));
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order) {
        List<PurchaseOrderResponse.Item> items = order.getItems().stream().map(item ->
                new PurchaseOrderResponse.Item(item.getId(), item.getProduct().getId(), item.getProduct().getSku(),
                        item.getProduct().getName(), item.getQuantity(), item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))).toList();
        BigDecimal total = items.stream().map(PurchaseOrderResponse.Item::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PurchaseOrderResponse(order.getId(), order.getOrderNumber(), order.getSupplier().getId(),
                order.getSupplier().getName(), order.getStatus(), order.getExpectedDate(), order.getCreatedAt(),
                order.getReceivedAt(), order.getWarehouse(), order.getNotes(), items, total);
    }
}
