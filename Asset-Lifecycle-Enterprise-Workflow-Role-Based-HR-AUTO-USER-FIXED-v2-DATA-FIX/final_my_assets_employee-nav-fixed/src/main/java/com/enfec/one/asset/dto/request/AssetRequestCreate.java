package com.enfec.one.asset.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record AssetRequestCreate(
        @NotBlank String assetType,
        @NotBlank String reason,
        String priority,
        LocalDate requiredDate,
        String comments
) {}
