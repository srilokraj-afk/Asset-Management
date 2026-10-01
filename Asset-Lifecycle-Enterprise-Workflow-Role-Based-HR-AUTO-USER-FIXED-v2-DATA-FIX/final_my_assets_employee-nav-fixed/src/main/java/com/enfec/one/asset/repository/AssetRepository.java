package com.enfec.one.asset.repository;
import com.enfec.one.asset.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssetRepository extends JpaRepository<Asset,UUID>{ boolean existsByAssetTag(String assetTag); boolean existsBySerialNumber(String serialNumber); List<Asset> findByStatus(com.enfec.one.asset.entity.AssetStatus status); List<Asset> findByTypeIgnoreCaseAndStatus(String type, com.enfec.one.asset.entity.AssetStatus status); }
