# Project explanation — Inventory & Procurement Management System

## 1. Simple introduction

This application helps a business keep product and supplier records, monitor stock at different warehouses, and follow purchase orders from creation to delivery. The dashboard shows the current values stored in MySQL. When a purchase order is received, the delivered quantities are added to stock automatically.

## 2. Main parts of the application

The project has two runnable applications:

- **React frontend:** displays pages and forms in the browser. It collects input, calls the backend, and shows returned information or errors.
- **Spring Boot backend:** exposes REST endpoints, validates data and applies business rules.
- **MySQL database:** permanently stores products, suppliers, stock records, stock movements, purchase orders and order items.

The backend follows four common Spring layers:

1. **Controller:** receives HTTP requests and chooses the operation.
2. **Service:** contains application rules, including stock checks and order receipt.
3. **Repository:** uses Spring Data JPA to load and save database records.
4. **Entity:** describes a database table and its relationships.

## 3. Frontend → backend → database communication

1. A page such as Products calls a function in `src/services/productService.js`.
2. `src/services/api.js` sends the HTTP request using the browser's Fetch API.
3. During local development Vite forwards `/api` to Spring Boot on port 8080.
4. A Spring controller maps the URL and method to a service call.
5. The service uses a repository. Spring Data JPA and Hibernate translate entity operations into SQL for MySQL.
6. Spring serializes a response DTO as JSON.
7. React refreshes its data and displays the response. If the server responds with an error or cannot be reached, the UI shows an error rather than fake data.

## 4. Important Java classes

- `InventoryApplication`: the Spring Boot entry point. Running this class starts the web server and configures the application.
- **Entities** (`Product`, `Supplier`, `StockRecord`, `StockMovement`, `PurchaseOrder`, `PurchaseOrderItem`): define persisted objects and relationships. A product can have stock in more than one warehouse. A purchase order belongs to a supplier and contains line items.
- **Repositories** (`ProductRepository`, `SupplierRepository`, etc.): provide database access through Spring Data. Simple methods are generated from method names; aggregate stock queries use JPQL.
- **Controllers** (`ProductController`, `SupplierController`, `InventoryController`, `PurchaseOrderController`, `DashboardController`): define the REST URL and HTTP method for each feature.
- **Services** (`ProductService`, `SupplierService`, `InventoryService`, `PurchaseOrderService`, `DashboardService`): implement validation-dependent business behavior. `PurchaseOrderService.receive` and inventory updates run in transactions so a failed update is not partially committed.
- **DTOs**: request and response types that shape the public API and keep HTTP JSON separate from JPA entities. Jakarta Validation annotations reject missing or invalid values.
- `ApiExceptionHandler`: turns common exceptions into readable HTTP statuses and JSON error messages.
- `WebConfig`: permits the local Vite origin to call the API during development.

## 5. CRUD workflow

CRUD means **Create, Read, Update and Delete**:

- **Create:** the page sends `POST` with JSON. The controller validates it, the service applies rules, and the repository saves the entity.
- **Read:** the page sends `GET`. The repository loads data, the service maps it to a response DTO, and the browser renders it.
- **Update:** the page sends `PUT` with the record ID and new JSON. The service loads the existing row, changes allowed fields and saves it.
- **Delete:** the page sends `DELETE`. The backend checks that the record exists and is not required by purchase-order history or another relationship before deleting it.

The React forms show server-side validation failures, for example duplicate SKUs or attempts to remove more stock than is available.

## 6. REST API concepts

REST uses resource URLs and standard HTTP methods:

- `GET` reads a resource and should not change it.
- `POST` creates a resource or performs an explicit action such as receiving an order.
- `PUT` updates an existing resource.
- `DELETE` removes a resource.

The server communicates outcomes with status codes: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found` and `409 Conflict`. JSON request and response bodies carry the data. A DTO controls the exact fields sent over the API.

## 7. Purchase order and stock workflow

An order is created in Draft or Ordered status with one or more product lines. Editing is allowed while it is Draft or Ordered. Only an Ordered purchase order can be received. The receive endpoint loads the order, adds each line quantity to the correct warehouse, saves a stock-movement record for audit and changes the order to Received in one transaction. This prevents a repeated receive action from adding the same stock twice.

Dashboard totals are calculated from repository/database queries and persisted rows; no dashboard numbers or sample records are hard-coded.

## 8. Database setup summary

Start MySQL, create `maestro_inventory`, and set `DB_USERNAME` and `DB_PASSWORD` in the shell that starts Spring Boot. The connection URL is `jdbc:mysql://localhost:3306/maestro_inventory`. JPA creates or updates tables for local development. For production, credentials should come from a secret manager and schema changes should use reviewed migrations.

