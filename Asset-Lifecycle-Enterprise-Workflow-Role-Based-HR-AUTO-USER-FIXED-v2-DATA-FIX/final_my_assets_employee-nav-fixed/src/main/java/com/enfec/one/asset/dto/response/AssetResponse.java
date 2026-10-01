package com.enfec.one.asset.dto.response;

import com.enfec.one.asset.entity.Asset;

import java.time.*;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        String assetTag,
        String type,
        String make,
        String model,
        String serialNumber,
        LocalDate purchaseDate,
        LocalDate warrantyExpiry,
        Long costMinor,
        String currency,
        String condition,
        String notes,
        String status,
        String assignedTo,
        String repairNotes,
        OffsetDateTime repairStartedAt,
        OffsetDateTime repairCompletedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static AssetResponse from(Asset a) {
        return new AssetResponse(
                a.getId(),
                a.getAssetTag(),
                a.getType(),
                a.getMake(),
                a.getModel(),
                a.getSerialNumber(),
                a.getPurchaseDate(),
                a.getWarrantyExpiry(),
                a.getCostMinor(),
                a.getCurrency(),
                a.getCondition(),
                a.getNotes(),
                a.getStatus().name(),
                a.getAssignedTo(),
                a.getRepairNotes(),
                a.getRepairStartedAt(),
                a.getRepairCompletedAt(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}