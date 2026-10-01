# Asset Lifecycle Frontend

React/Vite frontend for the Asset Lifecycle Status Management backend.

## Run

Keep the backend running on `http://localhost:8085`.

```powershell
npm install
npm run dev
```

Open `http://localhost:3012`.

## Admin navigation

- Dashboard — lifecycle counts, inventory summary, purchase/warranty summary and low-stock alerts
- Employee Requests — approve/reject employee requests
- Asset Register — create assets, search, filter, update lifecycle status, transfer/repair and view history
- Inventory & Analytics — quantity by asset type, quantity by brand/manufacturer, type + brand breakdown, purchase analytics, warranty analytics and low-stock alerts
- Audit Log — administrative and lifecycle activity
- Warranty — assets with warranty information
- Notifications — administrator notifications
- Settings — application configuration and supported statuses

## Inventory model

The application stores individual asset records. Quantities are calculated automatically from those records; there is no manually maintained quantity field.

The existing `make` field is displayed as **Brand / Manufacturer**. The existing `purchaseDate` field records when the asset was purchased by the company.

## APIs used

- `POST /api/auth/login`
- `GET /api/assets`
- `POST /api/assets`
- `PATCH /api/assets/{id}/status`
- `GET /api/assets/{id}/status-history`
- `GET /api/assets/analytics`
- `GET /api/assets/warranty`
- `GET /api/asset-requests`
- `GET /api/notifications`
- `GET /api/audit`

Protected APIs use the `X-Session-Id` header returned by login.
