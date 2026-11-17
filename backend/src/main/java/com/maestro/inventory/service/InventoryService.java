package com.maestro.inventory.service;

import com.maestro.inventory.dto.AdjustStockRequest;
import com.maestro.inventory.dto.InventoryResponse;
import com.maestro.inventory.entity.Product;
import com.maestro.inventory.entity.StockMovement;
import com.maestro.inventory.entity.StockRecord;
import com.maestro.inventory.exception.ResourceNotFoundException;
import com.maestro.inventory.repository.ProductRepository;
import com.maestro.inventory.repository.StockMovementRepository;
import com.maestro.inventory.repository.StockRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class InventoryService {
    private final StockRecordRepository stockRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository movementRepository;

    public InventoryService(StockRecordRepository stockRepository, ProductRepository productRepository,
                            StockMovementRepository movementRepository) {
        this.stockRepository = stockRepository;
        this.productRepository = productRepository;
        this.movementRepository = movementRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> findAll() {
        return stockRepository.findAllByOrderByIdAsc().stream().map(this::toResponse).toList();
    }

    public StockRecord createStock(Product product, String warehouse, int quantity, String note) {
        StockRecord stock = stockRepository.findByProductIdAndWarehouseIgnoreCase(product.getId(), warehouse)
                .orElseGet(() -> {
                    StockRecord newStock = new StockRecord();
                    newStock.setProduct(product);
                    newStock.setWarehouse(warehouse);
                    newStock.setAvailable(0);
                    newStock.setReserved(0);
                    return newStock;
                });
        if (quantity > 0) {
            stock.setAvailable(stock.getAvailable() + quantity);
            movementRepository.save(new StockMovement(product, "IN", quantity, warehouse, note));
        }
        return stockRepository.save(stock);
    }

    public InventoryResponse adjust(Long id, AdjustStockRequest request) {
        StockRecord stock = stockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record " + id + " was not found."));
        int signed = request.type().equals("IN") ? request.quantity() : -request.quantity();
        if (stock.getAvailable() + signed < 0) {
            throw new IllegalArgumentException("Only " + stock.getAvailable() + " units are available to remove.");
        }
        stock.setAvailable(stock.getAvailable() + signed);
        stockRepository.save(stock);
        movementRepository.save(new StockMovement(stock.getProduct(), request.type(), request.quantity(),
                stock.getWarehouse(), "Manual stock adjustment"));
        return toResponse(stock);
    }

    public void receive(Product product, String warehouse, int quantity, String orderNumber) {
        createStock(product, warehouse, quantity, "Received purchase order " + orderNumber);
    }

    public InventoryResponse toResponse(StockRecord stock) {
        Product product = stock.getProduct();
        return new InventoryResponse(stock.getId(), product.getId(), product.getName(), product.getSku(),
                stock.getWarehouse(), stock.getAvailable(), stock.getReserved(), product.getMinStock(),
                status(stock.getAvailable(), product.getMinStock()));
    }

    public static String status(long quantity, int minimum) {
        if (quantity <= 0) return "Out of Stock";
        if (quantity <= minimum) return "Low Stock";
        return "In Stock";
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found."));
    }
}
