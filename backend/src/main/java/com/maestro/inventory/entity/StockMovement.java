package com.maestro.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false, length = 20)
    private String type;
    @Column(nullable = false)
    private Integer quantity;
    @Column(nullable = false, length = 120)
    private String warehouse;
    @Column(length = 300)
    private String note;
    @Column(nullable = false)
    private LocalDateTime occurredAt;

    protected StockMovement() {}

    public StockMovement(Product product, String type, Integer quantity, String warehouse, String note) {
        this.product = product;
        this.type = type;
        this.quantity = quantity;
        this.warehouse = warehouse;
        this.note = note;
        this.occurredAt = LocalDateTime.now();
    }
    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getType() { return type; }
    public Integer getQuantity() { return quantity; }
    public String getWarehouse() { return warehouse; }
    public String getNote() { return note; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
}
