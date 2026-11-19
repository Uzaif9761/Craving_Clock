# 🍛 Craving Clock — Campus Mess Real-Time DBMS & 3D Interactive Web App

> **Course Project:** Database Management Systems (DBMS)  
> **Target Ecosystem:** Vishwakarma Institute of Technology (VIT Pune) — Bibwewadi & Kondhwa Campuses  
> **Tech Stack:** React 19, TypeScript, Three.js (WebGL 3D), Tailwind CSS, Lucide Icons, MySQL 8.0+ EER Schema & Relational Engine

---

## 🎯 Executive Summary & Problem Solved
University students in Pune visit local campus messes daily without knowing what is being served or if plates have sold out, causing crowding, roaming, and unpredictable food expenses. **Craving Clock** solves this problem by enforcing a strict architectural separation between permanent dish catalogs (`MENU_ITEMS`) and dynamic daily availability, prices, and live plate stock (`DAILY_AVAILABILITY`):
1. **Students (Customers):** Explore nearby messes in an interactive 3D WebGL culinary scene, track live plate stock countdowns, compare dynamic prices, apply promo codes (`VITIAN20`, `EXAMFEAST`), book plates/tiffin deliveries with zero over-ordering guarantees, and submit reviews.
2. **Mess Owners (Vendors):** Manage today's live menu, dynamically adjust prices (peak surge or flash clearance), adjust plate stock live, and process student token queues.
3. **DBMS Evaluators & Professors:** Built-in **"Live DBMS Architecture & SQL Telemetry Inspector"** with real-time logging, 4 structural views, 4 stored procedures, 7 automated triggers, atomic row-lock concurrency simulations, campus horizontal sharding, and semijoin optimizers.

---

## 🗄️ Relational Database Architecture (10 EER Tables + 3 Audit Tables)

