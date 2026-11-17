# Maestro Intellect Inventory & Procurement

A full-stack inventory and procurement application for **Maestro Intellect Pvt. Ltd.** The existing React/Vite frontend has been retained and connected to a Spring Boot REST API backed by MySQL. Products, suppliers, stock, purchase orders and dashboard metrics are persisted in the database; the application does not populate demo records or use hard-coded dashboard totals.

## Technology stack

- **Frontend:** React 18, JavaScript, React Router, Vite, CSS
- **Backend:** Java 21, Spring Boot 3, Spring Web, Spring Data JPA, Hibernate, Bean Validation
- **Database:** MySQL 8+
- **Build tools:** npm and Maven

## Architecture

The browser renders the React application. Its service modules send HTTP requests to the Spring Boot API. Controllers validate and route requests to services; services apply business rules and use Spring Data repositories to read and update MySQL through Hibernate/JPA.

```text
React pages and components
          │ fetch /api/...
          ▼
Spring REST controllers → Services → Spring Data repositories
                                           │ JPA / Hibernate
                                           ▼
                                         MySQL
```

### Folder structure

```text
inventory-frontend/
├── src/
│   ├── components/       Shared dialogs, loading/error states and badges
│   ├── hooks/            Async data-loading hook
│   ├── layouts/          Responsive sidebar and application shell
│   ├── pages/            Dashboard, products, inventory, suppliers, purchase orders
│   ├── services/         Fetch API clients for backend resources
│   └── utils/            Shared formatting and stock-status helpers
├── backend/
│   ├── src/main/java/com/maestro/inventory/
│   │   ├── config/       CORS configuration
│   │   ├── controller/  REST endpoints
│   │   ├── dto/          Validated request and response objects
│   │   ├── entity/       JPA database entities
│   │   ├── exception/    API errors and exception mapping
│   │   ├── repository/   Spring Data database access
│   │   └── service/      Business rules and transactions
│   └── src/main/resources/application.properties
├── index.html
└── vite.config.js
```

## Database configuration

1. Install and start MySQL 8 or later.
2. Create the database (the JDBC setting also creates it when the database user has permission):

   ```sql
   CREATE DATABASE maestro_inventory;
   ```

3. Configure the database user before starting the backend. In PowerShell, for example:

   ```powershell
   $env:DB_USERNAME = "root"
   $env:DB_PASSWORD = Read-Host "MySQL password"
   ```

Spring Boot connects to `jdbc:mysql://localhost:3306/maestro_inventory`. The username defaults to `root`; the password must be supplied through `DB_PASSWORD`. The application does not create the database itself. `spring.jpa.hibernate.ddl-auto=update` creates/updates tables inside the existing database from the entities, and `spring.jpa.show-sql=true` logs generated SQL for learning and local verification. Use a migration tool such as Flyway and a controlled schema migration process before production deployment. Never commit database credentials.

No sample rows are inserted automatically. A new database starts empty, and dashboard values are calculated from stored products, stock records, suppliers, purchase orders and stock movements.

## Run locally

Prerequisites: JDK 21, Maven 3.9+, Node.js 20+, npm, and a running MySQL server.

Open two terminals from the project root.

**Terminal 1 — backend:**

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = Read-Host "MySQL password"
cd backend
mvn spring-boot:run
```

The API listens on `http://localhost:8080`.

**Terminal 2 — frontend:**

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the backend at port 8080. For a different API host, set `VITE_API_BASE_URL` before starting/building the frontend.

## Implemented functionality

- **Dashboard:** product count, total available stock, low-stock count, supplier count, purchase-order count, pending-order count, recent stock movements and stock by warehouse.
- **Products:** create, list, search, category-filter, update and delete; SKU uniqueness, supplier association, unit price, minimum stock and opening stock.
- **Suppliers:** create, list, search, update and delete; deletion is rejected when a product or order still references the supplier.
- **Inventory:** view stock by product/warehouse and make validated stock-in/stock-out adjustments. Adjustments are recorded as stock movements.
- **Purchase orders:** create, list, update, delete unreceived orders, track Draft/Ordered/Received/Cancelled status, and receive an ordered purchase order. Receiving updates the corresponding warehouse stock and records movements in one database transaction; an order cannot be received twice.
- **Validation and errors:** invalid requests return an HTTP error with a readable message. The frontend displays server and connectivity errors instead of substituting mock data.

There is currently no user authentication or authorization. The app is intended for local development and must not be exposed as a production service until access control is implemented.

## REST API

All endpoints are relative to `http://localhost:8080`.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Database-derived dashboard metrics and recent activity |
| `GET` | `/api/products?search=&category=` | List/search/filter products |
| `GET` | `/api/products/{id}` | Get one product |
| `POST` | `/api/products` | Create product and optional opening stock |
| `PUT` | `/api/products/{id}` | Update product details |
| `DELETE` | `/api/products/{id}` | Delete product when it has no purchase-order history |
| `GET` | `/api/suppliers` | List suppliers |
| `GET` | `/api/suppliers/{id}` | Get one supplier |
| `POST` | `/api/suppliers` | Create supplier |
| `PUT` | `/api/suppliers/{id}` | Update supplier |
| `DELETE` | `/api/suppliers/{id}` | Delete an unreferenced supplier |
| `GET` | `/api/inventory` | List inventory by product and warehouse |
| `POST` | `/api/inventory/{id}/adjust` | Adjust stock with `{"type":"IN","quantity":5}` or `"OUT"` |
| `GET` | `/api/purchase-orders` | List purchase orders and line items |
| `GET` | `/api/purchase-orders/{id}` | Get one purchase order |
| `POST` | `/api/purchase-orders` | Create a purchase order with item lines |
| `PUT` | `/api/purchase-orders/{id}` | Update a Draft or Ordered purchase order |
| `POST` | `/api/purchase-orders/{id}/receive` | Receive an Ordered purchase order into stock |
| `DELETE` | `/api/purchase-orders/{id}` | Delete an unreceived purchase order |

Successful creates return `201 Created`; deletes return `204 No Content`; missing resources return `404`; validation errors return `400`; duplicate/restricted operations return `409`.

### Example purchase order request

```json
{
  "supplierId": 1,
  "status": "ORDERED",
  "expectedDate": "2026-12-01",
  "warehouse": "Main Warehouse",
  "notes": "Deliver during business hours",
  "items": [
    { "productId": 1, "quantity": 12, "unitPrice": 850.00 }
  ]
}
```

## Application workflow

1. Add supplier records and products.
2. Enter each product's price, minimum stock, supplier and (optionally) opening quantity/location.
3. Use **Inventory** to review stock and record manual receipts or issues.
4. Create a purchase order, select supplier and products, then mark the order **Ordered**.
5. When the delivery arrives, select **Receive**. The server increments stock at the selected warehouse, saves stock-movement records and marks the order **Received** atomically.
6. The dashboard reads current values and movement history from MySQL.

## Build checks

```powershell
npm run build
mvn -f backend\pom.xml clean test
```

