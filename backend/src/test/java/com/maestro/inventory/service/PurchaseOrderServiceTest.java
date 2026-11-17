package com.maestro.inventory.service;

import com.maestro.inventory.entity.*;
import com.maestro.inventory.exception.ConflictException;
import com.maestro.inventory.repository.ProductRepository;
import com.maestro.inventory.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceTest {
    @Mock private PurchaseOrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private SupplierService supplierService;
    @Mock private InventoryService inventoryService;
    private PurchaseOrderService service;

    @BeforeEach
    void setUp() {
        service = new PurchaseOrderService(orderRepository, productRepository, supplierService, inventoryService);
    }

    @Test
    void receivingOrderedPurchaseOrderAddsEachItemAndMarksOrderReceived() {
        PurchaseOrder order = orderedOrder();
        when(orderRepository.findById(12L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.receive(12L);

        verify(inventoryService).receive(order.getItems().get(0).getProduct(), "Pune Hub", 4, "PO-12");
        assertEquals("RECEIVED", order.getStatus());
        assertNotNull(order.getReceivedAt());
    }

    @Test
    void receivedPurchaseOrderCannotBeReceivedAgain() {
        PurchaseOrder order = orderedOrder();
        order.setStatus("RECEIVED");
        when(orderRepository.findById(12L)).thenReturn(Optional.of(order));

        assertThrows(ConflictException.class, () -> service.receive(12L));

        verifyNoInteractions(inventoryService);
        verify(orderRepository, never()).save(any(PurchaseOrder.class));
    }

    private PurchaseOrder orderedOrder() {
        Supplier supplier = new Supplier();
        supplier.setName("Supplier");
        Product product = new Product();
        product.setName("Item");
        product.setSku("SKU-1");
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderNumber("PO-12");
        order.setSupplier(supplier);
        order.setStatus("ORDERED");
        order.setWarehouse("Pune Hub");
        order.addItem(new PurchaseOrderItem(product, 4, BigDecimal.TEN));
        return order;
    }
}
