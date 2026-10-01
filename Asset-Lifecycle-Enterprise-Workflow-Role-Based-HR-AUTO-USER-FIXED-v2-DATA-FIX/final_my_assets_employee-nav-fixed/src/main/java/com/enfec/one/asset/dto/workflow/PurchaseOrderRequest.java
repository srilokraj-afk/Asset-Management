package com.enfec.one.asset.dto.workflow; import jakarta.validation.constraints.NotBlank; public record PurchaseOrderRequest(@NotBlank String vendorName,Long amountMinor,String currency) {}
