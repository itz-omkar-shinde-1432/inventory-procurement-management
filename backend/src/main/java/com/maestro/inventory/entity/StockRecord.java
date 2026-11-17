package com.maestro.inventory.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_records", uniqueConstraints =
        @UniqueConstraint(name = "uk_stock_product_warehouse", columnNames = {"product_id", "warehouse"}))
public class StockRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false, length = 120)
    private String warehouse;
    @Column(nullable = false)
    private Integer available = 0;
    @Column(nullable = false)
    private Integer reserved = 0;

    public StockRecord() {}

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getWarehouse() { return warehouse; }
    public void setWarehouse(String warehouse) { this.warehouse = warehouse; }
    public Integer getAvailable() { return available; }
    public void setAvailable(Integer available) { this.available = available; }
    public Integer getReserved() { return reserved; }
    public void setReserved(Integer reserved) { this.reserved = reserved; }
}
