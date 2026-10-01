package com.enfec.one.asset.repository;
import com.enfec.one.asset.entity.AssetEvent;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AssetEventRepository extends JpaRepository<AssetEvent,UUID>{List<AssetEvent> findByAssetIdOrderByChangedAtDesc(UUID assetId);}
