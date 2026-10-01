package com.enfec.one.asset.dto.response;
import com.enfec.one.asset.entity.AssetEvent;
import java.time.OffsetDateTime;
import java.util.UUID;
public record AssetEventResponse(UUID id,UUID assetId,String fromStatus,String toStatus,String actor,OffsetDateTime changedAt){
    public static AssetEventResponse from(AssetEvent e){return new AssetEventResponse(e.getId(),e.getAssetId(),e.getFromStatus()==null?null:e.getFromStatus().name(),e.getToStatus().name(),e.getActor(),e.getChangedAt());}
}
