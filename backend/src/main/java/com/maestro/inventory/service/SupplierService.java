package com.maestro.inventory.service;

import com.maestro.inventory.dto.SupplierRequest;
import com.maestro.inventory.dto.SupplierResponse;
import com.maestro.inventory.entity.Supplier;
import com.maestro.inventory.exception.ResourceNotFoundException;
import com.maestro.inventory.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> findAll() {
        return supplierRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse findById(Long id) {
        return toResponse(getSupplier(id));
    }

    public SupplierResponse create(SupplierRequest request) {
        Supplier supplier = new Supplier();
        apply(supplier, request);
        return toResponse(supplierRepository.save(supplier));
    }

    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = getSupplier(id);
        apply(supplier, request);
        return toResponse(supplierRepository.save(supplier));
    }

    public void delete(Long id) {
        supplierRepository.delete(getSupplier(id));
    }

    public Supplier getSupplier(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier " + id + " was not found."));
    }

    private void apply(Supplier supplier, SupplierRequest request) {
        supplier.setName(request.name().trim());
        supplier.setContactPerson(clean(request.contactPerson()));
        supplier.setPhone(clean(request.phone()));
        supplier.setEmail(clean(request.email()));
        supplier.setAddress(clean(request.address()));
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return new SupplierResponse(supplier.getId(), supplier.getName(), supplier.getContactPerson(),
                supplier.getPhone(), supplier.getEmail(), supplier.getAddress());
    }
}