## 9. Database relationships

- **Product → Supplier:** many products can reference one optional supplier (`Product.supplier_id`).
- **Product → Stock records:** one product can have stock records at multiple warehouses; each stock record has one product.
- **Product → Stock movements:** one product can have many audit movements; each movement records type, quantity, warehouse, time and note.
- **Supplier → Purchase orders:** one supplier can receive many orders; every purchase order has one supplier.
- **Purchase order → Items:** one order has one or more items. The order owns its item rows, so removing an unreceived order also removes its item rows.
- **Purchase order item → Product:** every line refers to a product and stores the ordered quantity and price at order time.

Entity relationships use foreign keys. They prevent deleting referenced suppliers or products and keep purchase history connected to the catalog.

## 10. Run and verify locally

Install JDK 21, Maven 3.9+, Node.js 20+, and MySQL 8+. Create `maestro_inventory` in MySQL Workbench, then open a PowerShell terminal:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = Read-Host "MySQL password"
cd backend
mvn clean test
mvn spring-boot:run
```

In another terminal from the frontend project root:

```powershell
npm install
npm run build
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:8080`. On the first successful backend startup, Hibernate creates any missing entity tables inside the existing database. The password stays in the terminal environment and is not stored in project files.

## 11. Likely internship review questions (20)

**Q1: What problem does the project solve?**  
A: It records products, supplier details, stock by warehouse and purchase-order deliveries in one application.

**Q2: Which technologies did you use?**  
A: React and Vite for the browser UI, Java 21 and Spring Boot for the API, Spring Data JPA/Hibernate for persistence, and MySQL for permanent storage.

**Q3: What is the overall architecture?**  
A: React calls Spring REST controllers; controllers call services; services use repositories; repositories access MySQL through JPA/Hibernate.

**Q4: What is Spring Boot?**  
A: It is a Java framework that helps start a web application with sensible defaults and less manual configuration.

**Q5: What is JPA, and what is Hibernate?**  
A: JPA defines how Java objects map to database data. Hibernate is the JPA implementation used to generate and run SQL.

**Q6: What does a repository do?**  
A: It reads and writes entity records. Spring Data creates common database operations from the repository interface.

**Q7: Why have a service layer?**  
A: It keeps business rules, such as stock validation and purchase-order receiving, separate from HTTP routing and database access.

**Q8: What is a DTO?**  
A: A Data Transfer Object defines the JSON fields an API request accepts or a response returns, separately from database entities.

**Q9: How does React communicate with Spring Boot?**  
A: Page components call frontend service functions, which use Fetch to send JSON over HTTP. Vite proxies `/api` to the backend during development.

**Q10: What is a REST API?**  
A: It is an HTTP interface that represents application resources with URLs and uses methods such as GET, POST, PUT and DELETE.

**Q11: What do CRUD operations mean?**  
A: Create, Read, Update and Delete. For example, POST creates a product, GET lists it, PUT changes it, and DELETE removes it.

**Q12: How is a product connected to a supplier?**  
A: The product row has an optional supplier foreign key. Multiple products can use the same supplier.

**Q13: How can a product have stock at different locations?**  
A: Each product can have multiple stock records, each with a warehouse name, available amount and reserved amount.

**Q14: What information is saved in a purchase order item?**  
A: It references a product and preserves the ordered quantity and unit price for that order.

**Q15: What happens when an order is received?**  
A: The backend adds each line quantity to stock at the delivery warehouse, records movements and marks the order Received.

**Q16: Why use `@Transactional` for receiving an order?**  
A: It makes stock changes, movement records and the order status commit together or roll back together if an error occurs.

**Q17: How are dashboard numbers calculated?**  
A: The dashboard service queries persisted products, stock records, suppliers, orders and movements. It does not use fixed totals.

**Q18: How does the application prevent duplicate product SKUs?**  
A: The service checks for an existing SKU, and MySQL also enforces a unique constraint. A duplicate request returns a conflict response.

**Q19: What do common HTTP error codes mean?**  
A: `400` means invalid input, `404` means a record was not found, and `409` means the operation conflicts with existing data.

**Q20: What should be improved before a public production deployment?**  
A: Add authentication and authorization, use managed secrets, use database migrations, configure production CORS and add deployment monitoring and backups.

