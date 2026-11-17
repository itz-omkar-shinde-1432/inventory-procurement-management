package com.maestro.inventory.repository;

import com.maestro.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findTop8ByOrderByOccurredAtDesc();
    void deleteAllByProductId(Long productId);
}
