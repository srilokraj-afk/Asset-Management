package com.enfec.one.asset.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RepairRequest(@NotBlank String notes) {}
