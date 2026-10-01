package com.enfec.one.asset.dto.workflow;
import jakarta.validation.constraints.NotBlank; import java.time.LocalDate;
public record RegisterAssetRequest(@NotBlank String assetTag,@NotBlank String type,@NotBlank String make,@NotBlank String model,@NotBlank String serialNumber,LocalDate purchaseDate,LocalDate warrantyExpiry,Long costMinor,String currency,String condition,String notes) {}
