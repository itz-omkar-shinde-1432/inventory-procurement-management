package com.maestro.inventory.repository;

import com.maestro.inventory.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    long countByStatusNotIn(java.util.Collection<String> statuses);
}
