package com.enfec.one.asset.request;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name="asset_requests")
public class AssetRequest {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false,length=100) private String employee;
    @Column(name="employee_name",nullable=false,length=150) private String employeeName;
    @Column(nullable=false,length=100) private String department;
    @Column(name="asset_type",nullable=false,length=50) private String assetType;
    @Column(nullable=false,length=1000) private String reason;
    @Column(nullable=false,length=20) private String priority;
    @Column(name="required_date") private LocalDate requiredDate;
    @Column(length=1000) private String comments;
    @Column(nullable=false,length=20) private String status;
    @Column(name="rejection_reason",length=1000) private String rejectionReason;
    @Column(name="approved_by",length=100) private String approvedBy;
    @Column(name="approved_at") private OffsetDateTime approvedAt;
    @Column(name="assigned_asset_id") private UUID assignedAssetId;
    @Column(name="assigned_asset_tag",length=100) private String assignedAssetTag;
    @Column(name="created_at",nullable=false) private OffsetDateTime createdAt;
    @Column(name="updated_at",nullable=false) private OffsetDateTime updatedAt;
    protected AssetRequest() {}
    public AssetRequest(String employee,String employeeName,String department,String assetType,String reason,String priority,LocalDate requiredDate,String comments){
        this.employee=employee;this.employeeName=employeeName;this.department=department;this.assetType=assetType;this.reason=reason;this.priority=priority==null||priority.isBlank()?"NORMAL":priority.toUpperCase();this.requiredDate=requiredDate;this.comments=comments;this.status="PENDING";this.createdAt=OffsetDateTime.now(ZoneOffset.UTC);this.updatedAt=this.createdAt;
    }
    public void approve(String by, UUID assetId, String assetTag){status="APPROVED";approvedBy=by;approvedAt=OffsetDateTime.now(ZoneOffset.UTC);assignedAssetId=assetId;assignedAssetTag=assetTag;updatedAt=OffsetDateTime.now(ZoneOffset.UTC);}
    public void reject(String by,String reason){status="REJECTED";approvedBy=by;rejectionReason=reason;approvedAt=OffsetDateTime.now(ZoneOffset.UTC);updatedAt=OffsetDateTime.now(ZoneOffset.UTC);}
    public UUID getId(){return id;} public String getEmployee(){return employee;} public String getEmployeeName(){return employeeName;} public String getDepartment(){return department;} public String getAssetType(){return assetType;} public String getReason(){return reason;} public String getPriority(){return priority;} public LocalDate getRequiredDate(){return requiredDate;} public String getComments(){return comments;} public String getStatus(){return status;} public String getRejectionReason(){return rejectionReason;} public String getApprovedBy(){return approvedBy;} public OffsetDateTime getApprovedAt(){return approvedAt;} public UUID getAssignedAssetId(){return assignedAssetId;} public String getAssignedAssetTag(){return assignedAssetTag;} public OffsetDateTime getCreatedAt(){return createdAt;} public OffsetDateTime getUpdatedAt(){return updatedAt;}
}
