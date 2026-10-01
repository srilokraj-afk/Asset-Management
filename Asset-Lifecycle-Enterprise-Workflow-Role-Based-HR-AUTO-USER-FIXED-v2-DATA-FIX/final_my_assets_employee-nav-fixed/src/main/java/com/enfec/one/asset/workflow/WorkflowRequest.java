package com.enfec.one.asset.workflow;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name="workflow_requests")
public class WorkflowRequest {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(name="request_no",nullable=false,unique=true,length=40) private String requestNo;
 @Column(name="workflow_type",nullable=false,length=30) private String workflowType;
 @Column(nullable=false,length=30) private String status;
 @Column(nullable=false,length=40) private String stage;
 @Column(name="requester_username",nullable=false,length=100) private String requesterUsername;
 @Column(name="requester_name",nullable=false,length=150) private String requesterName;
 @Column(name="employee_name",length=150) private String employeeName;
 @Column(name="employee_id",length=100) private String employeeId;
 @Column(length=100) private String department;
 @Column(name="asset_type",length=100) private String assetType;
 @Column(length=2000) private String reason;
 @Column(length=20) private String priority;
 @Column(name="required_date") private LocalDate requiredDate;
 @Column(name="items_json",columnDefinition="TEXT") private String itemsJson;
 @Column(name="estimated_cost_minor") private Long estimatedCostMinor;
 @Column(length=10) private String currency;
 @Column(name="budget_minor") private Long budgetMinor;
 @Column(name="vendor_name",length=200) private String vendorName;
 @Column(name="purchase_order_no",length=100) private String purchaseOrderNo;
 @Column(name="goods_receipt_no",length=100) private String goodsReceiptNo;
 @Column(name="rejection_reason",length=2000) private String rejectionReason;
 @Column(name="closed_at") private OffsetDateTime closedAt;
 @Column(name="created_at",nullable=false) private OffsetDateTime createdAt;
 @Column(name="updated_at",nullable=false) private OffsetDateTime updatedAt;
 @Transient private String accountUsername;
 protected WorkflowRequest(){}
 public WorkflowRequest(String requestNo,String type,String requesterUsername,String requesterName,String employeeName,String employeeId,String department,String assetType,String reason,String priority,LocalDate requiredDate,String itemsJson,Long cost,String currency,Long budget){
  this.requestNo=requestNo;this.workflowType=type;this.status="PENDING";this.stage="ADMIN_REVIEW";this.requesterUsername=requesterUsername;this.requesterName=requesterName;this.employeeName=employeeName;this.employeeId=employeeId;this.department=department;this.assetType=assetType;this.reason=reason;this.priority=priority;this.requiredDate=requiredDate;this.itemsJson=itemsJson;this.estimatedCostMinor=cost;this.currency=currency==null?"INR":currency;this.budgetMinor=budget;this.createdAt=OffsetDateTime.now(ZoneOffset.UTC);this.updatedAt=this.createdAt;
 }
 public void setAccountUsername(String value){this.accountUsername=value;} public String getAccountUsername(){return accountUsername;}
 public void move(String status,String stage){this.status=status;this.stage=stage;this.updatedAt=OffsetDateTime.now(ZoneOffset.UTC);}
 public void reject(String reason){this.status="REJECTED";this.stage="REJECTED";this.rejectionReason=reason;this.updatedAt=OffsetDateTime.now(ZoneOffset.UTC);}
 public void close(){this.status="CLOSED";this.stage="CLOSED";this.closedAt=OffsetDateTime.now(ZoneOffset.UTC);this.updatedAt=this.closedAt;}
 public void setMaintenanceRequest(){this.stage="DIAGNOSTIC";this.status="IN_PROGRESS";touch();} public void setVendor(String v){vendorName=v;touch();} public void setPo(String v){purchaseOrderNo=v;touch();} public void setGrn(String v){goodsReceiptNo=v;touch();} public void setBudget(Long v){budgetMinor=v;touch();}
 private void touch(){updatedAt=OffsetDateTime.now(ZoneOffset.UTC);}
 public UUID getId(){return id;} public String getRequestNo(){return requestNo;} public String getWorkflowType(){return workflowType;} public String getStatus(){return status;} public String getStage(){return stage;} public String getRequesterUsername(){return requesterUsername;} public String getRequesterName(){return requesterName;} public String getEmployeeName(){return employeeName;} public String getEmployeeId(){return employeeId;} public String getDepartment(){return department;} public String getAssetType(){return assetType;} public String getReason(){return reason;} public String getPriority(){return priority;} public LocalDate getRequiredDate(){return requiredDate;} public String getItemsJson(){return itemsJson;} public Long getEstimatedCostMinor(){return estimatedCostMinor;} public String getCurrency(){return currency;} public Long getBudgetMinor(){return budgetMinor;} public String getVendorName(){return vendorName;} public String getPurchaseOrderNo(){return purchaseOrderNo;} public String getGoodsReceiptNo(){return goodsReceiptNo;} public String getRejectionReason(){return rejectionReason;} public OffsetDateTime getClosedAt(){return closedAt;} public OffsetDateTime getCreatedAt(){return createdAt;} public OffsetDateTime getUpdatedAt(){return updatedAt;}
}
