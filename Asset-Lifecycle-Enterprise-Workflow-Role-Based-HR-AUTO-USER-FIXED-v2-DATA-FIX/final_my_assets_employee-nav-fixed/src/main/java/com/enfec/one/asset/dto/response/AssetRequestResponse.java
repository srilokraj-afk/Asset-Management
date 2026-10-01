package com.enfec.one.asset.dto.response;

import com.enfec.one.asset.request.AssetRequest;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AssetRequestResponse(UUID id, String employee, String employeeName, String department, String assetType, String reason, String priority, LocalDate requiredDate, String comments, String status, String rejectionReason, String approvedBy, OffsetDateTime approvedAt, UUID assignedAssetId, String assignedAssetTag, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
    public static AssetRequestResponse from(AssetRequest r) {
        return new AssetRequestResponse(r.getId(), r.getEmployee(), r.getEmployeeName(), r.getDepartment(), r.getAssetType(), r.getReason(), r.getPriority(), r.getRequiredDate(), r.getComments(), r.getStatus(), r.getRejectionReason(), r.getApprovedBy(), r.getApprovedAt(), r.getAssignedAssetId(), r.getAssignedAssetTag(), r.getCreatedAt(), r.getUpdatedAt());
    }
}
