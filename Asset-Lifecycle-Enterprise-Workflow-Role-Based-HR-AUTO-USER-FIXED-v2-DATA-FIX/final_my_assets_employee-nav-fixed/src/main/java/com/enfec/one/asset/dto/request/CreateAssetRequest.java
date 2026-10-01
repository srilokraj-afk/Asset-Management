package com.enfec.one.asset.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CreateAssetRequest(
        @NotBlank @Size(max=100) String assetTag,
        @NotBlank @Size(max=50) String type,
        @NotBlank @Size(max=100) String make,
        @NotBlank @Size(max=100) String model,
        @NotBlank @Size(max=150) String serialNumber,
        LocalDate purchaseDate,
        LocalDate warrantyExpiry,
        @PositiveOrZero Long costMinor,
        @Size(min=3,max=3) String currency,
        @Size(max=50) String condition,
        @Size(max=1000) String notes) {}
