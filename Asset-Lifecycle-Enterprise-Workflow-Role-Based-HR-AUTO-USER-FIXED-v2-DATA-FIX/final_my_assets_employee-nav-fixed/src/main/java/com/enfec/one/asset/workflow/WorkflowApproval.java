package com.enfec.one.asset.workflow;
import jakarta.persistence.*; import java.time.*; import java.util.UUID;
@Entity @Table(name="workflow_approvals") public class WorkflowApproval {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="request_id",nullable=false) private WorkflowRequest request;
 @Column(name="approver_role",nullable=false,length=30) private String approverRole;
 @Column(name="approver_username",length=100) private String approverUsername;
 @Column(nullable=false,length=20) private String decision="PENDING";
 @Column(length=2000) private String comments; @Column(name="decided_at") private OffsetDateTime decidedAt; @Column(name="created_at",nullable=false) private OffsetDateTime createdAt;
 protected WorkflowApproval(){} public WorkflowApproval(WorkflowRequest r,String role){request=r;approverRole=role;createdAt=OffsetDateTime.now(ZoneOffset.UTC);}
 public void decide(String user,String d,String c){approverUsername=user;decision=d;comments=c;decidedAt=OffsetDateTime.now(ZoneOffset.UTC);}
 public UUID getId(){return id;} public String getApproverRole(){return approverRole;} public String getApproverUsername(){return approverUsername;} public String getDecision(){return decision;} public String getComments(){return comments;} public OffsetDateTime getDecidedAt(){return decidedAt;} public OffsetDateTime getCreatedAt(){return createdAt;}
}
