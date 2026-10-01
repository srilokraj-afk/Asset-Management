package com.enfec.one.asset.entity;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "asset_events")
public class AssetEvent {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name="asset_id", nullable=false) private UUID assetId;
    @Enumerated(EnumType.STRING) @Column(name="from_status", length=20) private AssetStatus fromStatus;
    @Enumerated(EnumType.STRING) @Column(name="to_status", nullable=false, length=20) private AssetStatus toStatus;
    @Column(nullable=false, length=150) private String actor;
    @Column(nullable=false) private OffsetDateTime changedAt;
    protected AssetEvent() {}
    public AssetEvent(UUID assetId, AssetStatus fromStatus, AssetStatus toStatus, String actor) {
        this.assetId=assetId; this.fromStatus=fromStatus; this.toStatus=toStatus; this.actor=actor;
        this.changedAt=OffsetDateTime.now(ZoneOffset.UTC);
    }
    public UUID getId(){return id;} public UUID getAssetId(){return assetId;} public AssetStatus getFromStatus(){return fromStatus;}
    public AssetStatus getToStatus(){return toStatus;} public String getActor(){return actor;} public OffsetDateTime getChangedAt(){return changedAt;}
}
