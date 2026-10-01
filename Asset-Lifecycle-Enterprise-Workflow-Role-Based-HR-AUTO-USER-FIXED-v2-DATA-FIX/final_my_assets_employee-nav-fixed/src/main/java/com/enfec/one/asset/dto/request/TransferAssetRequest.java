package com.enfec.one.asset.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TransferAssetRequest(@NotBlank String employee) {}