The complete SQL scripts are located in `/database/`:
- [`/database/schema.sql`](file:///e:/DBMS%20CP/database/schema.sql): Complete DDL for all 10 entities and 3 audit tables.
- [`/database/dbms_objects.sql`](file:///e:/DBMS%20CP/database/dbms_objects.sql): 4 Views, 4 Stored Procedures, 7 Triggers, ACID Row Locks, Sharding, and Semijoins.
- [`/database/seed_data.sql`](file:///e:/DBMS%20CP/database/seed_data.sql): Realistic seed dataset with authentic VIT Pune campus messes (*Annapurna Mess Bibwewadi*, *Sai Krupa Dining Hall*, *Maharaja Thali Kitchen*, *Kondhwa Campus Rasoi*, *Indira Nagar Home Mess*, *Katraj Lake Bhojanalaya*).

### 10 Core Relational Tables
1. **`VENDORS`**: Mess owner identity, phone, zone (`Bibwewadi`, `Upper Indira Nagar`, `Kondhwa`, `Katraj`), rating, open status.
2. **`PROMOTIONS`**: Vendor-specific promo codes (`VITIAN20`, `SAI30`), discount amount, minimum order threshold.
3. **`MENU_ITEMS`**: Permanent dish catalog, category (`Thali`, `Main Course`, `Snacks`, `Beverages`, `Special`), base price, veg/non-veg flag.
4. **`DAILY_AVAILABILITY`**: Dynamic daily menu, meal slot (`Breakfast`, `Lunch`, `Snacks`, `Dinner`), dynamic price, live plate stock (`stock_qty >= 0`), special notes.
5. **`CUSTOMERS`**: Student registration (`regd_no` e.g., `VIT-AIML-D-13`), name, course, address, loyalty points.
6. **`REVIEWS`**: 1:N student ratings and comments. Automatically triggers recalculation of mess rating.
7. **`ORDERS`**: Customer orders with `order_mode` (`Dine-In Token`, `Tiffin Delivery`), final settled price, and status steps.
8. **`ORDER_DETAILS`**: Line-item breakdown linking orders to `DAILY_AVAILABILITY` records with unit price.
9. **`PAYMENTS`**: Settlement records via UPI, Campus Wallet, Cash at Mess, or Card.
10. **`DELIVERY_AGENTS` & `DELIVERY_TRACKING`**: Campus logistics tracking with assigned agent, ETA in minutes, and delivery workflow.
11. **Audit & Retention Tables**:
    - `vendor_audit`: Logs `INSERT` actions upon new vendor registration.
    - `vendor_city_trace`: Tracks `UPDATE` relocations of mess locations.
    - `vendor_cold_retention_log`: Preserves deleted vendor profiles for compliance before `DELETE`.

---

## 🔬 Advanced DBMS Objects

### A. 4 Structural Database Views
1. **`Live_Menu_Customer_View`**: Single-table read-only abstraction providing active daily dishes for `CURDATE()` with `stock_qty > 0`. Shields private vendor profit margins.
2. **`Vendor_Performance_Summary_View`**: Multi-table analytical aggregate view joining `VENDORS`, `ORDERS`, `PAYMENTS`, and `REVIEWS` to compute gross revenue, average ticket size, and review volume.
3. **`Tiffin_Delivery_Dispatch_View`**: 5-table active logistics join view (`ORDERS`, `CUSTOMERS`, `VENDORS`, `DELIVERY_TRACKING`, `DELIVERY_AGENTS`) tracking live student tiffin deliveries.
4. **`Dynamic_Pricing_Audit_View`**: Computes price deltas (`daily_price - base_price`), surge percentages, and categorizes plate inventory into urgency tiers (`CRITICAL_LAST_FEW`, `MODERATE_FILLING_FAST`, `SURPLUS_HIGH_STOCK`).

### B. 4 Stored Procedures
1. **`sp_PlaceAtomicOrderWithStockDeduction`**: ACID transaction with exclusive row-level locking (`SELECT ... FOR UPDATE`). Checks stock availability, prevents overselling with automatic rollback, validates promo codes, deducts stock, creates order and payment records, and awards loyalty points.
2. **`sp_VendorBatchDynamicPriceAdjust`**: Dynamic pricing cursor that batch-adjusts prices for dishes facing high demand or shortage, enforcing strict bounding ceilings (0.5x to 2.0x base price).
3. **`sp_CalculateStudentLoyaltyAndTier`**: Evaluates student lifetime spend and loyalty points, assigning tiers (`PLATINUM`, `GOLD`, `SILVER`, `BRONZE`) and calculating eligible discounts.
4. **`sp_VendorDailyEndMealFlashSale`**: End-of-meal inventory clearance procedure applying flash discounts to remaining plates before kitchen closing time to eliminate campus food waste.

### C. 7 Automated Database Triggers
1. `trg_vendor_after_insert_audit`: Logs onboarding to `vendor_audit`.
2. `trg_vendor_after_update_city_trace`: Tracks location changes in `vendor_city_trace`.
3. `trg_vendor_before_delete_cold_retention`: Archives vendor details to `vendor_cold_retention_log` before removal.
4. `trg_prevent_negative_stock`: Enforces integrity constraint `stock_qty >= 0` with `SIGNAL SQLSTATE '45000'`.
5. `trg_auto_update_vendor_rating`: Dynamically recalculates `VENDORS.rating` via `AVG(rating)` on new review insertion.
6. `trg_award_student_loyalty`: Automatically credits 1 loyalty point per ₹20 spent on confirmed orders.
7. `trg_delivery_auto_assign_completion`: Sets order status to `Completed` and frees the delivery partner when marked `Delivered`.

### D. Concurrency, Sharding & Semijoins
- **Pessimistic Concurrency (Row-Level Locking):** Demonstrates `SELECT ... FOR UPDATE` row locks preventing dirty reads, race conditions, and overselling between concurrent student requests.
- **Horizontal Campus Sharding:** Partitions mess data across 4 campus zones (`Bibwewadi`, `Upper Indira Nagar`, `Kondhwa`, `Katraj`) demonstrating partition pruning with up to 75% I/O reduction.
- **Vertical Schema Decomposition:** Decomposes `CUSTOMERS` into `Customer_Core_Identity` (in-memory auth cache) and `Customer_Profile_Extended` (cold relational storage).
- **Semijoin (`EXISTS`) & Anti-Semijoin (`NOT EXISTS`):** Implements FirstMatch / LooseScan optimizer strategies to retrieve active vendors without `DISTINCT` temporary table allocations and detect dormant student accounts.

---

## 🚀 Quickstart & Evaluation Guide

### 1. Install & Run Locally
```bash
# Clone and enter directory
cd "e:\DBMS CP"

# Start interactive 3D Web Application & Relational Engine
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

### 2. Live Roles & Evaluation Walkthrough
- **Student Explorer View:**
  - Tilt cursor on the 3D Indian Thali hero scene to inspect katoris, rice mound, and steam particles.
  - Select meal window (**Breakfast**, **Lunch**, **Snacks**, **Dinner**) to rotate the 3D camera.
  - Browse messes in Bibwewadi or Kondhwa; watch dynamic price tickers and urgency plate badges.
  - Click **"Book Plate / Tiffin"** -> Apply promo `VITIAN20` -> Confirm order with ACID row-lock and confetti!
  - Click student loyalty badge in the navbar to inspect Aarav's digital smart card and tier calculations.
- **Mess Owner Command Center:**
  - Switch to Mess Owner view from the top switcher.
  - Adjust daily plate prices or click `+` / `-` on stock quantity. Try deducting below 0 to witness `trg_prevent_negative_stock` trigger rejection in real time!
  - Click **"Batch Dynamic Surge"** or **"End-of-Meal Clearance"** to execute stored procedures.
  - Advance orders in the live kitchen token queue.
- **DBMS Lab Evaluator Inspector:**
  - Click **"DBMS Inspector"** or **"SQL Logs"** to open the telemetry drawer.
  - Test all 4 views, execute all 4 stored procedures with custom parameters, fire the 7 automated triggers, launch the 2-thread concurrent race simulation, and analyze semijoin query plans!
