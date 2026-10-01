package com.enfec.one.asset.controller;
import com.enfec.one.asset.auth.SessionAuthService; import com.enfec.one.asset.dto.request.*; import com.enfec.one.asset.dto.response.*; import com.enfec.one.asset.service.AssetService; import jakarta.validation.Valid; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/assets") public class AssetController {
 private final AssetService assetService; private final SessionAuthService auth;
 public AssetController(AssetService assetService,SessionAuthService auth){this.assetService=assetService;this.auth=auth;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public AssetResponse create(@RequestHeader("X-Session-Id") String s,@Valid @RequestBody CreateAssetRequest r){auth.requireRole(s,"ADMIN");return assetService.create(r);}
 @GetMapping public List<AssetResponse> getAll(@RequestHeader("X-Session-Id") String s){auth.require(s);return assetService.getAll();}
 @GetMapping("/my") public List<AssetResponse> my(@RequestHeader("X-Session-Id") String s){var u=auth.require(s);return assetService.getAll().stream().filter(a->u.displayName().equalsIgnoreCase(a.assignedTo())||u.username().equalsIgnoreCase(a.assignedTo())).toList();}
 @GetMapping("/warranty") public List<AssetResponse> warranty(@RequestHeader("X-Session-Id") String s){auth.requireRole(s,"ADMIN");return assetService.warrantyAssets();}
 @GetMapping("/{id}") public AssetResponse get(@RequestHeader("X-Session-Id") String s,@PathVariable UUID id){auth.require(s);return assetService.get(id);}
 @DeleteMapping("/{id}") public void delete(@RequestHeader("X-Session-Id") String s,@PathVariable UUID id){var u=auth.requireRole(s,"ADMIN");assetService.delete(id,u.username());}
 @PatchMapping("/{id}/status") public AssetResponse updateStatus(@RequestHeader("X-Session-Id") String s,@PathVariable UUID id,@Valid @RequestBody UpdateAssetStatusRequest r){var u=auth.requireRole(s,"ADMIN");return assetService.updateStatus(id,r.status(),u.username(),r.assignedTo());}
 @PatchMapping("/{id}/return") public AssetResponse returnAsset(@RequestHeader("X-Session-Id") String s,@PathVariable UUID id){var u=auth.require(s);return assetService.returnAsset(id,u.username());}
 @PatchMapping("/{id}/transfer") public AssetResponse transfer(@RequestHeader("X-Session-Id") String s,@PathVariable UUID id,@Valid @RequestBody TransferAssetRequest r){var u=auth.requireRole(s,"ADMIN");return assetService.transfer(id,r.employee(),u.username());}
 @PatchMapping("/{id}/repair") public AssetResponse repair(@RequestHeader("X-Session-Id") String s,@PathVariable UUID id,@Valid @RequestBody RepairRequest r){var u=auth.requireRole(s,"ADMIN");return assetService.updateRepair(id,r,u.username());}
 @GetMapping("/{id}/status-history") public List<AssetEventResponse> history(@RequestHeader("X-Session-Id") String s,@PathVariable UUID id){auth.require(s);return assetService.history(id);}
 @GetMapping("/statuses") public StatusResponse statuses(@RequestHeader("X-Session-Id") String s){auth.require(s);return new StatusResponse(assetService.supportedStatuses());}
 @GetMapping("/analytics") public Map<String,Object> analytics(@RequestHeader("X-Session-Id") String s){auth.requireRole(s,"ADMIN");return assetService.inventoryAnalytics();}
}
