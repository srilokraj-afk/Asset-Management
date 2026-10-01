package com.enfec.one.asset.entity;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "assets", uniqueConstraints = {
        @UniqueConstraint(name = "uk_assets_asset_tag", columnNames = "asset_tag"),
        @UniqueConstraint(name = "uk_assets_serial_number", columnNames = "serial_number")
})
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_tag", nullable = false, length = 100)
    private String assetTag;

    @Column(name = "asset_type", nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 100)
    private String make;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "serial_number", nullable = false, length = 150)
    private String serialNumber;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Column(name = "cost_minor")
    private Long costMinor;

    @Column(length = 3)
    private String currency;

    @Column(length = 50)
    private String condition;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetStatus status;

    // Person/employee currently assigned to this asset
    @Column(name = "assigned_to", length = 150)
    private String assignedTo;

    @Column(name = "repair_notes", length = 2000)
    private String repairNotes;

    @Column(name = "repair_started_at")
    private OffsetDateTime repairStartedAt;

    @Column(name = "repair_completed_at")
    private OffsetDateTime repairCompletedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Asset() {}

    public Asset(String assetTag, String type, String make, String model, String serialNumber,
                 LocalDate purchaseDate, LocalDate warrantyExpiry, Long costMinor, String currency,
                 String condition, String notes) {

        this.assetTag = assetTag;
        this.type = type;
        this.make = make;
        this.model = model;
        this.serialNumber = serialNumber;
        this.purchaseDate = purchaseDate;
        this.warrantyExpiry = warrantyExpiry;
        this.costMinor = costMinor;
        this.currency = currency;
        this.condition = condition;
        this.notes = notes;

        this.status = AssetStatus.IN_STOCK;
        this.assignedTo = null;

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void changeStatus(AssetStatus status) {
        AssetStatus previous = this.status;
        this.status = status;
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (status == AssetStatus.IN_REPAIR && this.repairStartedAt == null) this.repairStartedAt = now;
        if (status != AssetStatus.IN_REPAIR && previous == AssetStatus.IN_REPAIR) this.repairCompletedAt = now;
        this.updatedAt = now;
    }

    public void updateRepairNotes(String notes) {
        this.repairNotes = notes;
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public void assignTo(String assignedTo) {
        this.assignedTo = assignedTo;
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public UUID getId() {
        return id;
    }

    public String getAssetTag() {
        return assetTag;
    }

    public String getType() {
        return type;
    }

    public String getMake() {
        return make;
    }

    public String getModel() {
        return model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public LocalDate getWarrantyExpiry() {
        return warrantyExpiry;
    }

    public Long getCostMinor() {
        return costMinor;
    }

    public String getCurrency() {
        return currency;
    }

    public String getCondition() {
        return condition;
    }

    public String getNotes() {
        return notes;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getRepairNotes() { return repairNotes; }
    public OffsetDateTime getRepairStartedAt() { return repairStartedAt; }
    public OffsetDateTime getRepairCompletedAt() { return repairCompletedAt; }
}
