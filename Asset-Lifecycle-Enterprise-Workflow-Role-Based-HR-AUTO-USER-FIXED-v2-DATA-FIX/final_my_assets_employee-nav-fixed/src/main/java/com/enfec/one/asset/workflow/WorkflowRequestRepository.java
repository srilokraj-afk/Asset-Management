package com.enfec.one.asset.workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface WorkflowRequestRepository extends JpaRepository<WorkflowRequest,UUID>{
 List<WorkflowRequest> findAllByOrderByCreatedAtDesc();
 List<WorkflowRequest> findByRequesterUsernameOrderByCreatedAtDesc(String username);
}
