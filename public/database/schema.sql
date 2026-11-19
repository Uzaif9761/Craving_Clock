-- ====================================================================
-- CRAVING CLOCK: CAMPUS MESS REAL-TIME DBMS
-- Tailored for Vishwakarma Institute of Technology (VIT Pune) Ecosystem
-- Database Schema Definition (EER Relational Blueprint)
-- Compatible with MySQL 8.0+ / MariaDB / PostgreSQL
-- ====================================================================

DROP DATABASE IF EXISTS craving_clock_db;
CREATE DATABASE craving_clock_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE craving_clock_db;

-- --------------------------------------------------------------------
-- 1. VENDORS (Messes / Mess Owners around VIT Pune)
-- --------------------------------------------------------------------
CREATE TABLE VENDORS (
    vendor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    city VARCHAR(60) NOT NULL DEFAULT 'Pune',
    area_zone VARCHAR(80) NOT NULL COMMENT 'e.g., Bibwewadi, Upper Indira Nagar, Kondhwa, Katraj',
    rating DECIMAL(3,2) DEFAULT 4.50 CHECK (rating >= 0.00 AND rating <= 5.00),
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vendor_zone (area_zone),
    INDEX idx_vendor_status (is_open)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 2. PROMOTIONS (1:N from VENDORS)
-- --------------------------------------------------------------------
CREATE TABLE PROMOTIONS (
    promo_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    discount_amount DECIMAL(8,2) NOT NULL DEFAULT 20.00,
    min_order DECIMAL(8,2) NOT NULL DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id) ON DELETE CASCADE,
    INDEX idx_promo_code (code, is_active)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 3. MENU_ITEMS (Permanent Dish Catalog — 1:N from VENDORS)
-- --------------------------------------------------------------------
CREATE TABLE MENU_ITEMS (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    category ENUM('Thali', 'Main Course', 'Snacks', 'Beverages', 'Special') NOT NULL,
    is_veg BOOLEAN DEFAULT TRUE,
    base_price DECIMAL(8,2) NOT NULL,
    description TEXT,
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id) ON DELETE CASCADE,
    INDEX idx_menu_vendor (vendor_id),
    INDEX idx_menu_category (category)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 4. DAILY_AVAILABILITY (Dynamic Daily Menu, Dynamic Price & Live Stock — 1:N from MENU_ITEMS)
-- --------------------------------------------------------------------
CREATE TABLE DAILY_AVAILABILITY (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    date DATE NOT NULL DEFAULT (CURRENT_DATE),
    meal_slot ENUM('Breakfast', 'Lunch', 'Snacks', 'Dinner') NOT NULL DEFAULT 'Lunch',
    daily_price DECIMAL(8,2) NOT NULL CHECK (daily_price > 0),
    stock_qty INT NOT NULL CHECK (stock_qty >= 0),
    special_note VARCHAR(160) COMMENT 'e.g., Includes Unlimited Chapati & Solkadhi today!',
    UNIQUE KEY uniq_item_date_slot (item_id, date, meal_slot),
    FOREIGN KEY (item_id) REFERENCES MENU_ITEMS(item_id) ON DELETE CASCADE,
    INDEX idx_daily_slot_date (date, meal_slot),
    INDEX idx_daily_stock (stock_qty)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 5. CUSTOMERS (Students)
-- --------------------------------------------------------------------
CREATE TABLE CUSTOMERS (
    cust_id INT PRIMARY KEY AUTO_INCREMENT,
    regd_no VARCHAR(30) UNIQUE COMMENT 'e.g., VIT-AIML-D-13',
    name VARCHAR(120) NOT NULL,
    contact VARCHAR(120),
    phone VARCHAR(15) NOT NULL UNIQUE,
    course VARCHAR(60) DEFAULT 'B.Tech AIML',
    address TEXT,
    city VARCHAR(60) DEFAULT 'Pune',
    loyalty_points INT DEFAULT 0,
    state ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    INDEX idx_cust_regd (regd_no),
    INDEX idx_cust_phone (phone)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 6. REVIEWS (1:N from CUSTOMERS and VENDORS)
-- --------------------------------------------------------------------
CREATE TABLE REVIEWS (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    vendor_id INT NOT NULL,
    rating DECIMAL(3,2) NOT NULL CHECK (rating BETWEEN 1.00 AND 5.00),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(cust_id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id) ON DELETE CASCADE,
    INDEX idx_review_vendor (vendor_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 7. ORDERS (1:N from CUSTOMERS and VENDORS)
-- --------------------------------------------------------------------
CREATE TABLE ORDERS (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    cust_id INT NOT NULL,
    vendor_id INT NOT NULL,
    order_mode ENUM('Dine-In Token', 'Tiffin Delivery') DEFAULT 'Dine-In Token',
    final_price DECIMAL(10,2) NOT NULL,
    order_status ENUM('Confirmed', 'Preparing', 'Out for Delivery', 'Completed', 'Cancelled') DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cust_id) REFERENCES CUSTOMERS(cust_id) ON DELETE RESTRICT,
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id) ON DELETE RESTRICT,
    INDEX idx_order_cust (cust_id),
    INDEX idx_order_status (order_status),
    INDEX idx_order_date (created_at)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 8. ORDER_DETAILS (1:N from ORDERS and DAILY_AVAILABILITY)
-- --------------------------------------------------------------------
CREATE TABLE ORDER_DETAILS (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    record_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES DAILY_AVAILABILITY(record_id) ON DELETE RESTRICT,
    INDEX idx_detail_order (order_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 9. PAYMENTS (1:1 / 1:N linked to ORDERS)
-- --------------------------------------------------------------------
CREATE TABLE PAYMENTS (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('UPI', 'Campus Wallet', 'Cash at Mess', 'Card') DEFAULT 'UPI',
    payment_status ENUM('Success', 'Pending', 'Failed') DEFAULT 'Success',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    INDEX idx_pay_order (order_id),
    INDEX idx_pay_status (payment_status)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 10. DELIVERY_AGENTS & DELIVERY_TRACKING
-- --------------------------------------------------------------------
CREATE TABLE DELIVERY_AGENTS (
    agent_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    INDEX idx_agent_avail (is_available)
) ENGINE=InnoDB;

CREATE TABLE DELIVERY_TRACKING (
    track_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    agent_id INT NULL,
    payment_id INT NULL,
    delivery_status VARCHAR(60) DEFAULT 'Assigned',
    eta_minutes INT DEFAULT 18,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES DELIVERY_AGENTS(agent_id) ON DELETE SET NULL,
    FOREIGN KEY (payment_id) REFERENCES PAYMENTS(payment_id) ON DELETE SET NULL,
    INDEX idx_tracking_order (order_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 11. AUDIT & COLD RETENTION LOG TABLES (Trigger Targets)
-- --------------------------------------------------------------------
CREATE TABLE vendor_audit (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT,
    action_type VARCHAR(50) NOT NULL COMMENT 'INSERT, UPDATE, or DELETE',
    vendor_name VARCHAR(120),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE vendor_city_trace (
    trace_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT,
    old_city VARCHAR(60),
    new_city VARCHAR(60),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE vendor_cold_retention_log (
    archive_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT,
    name VARCHAR(120),
    phone VARCHAR(15),
    city VARCHAR(60),
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
