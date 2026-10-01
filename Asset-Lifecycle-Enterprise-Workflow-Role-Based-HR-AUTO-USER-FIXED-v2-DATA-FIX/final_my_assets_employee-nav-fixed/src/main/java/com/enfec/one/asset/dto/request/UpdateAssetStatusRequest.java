package com.enfec.one.asset.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateAssetStatusRequest(
        @NotBlank String status,
        String assignedTo
) {}