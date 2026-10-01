# Enterprise Asset Workflow Implementation

Implemented against the lead-provided workflow specification.

## Workflow 1 — Procurement
Stock requirement → Purchase Request → Finance budget verification → VP/higher authority → Purchase Order → Vendor → Goods Received → Asset Inspection & Tagging → In Stock → Request Closed.

Finance can approve, reject, or return the request for revision. VP rejection closes the request. Admin creates the PO, records receipt, inspects the goods, and registers/tag the new asset.

## Workflow 2 — New Joinee / Onboarding
HR creates an onboarding request for the joining employee and selects multiple assets. System Admin receives the request and delegates it to VP. VP approval routes the request to inventory selection. Admin can reserve multiple in-stock assets and allocate them together. The final request is closed.

## Workflow 3 — Secondary Hardware
Employee creates a secondary hardware request. Manager approval is required. After approval, Admin checks stock. If available, the asset is reserved and allocated. If unavailable, the request can enter procurement.

## Workflow 4 — Maintenance
Employee reports an asset issue. Admin receives the ticket and performs diagnostic triage. The admin records whether it is repairable. Repairable assets are repaired and verified; non-repairable assets follow replacement allocation. The maintenance flow ends with handover and request closure where a workflow request is used.

## Request vs Asset status

Request statuses:
`PENDING`, `UNDER_REVIEW`, `APPROVAL_PENDING`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`, `CLOSED`

Asset statuses remain:
`IN_STOCK`, `ASSIGNED`, `IN_REPAIR`, `RETIRED`

Reservations are stored separately so `RESERVED` does not replace the required asset lifecycle statuses.

## Role-based workflow visibility (updated)

The UI and workflow API are separated by responsibility:

| Role | What the role sees | Main actions |
|---|---|---|
| HR | HR-created onboarding/new-joinee requests | Create onboarding ticket, track request status |
| System Admin | All active and completed workflow requests | Delegate onboarding to VP, reserve multiple assets, allocate assets, create PO, record GRN, inspect/tag assets, close requests, maintain assets |
| VP | Requests waiting at VP approval | Approve or reject onboarding/procurement requests at the VP gate |
| Manager | Secondary hardware requests waiting for manager approval | Approve or reject employee secondary hardware requests |
| Finance | Procurement requests waiting for budget verification | Budget approve, return for revision, reject |
| Procurement | Procurement request queue | View purchasing progress; System Admin performs PO/GRN execution in this implementation |
| Employee | Own secondary-hardware requests and assigned assets | Submit secondary hardware request, track it, report asset issues |

### New Joinee workflow

HR submits candidate/employee details and requested items (for example Laptop, ID Card, Mouse and Keyboard). The request enters **ADMIN_REVIEW**. System Admin delegates it to VP. VP approves or rejects. On approval, System Admin selects and reserves the required in-stock assets, allocates them together to the new joinee, and closes the request after handover.

The asset reservation UI supports multiple asset IDs and matches onboarding item types so that a new-joinee request is not limited to the laptop only.


## My Assets visibility

All non-admin roles (EMPLOYEE, HR, MANAGER, FINANCE, VP, PROCUREMENT) load `GET /api/assets/my` and can view assets assigned to their logged-in username or display name. Admin retains the full Asset Register/inventory view.
