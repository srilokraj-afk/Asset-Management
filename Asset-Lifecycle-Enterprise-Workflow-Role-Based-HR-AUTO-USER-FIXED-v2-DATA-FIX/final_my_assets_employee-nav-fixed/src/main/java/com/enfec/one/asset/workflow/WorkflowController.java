package com.enfec.one.asset.workflow;
import com.enfec.one.asset.dto.workflow.*; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import jakarta.validation.Valid; import java.util.*;
@RestController @RequestMapping("/api/workflow") public class WorkflowController { private final WorkflowService s; public WorkflowController(WorkflowService s){this.s=s;}
 @GetMapping("/requests") public List<WorkflowRequest> all(@RequestHeader("X-Session-Id") String x){return s.all(x);} @GetMapping("/requests/my") public List<WorkflowRequest> mine(@RequestHeader("X-Session-Id") String x){return s.mine(x);}
 @PostMapping("/requests") @ResponseStatus(HttpStatus.CREATED) public WorkflowRequest create(@RequestHeader("X-Session-Id") String x,@Valid @RequestBody WorkflowCreateRequest r){return s.create(x,r);}
 @PatchMapping("/requests/{id}/delegate") public WorkflowRequest delegate(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id){return s.delegateToVp(x,id);}
 @PatchMapping("/requests/{id}/approve") public WorkflowRequest approve(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@RequestBody(required=false) DecisionRequest r){return s.approve(x,id,r);}
 @PatchMapping("/requests/{id}/return") public WorkflowRequest returnForRevision(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@RequestBody(required=false) DecisionRequest r){return s.returnForRevision(x,id,r);}
 @PatchMapping("/requests/{id}/reject") public WorkflowRequest reject(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@RequestBody(required=false) DecisionRequest r){return s.reject(x,id,r);}
 @PatchMapping("/requests/{id}/reserve") public WorkflowRequest reserve(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@Valid @RequestBody ReserveRequest r){return s.reserve(x,id,r);}
 @PatchMapping("/requests/{id}/allocate") public WorkflowRequest allocate(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id){return s.allocate(x,id);}
 @PostMapping("/requests/{id}/purchase-order") public WorkflowRequest po(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@Valid @RequestBody PurchaseOrderRequest r){return s.createPo(x,id,r);}
 @PostMapping("/requests/{id}/goods-receipt") public WorkflowRequest grn(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@RequestBody GoodsReceiptRequest r){return s.receive(x,id,r);}
 @PostMapping("/requests/{id}/register-asset") public WorkflowRequest register(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@Valid @RequestBody RegisterAssetRequest r){return s.registerAsset(x,id,r);}
 @PatchMapping("/requests/{id}/inspect") public WorkflowRequest inspect(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id){return s.inspect(x,id);}
 @PatchMapping("/requests/{id}/close") public WorkflowRequest close(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id){return s.close(x,id);}
 @PostMapping("/maintenance") @ResponseStatus(HttpStatus.CREATED) public MaintenanceTicket maintenance(@RequestHeader("X-Session-Id") String x,@Valid @RequestBody MaintenanceCreateRequest r){return s.createMaintenance(x,r);}
 @GetMapping("/maintenance") public List<MaintenanceTicket> maintenanceList(@RequestHeader("X-Session-Id") String x){return s.maintenance(x);}
 @PatchMapping("/maintenance/{id}/diagnose") public MaintenanceTicket diagnose(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@RequestParam String diagnosis,@RequestParam boolean repairable){return s.diagnose(x,id,diagnosis,repairable);}
 @PatchMapping("/maintenance/{id}/replace") public MaintenanceTicket replace(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@RequestParam UUID replacementAssetId){return s.replaceMaintenance(x,id,replacementAssetId);}
 @PatchMapping("/maintenance/{id}/resolve") public MaintenanceTicket resolve(@RequestHeader("X-Session-Id") String x,@PathVariable UUID id,@RequestParam String resolution){return s.resolve(x,id,resolution);}
}
