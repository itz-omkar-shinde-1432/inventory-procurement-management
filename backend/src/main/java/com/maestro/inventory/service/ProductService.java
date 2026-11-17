package com.maestro.inventory.service;

import com.maestro.inventory.dto.ProductRequest;
import com.maestro.inventory.dto.ProductResponse;
import com.maestro.inventory.entity.Product;
import com.maestro.inventory.entity.Supplier;
import com.maestro.inventory.exception.ConflictException;
import com.maestro.inventory.exception.ResourceNotFoundException;
import com.maestro.inventory.repository.ProductRepository;
import com.maestro.inventory.repository.StockMovementRepository;
import com.maestro.inventory.repository.StockRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final SupplierService supplierService;
    private final InventoryService inventoryService;
    private final StockRecordRepository stockRepository;
    private final StockMovementRepository movementRepository;

    public ProductService(ProductRepository productRepository, SupplierService supplierService,
                         InventoryService inventoryService, StockRecordRepository stockRepository,
                         StockMovementRepository movementRepository) {
        this.productRepository = productRepository;
        this.supplierService = supplierService;
        this.inventoryService = inventoryService;
        this.stockRepository = stockRepository;
        this.movementRepository = movementRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll(String search, String category) {
        String query = search == null ? "" : search.trim().toLowerCase();
        String selectedCategory = category == null ? "" : category.trim();
        return productRepository.findAll().stream()
                .filter(p -> query.isEmpty() || p.getName().toLowerCase().contains(query)
                        || p.getSku().toLowerCase().contains(query)
                        || p.getCategory().toLowerCase().contains(query))
                .filter(p -> selectedCategory.isEmpty() || p.getCategory().equalsIgnoreCase(selectedCategory))
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return toResponse(getProduct(id));
    }

    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySkuIgnoreCase(request.sku().trim())) {
            throw new ConflictException("SKU " + request.sku() + " already exists.");
        }
        Product product = new Product();
        apply(product, request);
        Product saved = productRepository.save(product);
        String warehouse = warehouse(request.warehouse());
        inventoryService.createStock(saved, warehouse, request.quantity() == null ? 0 : request.quantity(), "Opening stock");
        return toResponse(saved);
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        if (productRepository.existsBySkuIgnoreCaseAndIdNot(request.sku().trim(), id)) {
            throw new ConflictException("SKU " + request.sku() + " already exists.");
        }
        apply(product, request);
        return toResponse(productRepository.save(product));
    }

    public void delete(Long id) {
        Product product = getProduct(id);
        try {
            movementRepository.deleteAllByProductId(id);
            stockRepository.deleteAllByProductId(id);
            productRepository.delete(product);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new ConflictException("This product is used by a purchase order and cannot be deleted.");
        }
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found."));
    }

    private void apply(Product product, ProductRequest request) {
        product.setSku(request.sku().trim());
        product.setName(request.name().trim());
        product.setCategory(request.category().trim());
        product.setMinStock(request.minStock());
        product.setUnitPrice(request.unitPrice());
        Supplier supplier = request.supplierId() == null ? null : supplierService.getSupplier(request.supplierId());
        product.setSupplier(supplier);
    }

    private ProductResponse toResponse(Product product) {
        long quantity = stockRepository.sumAvailableByProductId(product.getId());
        Supplier supplier = product.getSupplier();
        return new ProductResponse(product.getId(), product.getSku(), product.getName(), product.getCategory(),
                quantity, product.getMinStock(), product.getUnitPrice(), supplier == null ? null : supplier.getId(),
                supplier == null ? null : supplier.getName());
    }

    private String warehouse(String value) {
        return value == null || value.isBlank() ? "Main Warehouse" : value.trim();
    }
}
