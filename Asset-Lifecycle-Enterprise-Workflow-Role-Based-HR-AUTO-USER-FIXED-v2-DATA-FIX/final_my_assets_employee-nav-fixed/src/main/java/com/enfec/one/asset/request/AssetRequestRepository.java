package com.enfec.one.asset.request;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssetRequestRepository extends JpaRepository<AssetRequest,UUID>{ List<AssetRequest> findByEmployeeOrderByCreatedAtDesc(String employee); List<AssetRequest> findAllByOrderByCreatedAtDesc(); }
