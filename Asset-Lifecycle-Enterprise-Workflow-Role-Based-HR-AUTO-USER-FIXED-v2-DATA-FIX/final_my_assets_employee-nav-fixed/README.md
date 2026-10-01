# Asset Lifecycle Status Management

Standalone M18-F02 Asset Lifecycle application with Spring Boot, PostgreSQL/Flyway and React/Vite.

## Existing lifecycle
- IN_STOCK — available for assignment
- ASSIGNED — assigned to an employee
- IN_REPAIR — under maintenance/repair
- RETIRED — no longer in service

## Added employee/admin workflow
### Demo accounts
- Admin: `admin` / `admin123`
- Employee: `ravi` / `ravi123`

The login is intentionally a simple demo session mechanism. It is not a production identity system such as Keycloak/OAuth/JWT.

### Employee features
- Employee dashboard
- Request an asset
- Select asset type, priority, required date and reason
- Track request history
- View assigned assets
- Return an assigned asset
- View notifications

### Admin features
- Asset dashboard and analytics
- Inventory dashboard with quantity by asset type and brand/manufacturer
- Quantity breakdown by asset type + brand/manufacturer
- Purchase date tracking and purchase analytics
- Warranty tracking with active, expiring-soon and expired views
- Low-stock alerts for asset types with 5 or fewer available assets
- Advanced asset search and filters by type, brand, status and purchase year
- Asset register
- Create assets
- Update lifecycle status
- Approve/reject employee requests
- Automatic assignment of the first matching IN_STOCK asset on approval
- Transfer assigned assets
- Update repair notes
- Warranty register
- Audit log
- Notifications

## API flow
`Controller -> Service -> Repository -> PostgreSQL`

Important endpoints:
- `POST /api/auth/login`
- `POST /api/asset-requests`
- `GET /api/asset-requests/my`
- `GET /api/asset-requests`
- `PATCH /api/asset-requests/{id}/approve`
- `PATCH /api/asset-requests/{id}/reject`
- `GET /api/assets`
- `GET /api/assets/my`
- `POST /api/assets`
- `PATCH /api/assets/{id}/status`
- `PATCH /api/assets/{id}/return`
- `PATCH /api/assets/{id}/transfer`
- `PATCH /api/assets/{id}/repair`
- `GET /api/assets/{id}/status-history`
- `GET /api/assets/analytics` — lifecycle counts, inventory quantities, brand/manufacturer breakdown, purchase analytics, warranty analytics and low-stock alerts
- `GET /api/assets/warranty`
- `GET /api/audit`
- `GET /api/notifications`

All protected APIs use the demo `X-Session-Id` header returned by login.

## Local setup
### PostgreSQL
Existing project setup expects:
- database: `asset`
- username: `asset`
- password: `asset`
- host port: `5433`

Flyway applies V1 through V4 automatically. The current asset table already contains `make` (used as Brand/Manufacturer) and `purchase_date`, so the inventory extension calculates quantities from existing individual asset records without a manually maintained quantity column.

### Backend
```powershell
.\gradlew.bat bootRun
```
Runs on `http://localhost:8085`.

### Frontend
```powershell
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3012`.

The Vite proxy forwards `/api` to the backend on port 8085.

## Employee approval flow
1. Employee signs in.
2. Employee submits a request, for example `LAPTOP`.
3. Request is stored as `PENDING`.
4. Admin sees the request in Employee Requests.
5. Admin approves it.
6. Backend finds the first matching `IN_STOCK` asset.
7. Asset changes to `ASSIGNED` and is assigned to the employee.
8. Request becomes `APPROVED` and stores the assigned asset.
9. Employee receives a notification.
10. Lifecycle history and audit log record the change.

If no matching IN_STOCK asset exists, approval is rejected with a clear message and the request remains pending.


### Delete asset
Admin only.

`DELETE /api/assets/{id}`

The delete is confirmed in the Admin UI and is recorded in the audit log. Asset lifecycle events are removed with the asset, while the audit record is retained.

## Enterprise workflow extension (Lead flow)

The project now includes the four workflow families from `Workflows_Asset_Screens.pdf`:

1. Procurement: Purchase Request → Finance Budget Verification → VP Approval → Purchase Order → Goods Receipt → Inspection/Tagging → In Stock → Request Closed.
2. New Joinee/Onboarding: HR intake → System Admin review/delegation → VP approval → inventory selection/reservation → multi-asset allocation → Request Closed.
3. Secondary Hardware: Employee request → Reporting Manager approval → stock check → reserve/allocate or procurement → Request Closed.
4. Maintenance: Employee issue report → Admin diagnostic triage → repair or replacement → handover → Request Closed.

### Workflow roles

`ADMIN`, `EMPLOYEE`, `HR`, `MANAGER`, `FINANCE`, `VP`, `PROCUREMENT`

### Demo workflow accounts

- admin / admin123
- ravi / ravi123
- hr / hr123
- manager / manager123
- finance / finance123
- vp / vp123
- procurement / proc123

### Workflow API base

`/api/workflow`

Important endpoints include:

- `GET /api/workflow/requests`
- `GET /api/workflow/requests/my`
- `POST /api/workflow/requests`
- `PATCH /api/workflow/requests/{id}/delegate`
- `PATCH /api/workflow/requests/{id}/approve`
- `PATCH /api/workflow/requests/{id}/reject`
- `PATCH /api/workflow/requests/{id}/return`
- `PATCH /api/workflow/requests/{id}/reserve`
- `PATCH /api/workflow/requests/{id}/allocate`
- `POST /api/workflow/requests/{id}/purchase-order`
- `POST /api/workflow/requests/{id}/goods-receipt`
- `PATCH /api/workflow/requests/{id}/inspect`
- `POST /api/workflow/requests/{id}/register-asset`
- `PATCH /api/workflow/requests/{id}/close`
- `POST /api/workflow/maintenance`
- `GET /api/workflow/maintenance`
- `PATCH /api/workflow/maintenance/{id}/diagnose`
- `PATCH /api/workflow/maintenance/{id}/resolve`

Request lifecycle is separate from asset lifecycle. A request can end in `CLOSED` while the physical asset remains `ASSIGNED`, `IN_STOCK`, `IN_REPAIR`, or `RETIRED`.

### HR New Joinee Login Account
For an HR-created ONBOARDING request, the backend now also creates an EMPLOYEE login in `app_users` using a normalized username derived from the employee name and the temporary password `employee123`. The generated username is returned as `accountUsername` on the onboarding request. If the username already belongs to an EMPLOYEE, the existing account is reused; if it belongs to another role, the employee ID is appended to avoid an incorrect role assignment.
