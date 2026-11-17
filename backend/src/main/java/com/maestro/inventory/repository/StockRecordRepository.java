package com.maestro.inventory.repository;

import com.maestro.inventory.entity.StockRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StockRecordRepository extends JpaRepository<StockRecord, Long> {
    List<StockRecord> findAllByOrderByIdAsc();
    List<StockRecord> findByProductId(Long productId);
    Optional<StockRecord> findByProductIdAndWarehouseIgnoreCase(Long productId, String warehouse);
    void deleteAllByProductId(Long productId);
    @Query("select coalesce(sum(s.available), 0) from StockRecord s")
    long sumAvailable();
    @Query("select coalesce(sum(s.available), 0) from StockRecord s where s.product.id = :productId")
    long sumAvailableByProductId(@Param("productId") Long productId);
}
