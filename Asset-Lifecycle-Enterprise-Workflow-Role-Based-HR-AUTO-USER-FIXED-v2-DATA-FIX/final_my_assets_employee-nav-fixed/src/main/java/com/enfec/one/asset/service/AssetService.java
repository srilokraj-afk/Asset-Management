package com.enfec.one.asset.service;

import com.enfec.one.asset.audit.AuditLog;
import com.enfec.one.asset.audit.AuditLogRepository;
import com.enfec.one.asset.dto.request.CreateAssetRequest;
import com.enfec.one.asset.dto.request.RepairRequest;
import com.enfec.one.asset.dto.response.AssetEventResponse;
import com.enfec.one.asset.dto.response.AssetResponse;
import com.enfec.one.asset.entity.Asset;
import com.enfec.one.asset.entity.AssetEvent;
import com.enfec.one.asset.entity.AssetStatus;
import com.enfec.one.asset.exception.AssetNotFoundException;
import com.enfec.one.asset.exception.DuplicateAssetException;
import com.enfec.one.asset.exception.InvalidAssetStatusException;
import com.enfec.one.asset.repository.AssetEventRepository;
import com.enfec.one.asset.repository.AssetRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class AssetService {

 private final AssetRepository assetRepository;
 private final AssetEventRepository eventRepository;
 private final AuditLogRepository auditLogRepository;

 public AssetService(
         AssetRepository assetRepository,
         AssetEventRepository eventRepository,
         AuditLogRepository auditLogRepository
 ) {
  this.assetRepository = assetRepository;
  this.eventRepository = eventRepository;
  this.auditLogRepository = auditLogRepository;
 }

 @Transactional
 public AssetResponse create(CreateAssetRequest r) {

  if (assetRepository.existsByAssetTag(r.assetTag())) {
   throw new DuplicateAssetException(
           "Asset tag already exists: " + r.assetTag()
   );
  }

  if (assetRepository.existsBySerialNumber(r.serialNumber())) {
   throw new DuplicateAssetException(
           "Serial number already exists: " + r.serialNumber()
   );
  }

  Asset asset = new Asset(
          r.assetTag(),
          normalizeLabel(r.type(), "OTHER"),
          normalizeLabel(r.make(), "Unknown"),
          r.model(),
          r.serialNumber(),
          r.purchaseDate(),
          r.warrantyExpiry(),
          r.costMinor(),
          r.currency(),
          r.condition(),
          r.notes()
  );

  Asset saved = assetRepository.save(asset);

  eventRepository.save(
          new AssetEvent(
                  saved.getId(),
                  null,
                  saved.getStatus(),
                  "system"
          )
  );

  auditLogRepository.save(
          new AuditLog(
                  "system",
                  "ASSET_CREATED",
                  "ASSET",
                  saved.getId().toString(),
                  saved.getAssetTag()
          )
  );

  return AssetResponse.from(saved);
 }

 @Transactional(readOnly = true)
 public AssetResponse get(UUID id) {
  return AssetResponse.from(find(id));
 }

 @Transactional(readOnly = true)
 public List<AssetResponse> getAll() {
  return assetRepository.findAll()
          .stream()
          .map(AssetResponse::from)
          .toList();
 }

 @Transactional
 public AssetResponse updateStatus(
         UUID id,
         String value,
         String actor
 ) {
  return updateStatus(id, value, actor, null);
 }

 @Transactional
 public AssetResponse updateStatus(
         UUID id,
         String value,
         String actor,
         String assignedTo
 ) {

  Asset asset = find(id);

  AssetStatus next = parseStatus(value);
  AssetStatus old = asset.getStatus();

  /*
   * ASSIGNED requires an employee/person.
   */
  if (next == AssetStatus.ASSIGNED) {

   if (assignedTo == null || assignedTo.isBlank()) {
    throw new IllegalArgumentException(
            "assignedTo is required when status is ASSIGNED"
    );
   }

   asset.assignTo(assignedTo.trim());

  } else {

   asset.assignTo(null);
  }

  /*
   * Change lifecycle status only when it is actually different.
   */
  if (old != next) {
   asset.changeStatus(next);
  }

  assetRepository.save(asset);

  /*
   * Store lifecycle history.
   */
  if (old != next) {

   String actualActor =
           actor == null || actor.isBlank()
                   ? "system"
                   : actor;

   eventRepository.save(
           new AssetEvent(
                   asset.getId(),
                   old,
                   next,
                   actualActor
           )
   );

   auditLogRepository.save(
           new AuditLog(
                   actualActor,
                   "STATUS_CHANGED",
                   "ASSET",
                   id.toString(),
                   old + " -> " + next
           )
   );
  }

  return AssetResponse.from(asset);
 }

 @Transactional
 public AssetResponse returnAsset(
         UUID id,
         String actor
 ) {

  Asset asset = find(id);

  AssetStatus old = asset.getStatus();

  asset.assignTo(null);

  if (old != AssetStatus.IN_STOCK) {
   asset.changeStatus(AssetStatus.IN_STOCK);
  }

  assetRepository.save(asset);

  String actualActor =
          actor == null || actor.isBlank()
                  ? "system"
                  : actor;

  if (old != AssetStatus.IN_STOCK) {

   eventRepository.save(
           new AssetEvent(
                   asset.getId(),
                   old,
                   AssetStatus.IN_STOCK,
                   actualActor
           )
   );
  }

  auditLogRepository.save(
          new AuditLog(
                  actualActor,
                  "ASSET_RETURNED",
                  "ASSET",
                  id.toString(),
                  asset.getAssetTag()
          )
  );

  return AssetResponse.from(asset);
 }

 @Transactional
 public AssetResponse transfer(
         UUID id,
         String employee,
         String actor
 ) {

  Asset asset = find(id);

  if (asset.getStatus() != AssetStatus.ASSIGNED) {
   throw new IllegalArgumentException(
           "Only an assigned asset can be transferred"
   );
  }

  if (employee == null || employee.isBlank()) {
   throw new IllegalArgumentException(
           "Employee is required"
   );
  }

  String newEmployee = employee.trim();

  asset.assignTo(newEmployee);

  assetRepository.save(asset);

  String actualActor =
          actor == null || actor.isBlank()
                  ? "system"
                  : actor;

  auditLogRepository.save(
          new AuditLog(
                  actualActor,
                  "ASSET_TRANSFERRED",
                  "ASSET",
                  id.toString(),
                  "Transferred to " + newEmployee
          )
  );

  return AssetResponse.from(asset);
 }

 @Transactional
 public AssetResponse updateRepair(
         UUID id,
         RepairRequest request,
         String actor
 ) {

  Asset asset = find(id);

  if (asset.getStatus() != AssetStatus.IN_REPAIR) {
   throw new IllegalArgumentException(
           "Asset must be In Repair before repair details can be updated"
   );
  }

  asset.updateRepairNotes(request.notes());

  assetRepository.save(asset);

  String actualActor =
          actor == null || actor.isBlank()
                  ? "system"
                  : actor;

  auditLogRepository.save(
          new AuditLog(
                  actualActor,
                  "REPAIR_UPDATED",
                  "ASSET",
                  id.toString(),
                  request.notes()
          )
  );

  return AssetResponse.from(asset);
 }

 @Transactional
 public void delete(UUID id, String actor) {
  Asset asset = find(id);

  String actualActor =
          actor == null || actor.isBlank()
                  ? "system"
                  : actor;

  // Keep the deletion itself auditable. Asset events are removed automatically
  // by the database FK cascade, while the audit record remains.
  auditLogRepository.save(
          new AuditLog(
                  actualActor,
                  "ASSET_DELETED",
                  "ASSET",
                  id.toString(),
                  asset.getAssetTag() + " | " + asset.getType() + " | " + asset.getMake() + " " + asset.getModel()
          )
  );

  assetRepository.delete(asset);
 }

 @Transactional(readOnly = true)
 public List<AssetResponse> warrantyAssets() {

  return assetRepository.findAll()
          .stream()
          .filter(asset -> asset.getWarrantyExpiry() != null)
          .sorted(
                  Comparator.comparing(
                          Asset::getWarrantyExpiry
                  )
          )
          .map(AssetResponse::from)
          .toList();
 }

 @Transactional(readOnly = true)
 public List<AssetEventResponse> history(UUID id) {

  find(id);

  return eventRepository
          .findByAssetIdOrderByChangedAtDesc(id)
          .stream()
          .map(AssetEventResponse::from)
          .toList();
 }

 public List<String> supportedStatuses() {

  return Arrays.stream(AssetStatus.values())
          .map(Enum::name)
          .toList();
 }

 /**
  * Inventory and purchase analytics are calculated from the individual asset
  * records. There is intentionally no manually maintained quantity column.
  */
 @Transactional(readOnly = true)
 public Map<String, Object> inventoryAnalytics() {

  List<Asset> assets = assetRepository.findAll();

  Map<String, Long> byType = new LinkedHashMap<>();
  Map<String, Long> byMake = new LinkedHashMap<>();
  Map<String, Map<String, Long>> byTypeAndMake = new LinkedHashMap<>();
  Map<String, Long> inStockByType = new LinkedHashMap<>();

  for (Asset asset : assets) {
   String type = cleanLabel(asset.getType(), "OTHER");
   String make = cleanLabel(asset.getMake(), "Unknown");

   byType.merge(type, 1L, Long::sum);
   inStockByType.putIfAbsent(type, 0L);
   byMake.merge(make, 1L, Long::sum);
   byTypeAndMake
           .computeIfAbsent(type, key -> new LinkedHashMap<>())
           .merge(make, 1L, Long::sum);

   if (asset.getStatus() == AssetStatus.IN_STOCK) {
    inStockByType.merge(type, 1L, Long::sum);
   }
  }

  LocalDate today = LocalDate.now(ZoneOffset.UTC);
  YearMonth currentMonth = YearMonth.from(today);
  int currentYear = today.getYear();

  long purchasedThisMonth = assets.stream()
          .map(Asset::getPurchaseDate)
          .filter(date -> date != null && YearMonth.from(date).equals(currentMonth))
          .count();

  long purchasedThisYear = assets.stream()
          .map(Asset::getPurchaseDate)
          .filter(date -> date != null && date.getYear() == currentYear)
          .count();

  long warrantyActive = assets.stream()
          .map(Asset::getWarrantyExpiry)
          .filter(date -> date != null && date.isAfter(today.plusDays(30)))
          .count();

  long warrantyExpiringSoon = assets.stream()
          .map(Asset::getWarrantyExpiry)
          .filter(date -> date != null && !date.isBefore(today) && !date.isAfter(today.plusDays(30)))
          .count();

  long warrantyExpired = assets.stream()
          .map(Asset::getWarrantyExpiry)
          .filter(date -> date != null && date.isBefore(today))
          .count();

  List<Map<String, Object>> lowStock = inStockByType.entrySet().stream()
          .filter(entry -> entry.getValue() <= 5)
          .map(entry -> {
           Map<String, Object> row = new LinkedHashMap<>();
           row.put("type", entry.getKey());
           row.put("available", entry.getValue());
           row.put("threshold", 5);
           return row;
          })
          .toList();

  Map<String, Object> result = new LinkedHashMap<>();
  result.put("TOTAL", assets.size());
  result.put("IN_STOCK", assets.stream().filter(a -> a.getStatus() == AssetStatus.IN_STOCK).count());
  result.put("ASSIGNED", assets.stream().filter(a -> a.getStatus() == AssetStatus.ASSIGNED).count());
  result.put("IN_REPAIR", assets.stream().filter(a -> a.getStatus() == AssetStatus.IN_REPAIR).count());
  result.put("RETIRED", assets.stream().filter(a -> a.getStatus() == AssetStatus.RETIRED).count());
  result.put("WARRANTY_TRACKED", assets.stream().filter(a -> a.getWarrantyExpiry() != null).count());
  result.put("byType", byType);
  result.put("byMake", byMake);
  result.put("byTypeAndMake", byTypeAndMake);
  result.put("purchasedThisMonth", purchasedThisMonth);
  result.put("purchasedThisYear", purchasedThisYear);
  result.put("warrantyActive", warrantyActive);
  result.put("warrantyExpiringSoon", warrantyExpiringSoon);
  result.put("warrantyExpired", warrantyExpired);
  result.put("lowStock", lowStock);
  result.put("lowStockThreshold", 5);
  return result;
 }

 private String cleanLabel(String value, String fallback) {
  return normalizeLabel(value, fallback);
 }

 /**
  * Normalizes labels for inventory grouping so values such as
  * LAPTOP/Laptop/laptop and DELL/Dell/dell are treated as the same value.
  * The normalized display form is title case.
  */
 private String normalizeLabel(String value, String fallback) {
  if (value == null || value.isBlank()) return fallback;

  return Arrays.stream(value.trim().replaceAll("\\s+", " ").split(" "))
          .filter(part -> !part.isBlank())
          .map(part -> part.substring(0, 1).toUpperCase(Locale.ROOT)
                  + part.substring(1).toLowerCase(Locale.ROOT))
          .reduce((left, right) -> left + " " + right)
          .orElse(fallback);
 }

 private Asset find(UUID id) {

  return assetRepository
          .findById(id)
          .orElseThrow(
                  () -> new AssetNotFoundException(id)
          );
 }

 private AssetStatus parseStatus(String value) {

  if (value == null || value.isBlank()) {
   throw new InvalidAssetStatusException(
           String.valueOf(value)
   );
  }

  try {

   return AssetStatus.valueOf(
           value.trim()
                   .toUpperCase(Locale.ROOT)
                   .replace(' ', '_')
   );

  } catch (IllegalArgumentException e) {

   throw new InvalidAssetStatusException(value);
  }
 }
}