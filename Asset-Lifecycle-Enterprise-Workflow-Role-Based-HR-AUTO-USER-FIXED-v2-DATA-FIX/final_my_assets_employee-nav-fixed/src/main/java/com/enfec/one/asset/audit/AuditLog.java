package com.enfec.one.asset.audit;
import jakarta.persistence.*; import java.time.*; import java.util.*;
@Entity @Table(name="audit_logs") public class AuditLog {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false,length=100) private String actor; @Column(nullable=false,length=100) private String action; @Column(nullable=false,length=100) private String entityType; @Column(nullable=false,length=100) private String entityId; @Column(length=2000) private String details; @Column(nullable=false) private OffsetDateTime createdAt;
 protected AuditLog(){} public AuditLog(String actor,String action,String entityType,String entityId,String details){this.actor=actor;this.action=action;this.entityType=entityType;this.entityId=entityId;this.details=details;this.createdAt=OffsetDateTime.now(ZoneOffset.UTC);} public UUID getId(){return id;} public String getActor(){return actor;} public String getAction(){return action;} public String getEntityType(){return entityType;} public String getEntityId(){return entityId;} public String getDetails(){return details;} public OffsetDateTime getCreatedAt(){return createdAt;}
}
