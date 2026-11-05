# Microservices Demo — Order Management System

A mini Spring Boot microservices project that demonstrates inter-service REST communication.

## Architecture

```
Client
  │
  ├──► User Service    (port 8081)  — CRUD for users
  ├──► Product Service (port 8082)  — CRUD for products
  └──► Order Service   (port 8083)  — places orders by calling User & Product services
```

```
Order Service
    │
    ├─ GET http://localhost:8081/api/users/{id}     (validates user)
    └─ GET http://localhost:8082/api/products/{id}  (validates product + gets price)
```

Each service uses its own **H2 in-memory database** (no shared DB — true microservice isolation).

---

## How to Run

Open **3 separate terminals** and start each service:

```bash
# Terminal 1 — User Service
cd user-service
mvn spring-boot:run

# Terminal 2 — Product Service
cd product-service
mvn spring-boot:run

# Terminal 3 — Order Service
cd order-service
mvn spring-boot:run
```

---

## Quick Test (curl / Postman)

### 1. Create a User
```http
POST http://localhost:8081/api/users
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "9876543210"
}
```

### 2. Create a Product
```http
POST http://localhost:8082/api/products
Content-Type: application/json

{
  "name": "Laptop",
  "description": "Gaming Laptop",
  "price": 75000.00,
  "stock": 10
}
```

### 3. Place an Order (calls User & Product services internally)
```http
POST http://localhost:8083/api/orders
Content-Type: application/json

{
  "userId": 1,
  "productId": 1,
  "quantity": 2
}
```

Response includes merged data from all three services:
```json
{
  "orderId": 1,
  "status": "PLACED",
  "createdAt": "2026-10-10T09:53:00",
  "userId": 1,
  "userName": "Alice",
  "userEmail": "alice@example.com",
  "productId": 1,
  "productName": "Laptop",
  "productPrice": 75000.0,
  "quantity": 2,
  "totalAmount": 150000.0
}
```

### 4. Update Order Status
```http
PATCH http://localhost:8083/api/orders/1/status
Content-Type: application/json

{ "status": "CONFIRMED" }
```

### 5. Get Orders by User
```http
GET http://localhost:8083/api/orders/user/1
```

---

## H2 Console (dev)

| Service         | URL                                    |
|-----------------|----------------------------------------|
| User Service    | http://localhost:8081/h2-console       |
| Product Service | http://localhost:8082/h2-console       |
| Order Service   | http://localhost:8083/h2-console       |

JDBC URL: as configured in `application.properties` (e.g. `jdbc:h2:mem:userdb`)

---

## Project Structure

```
microservices-demo/
├── user-service/
│   └── src/main/java/com/demo/userservice/
│       ├── UserServiceApplication.java
│       ├── User.java
│       ├── UserRepository.java
│       ├── UserService.java
│       └── UserController.java
│
├── product-service/
│   └── src/main/java/com/demo/productservice/
│       ├── ProductServiceApplication.java
│       ├── Product.java
│       ├── ProductRepository.java
│       ├── ProductService.java
│       └── ProductController.java
│
└── order-service/
    └── src/main/java/com/demo/orderservice/
        ├── OrderServiceApplication.java   ← defines RestTemplate bean
        ├── Order.java
        ├── OrderStatus.java
        ├── OrderRequest.java
        ├── OrderResponse.java
        ├── UserDto.java
        ├── ProductDto.java
        ├── OrderRepository.java
        ├── OrderService.java              ← calls User & Product services
        ├── OrderController.java
        └── GlobalExceptionHandler.java
```
