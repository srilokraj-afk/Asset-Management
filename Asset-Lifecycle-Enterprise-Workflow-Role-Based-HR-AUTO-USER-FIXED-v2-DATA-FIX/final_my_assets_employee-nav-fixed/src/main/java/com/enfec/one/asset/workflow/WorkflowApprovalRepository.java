package com.enfec.one.asset.workflow; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface WorkflowApprovalRepository extends JpaRepository<WorkflowApproval,UUID>{ List<WorkflowApproval> findByRequestId(UUID requestId); List<WorkflowApproval> findByRequestIdOrderByCreatedAtAsc(UUID requestId); }
