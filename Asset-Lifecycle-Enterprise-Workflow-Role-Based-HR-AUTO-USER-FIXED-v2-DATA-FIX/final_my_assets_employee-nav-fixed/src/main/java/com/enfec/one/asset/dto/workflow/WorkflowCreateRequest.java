package com.enfec.one.asset.dto.workflow;
import jakarta.validation.constraints.NotBlank; import java.time.LocalDate; import java.util.List;
public record WorkflowCreateRequest(@NotBlank String workflowType,String employeeName,String employeeId,String department,@NotBlank String assetType,String reason,String priority,LocalDate requiredDate,List<String> items,Long estimatedCostMinor,String currency,Long budgetMinor,String vendorName) {}
