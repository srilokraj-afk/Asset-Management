package com.enfec.one.asset.request;
import com.enfec.one.asset.dto.request.*; import com.enfec.one.asset.dto.response.AssetRequestResponse; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/asset-requests") public class AssetRequestController{
 private final AssetRequestService service; public AssetRequestController(AssetRequestService service){this.service=service;}
 @PostMapping public AssetRequestResponse create(@RequestHeader("X-Session-Id") String session,@Valid @RequestBody AssetRequestCreate r){return service.create(session,r);}
 @GetMapping("/my") public List<AssetRequestResponse> mine(@RequestHeader("X-Session-Id") String session){return service.mine(session);}
 @GetMapping public List<AssetRequestResponse> all(@RequestHeader("X-Session-Id") String session){return service.all(session);}
 @PatchMapping("/{id}/approve") public AssetRequestResponse approve(@RequestHeader("X-Session-Id") String session,@PathVariable UUID id){return service.approve(session,id);}
 @PatchMapping("/{id}/reject") public AssetRequestResponse reject(@RequestHeader("X-Session-Id") String session,@PathVariable UUID id,@RequestBody(required=false) RejectRequest r){return service.reject(session,id,r);}
}
