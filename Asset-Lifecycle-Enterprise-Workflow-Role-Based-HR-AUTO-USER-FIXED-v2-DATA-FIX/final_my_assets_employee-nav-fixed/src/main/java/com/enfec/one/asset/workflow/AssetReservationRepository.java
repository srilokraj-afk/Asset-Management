package com.enfec.one.asset.workflow; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AssetReservationRepository extends JpaRepository<AssetReservation,UUID>{ boolean existsByAssetIdAndStatus(UUID assetId,String status); List<AssetReservation> findByRequestId(UUID requestId); }
