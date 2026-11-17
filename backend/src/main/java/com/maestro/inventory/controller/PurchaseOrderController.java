package com.maestro.inventory.controller;

import com.maestro.inventory.dto.PurchaseOrderRequest;
import com.maestro.inventory.dto.PurchaseOrderResponse;
import com.maestro.inventory.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {
    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public List<PurchaseOrderResponse> findAll() {
        return purchaseOrderService.findAll();
    }

    @GetMapping("/{id}")
    public PurchaseOrderResponse findById(@PathVariable Long id) {
        return purchaseOrderService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrderResponse create(@Valid @RequestBody PurchaseOrderRequest request) {
        return purchaseOrderService.create(request);
    }

    @PutMapping("/{id}")
    public PurchaseOrderResponse update(@PathVariable Long id, @Valid @RequestBody PurchaseOrderRequest request) {
        return purchaseOrderService.update(id, request);
    }

    @PostMapping("/{id}/receive")
    public PurchaseOrderResponse receive(@PathVariable Long id) {
        return purchaseOrderService.receive(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        purchaseOrderService.delete(id);
    }
}
