package com.enfec.one.asset.request;

import com.enfec.one.asset.audit.*;
import com.enfec.one.asset.auth.SessionAuthService;
import com.enfec.one.asset.dto.request.*;
import com.enfec.one.asset.dto.response.AssetRequestResponse;
import com.enfec.one.asset.entity.Asset;
import com.enfec.one.asset.entity.AssetStatus;
import com.enfec.one.asset.notification.*;
import com.enfec.one.asset.repository.AssetRepository;
import com.enfec.one.asset.service.AssetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class AssetRequestService {
    private final AssetRequestRepository requestRepository;
    private final AssetRepository assetRepository;
    private final AssetService assetService;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final SessionAuthService auth;
    public AssetRequestService(AssetRequestRepository requestRepository, AssetRepository assetRepository, AssetService assetService, NotificationRepository notificationRepository, AuditLogRepository auditLogRepository, SessionAuthService auth){this.requestRepository=requestRepository;this.assetRepository=assetRepository;this.assetService=assetService;this.notificationRepository=notificationRepository;this.auditLogRepository=auditLogRepository;this.auth=auth;}

    @Transactional
    public AssetRequestResponse create(String sessionId, AssetRequestCreate input){
        var user=auth.require(sessionId);
        if(!"EMPLOYEE".equals(user.role())) throw new IllegalArgumentException("Only employees can create asset requests");
        String type=input.assetType().trim().toUpperCase();
        if(type.isBlank()) throw new IllegalArgumentException("Asset type is required");
        AssetRequest r=new AssetRequest(user.username(),user.displayName(),user.department(),type,input.reason().trim(),input.priority(),input.requiredDate(),input.comments());
        requestRepository.save(r);
        notificationRepository.save(new Notification("admin","New asset request",user.displayName()+" requested a "+type+"."));
        auditLogRepository.save(new AuditLog(user.username(),"REQUEST_CREATED","ASSET_REQUEST",r.getId().toString(),type));
        return AssetRequestResponse.from(r);
    }
    public List<AssetRequestResponse> mine(String sessionId){var u=auth.require(sessionId);return requestRepository.findByEmployeeOrderByCreatedAtDesc(u.username()).stream().map(AssetRequestResponse::from).toList();}
    public List<AssetRequestResponse> all(String sessionId){auth.requireRole(sessionId,"ADMIN");return requestRepository.findAllByOrderByCreatedAtDesc().stream().map(AssetRequestResponse::from).toList();}
    @Transactional
    public AssetRequestResponse approve(String sessionId, UUID id){
        var admin=auth.requireRole(sessionId,"ADMIN");
        AssetRequest r=requestRepository.findById(id).orElseThrow(()->new IllegalArgumentException("Asset request not found: "+id));
        if(!"PENDING".equals(r.getStatus())) throw new IllegalArgumentException("Only pending requests can be approved");
        Asset asset=assetRepository.findByTypeIgnoreCaseAndStatus(r.getAssetType(), AssetStatus.IN_STOCK).stream().findFirst().orElseThrow(()->new IllegalArgumentException("No In Stock asset is available for type: "+r.getAssetType()));
        assetService.updateStatus(asset.getId(),"ASSIGNED",admin.username(),r.getEmployeeName());
        r.approve(admin.username(),asset.getId(),asset.getAssetTag()); requestRepository.save(r);
        notificationRepository.save(new Notification(r.getEmployee(),"Asset request approved","Your request for a "+r.getAssetType()+" was approved. Asset: "+asset.getAssetTag()+"."));
        auditLogRepository.save(new AuditLog(admin.username(),"REQUEST_APPROVED","ASSET_REQUEST",id.toString(),"Assigned "+asset.getAssetTag()+" to "+r.getEmployeeName()));
        return AssetRequestResponse.from(r);
    }
    @Transactional
    public AssetRequestResponse reject(String sessionId, UUID id, RejectRequest input){
        var admin=auth.requireRole(sessionId,"ADMIN"); AssetRequest r=requestRepository.findById(id).orElseThrow(()->new IllegalArgumentException("Asset request not found: "+id));
        if(!"PENDING".equals(r.getStatus())) throw new IllegalArgumentException("Only pending requests can be rejected");
        String reason=input==null||input.reason()==null||input.reason().isBlank()?"Request rejected by administrator":input.reason().trim();
        r.reject(admin.username(),reason);requestRepository.save(r);notificationRepository.save(new Notification(r.getEmployee(),"Asset request rejected",reason));auditLogRepository.save(new AuditLog(admin.username(),"REQUEST_REJECTED","ASSET_REQUEST",id.toString(),reason));return AssetRequestResponse.from(r);
    }
}
