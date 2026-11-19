-- ====================================================================
-- CRAVING CLOCK: ADVANCED DBMS OBJECTS SPECIFICATION
-- Tailored for Vishwakarma Institute of Technology (VIT Pune) DBMS Course Project
-- Views, Stored Procedures, Triggers, Concurrency Locks, Sharding & Semijoins
-- Compatible with MySQL 8.0+
-- ====================================================================

USE craving_clock_db;

-- ####################################################################
-- SECTION A: 4 STRUCTURAL DATABASE VIEWS
-- ####################################################################

-- 1. Live_Menu_Customer_View (Single Table Read-Only Abstraction)
-- Exposes active daily dishes with stock > 0 for students without leaking vendor private columns
CREATE OR REPLACE VIEW Live_Menu_Customer_View AS
SELECT 
    d.record_id, 
    d.item_id, 
    d.date, 
    d.meal_slot, 
    d.daily_price, 
    d.stock_qty, 
    d.special_note
FROM DAILY_AVAILABILITY d
WHERE d.date = CURDATE() 
  AND d.stock_qty > 0;

-- 2. Vendor_Performance_Summary_View (Multi-Table Aggregate Analytical View)
-- Joins VENDORS, ORDERS, PAYMENTS, and REVIEWS for mess owners and management analytics
CREATE OR REPLACE VIEW Vendor_Performance_Summary_View AS
SELECT 
    v.vendor_id,
    v.name AS vendor_name,
    v.area_zone,
    v.rating,
    v.is_open,
    COUNT(DISTINCT m.item_id) AS total_catalog_dishes,
    COUNT(DISTINCT o.order_id) AS total_orders_placed,
    COALESCE(SUM(CASE WHEN p.payment_status = 'Success' THEN p.amount ELSE 0 END), 0) AS gross_revenue_inr,
    COALESCE(ROUND(AVG(CASE WHEN p.payment_status = 'Success' THEN p.amount END), 2), 0) AS avg_order_value_inr,
    COUNT(DISTINCT r.review_id) AS review_count
FROM VENDORS v
LEFT JOIN MENU_ITEMS m ON v.vendor_id = m.vendor_id
LEFT JOIN ORDERS o ON v.vendor_id = o.vendor_id
LEFT JOIN PAYMENTS p ON o.order_id = p.order_id
LEFT JOIN REVIEWS r ON v.vendor_id = r.vendor_id
GROUP BY v.vendor_id, v.name, v.area_zone, v.rating, v.is_open;

-- 3. Tiffin_Delivery_Dispatch_View (Active Logistics Dispatch View)
-- Joins ORDERS, CUSTOMERS, VENDORS, DELIVERY_TRACKING, and DELIVERY_AGENTS
CREATE OR REPLACE VIEW Tiffin_Delivery_Dispatch_View AS
SELECT 
    t.track_id,
    o.order_id,
    c.name AS student_name,
    c.phone AS student_phone,
    c.address AS delivery_address,
    v.name AS mess_name,
    v.area_zone AS mess_zone,
    v.phone AS mess_phone,
    o.final_price,
    o.order_status,
    t.delivery_status,
    t.eta_minutes,
    a.name AS assigned_agent_name,
    a.phone AS agent_phone,
    p.payment_status,
    o.created_at AS order_time
FROM ORDERS o
JOIN CUSTOMERS c ON o.cust_id = c.cust_id
JOIN VENDORS v ON o.vendor_id = v.vendor_id
JOIN DELIVERY_TRACKING t ON o.order_id = t.order_id
LEFT JOIN DELIVERY_AGENTS a ON t.agent_id = a.agent_id
LEFT JOIN PAYMENTS p ON o.order_id = p.order_id
WHERE o.order_mode = 'Tiffin Delivery' 
  AND o.order_status NOT IN ('Completed', 'Cancelled');

-- 4. Dynamic_Pricing_Audit_View (Inventory Urgency & Dynamic Variance View)
-- Computes pricing surge percentage and plate inventory urgency
CREATE OR REPLACE VIEW Dynamic_Pricing_Audit_View AS
SELECT 
    d.record_id,
    v.vendor_id,
    v.name AS vendor_name,
    m.name AS dish_name,
    m.category,
    d.meal_slot,
    m.base_price,
    d.daily_price,
    (d.daily_price - m.base_price) AS price_delta,
    ROUND(((d.daily_price - m.base_price) / m.base_price) * 100, 1) AS surge_percentage,
    d.stock_qty,
    CASE 
        WHEN d.stock_qty = 0 THEN 'OUT_OF_STOCK'
        WHEN d.stock_qty <= 5 THEN 'CRITICAL_LAST_FEW'
        WHEN d.stock_qty <= 20 THEN 'MODERATE_FILLING_FAST'
        ELSE 'SURPLUS_HIGH_STOCK'
    END AS urgency_level,
    d.date
FROM DAILY_AVAILABILITY d
JOIN MENU_ITEMS m ON d.item_id = m.item_id
JOIN VENDORS v ON m.vendor_id = v.vendor_id
WHERE d.date = CURDATE();


-- ####################################################################
-- SECTION B: 4 STORED PROCEDURES (ACID, CURSORS & DYNAMIC CONTROL)
-- ####################################################################

DELIMITER $$

-- 1. sp_PlaceAtomicOrderWithStockDeduction
-- ACID Transaction with SELECT ... FOR UPDATE row-level lock guaranteeing ZERO overselling
DROP PROCEDURE IF EXISTS sp_PlaceAtomicOrderWithStockDeduction$$
CREATE PROCEDURE sp_PlaceAtomicOrderWithStockDeduction(
    IN p_cust_id INT,
    IN p_vendor_id INT,
    IN p_record_id INT,
    IN p_quantity INT,
    IN p_order_mode VARCHAR(30),
    IN p_promo_code VARCHAR(30),
    IN p_payment_method VARCHAR(30),
    OUT p_order_id INT,
    OUT p_status VARCHAR(50),
    OUT p_message VARCHAR(255)
)
proc_block: BEGIN
    DECLARE v_current_stock INT DEFAULT 0;
    DECLARE v_daily_price DECIMAL(8,2) DEFAULT 0.00;
    DECLARE v_raw_total DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_discount DECIMAL(8,2) DEFAULT 0.00;
    DECLARE v_min_order DECIMAL(8,2) DEFAULT 0.00;
    DECLARE v_final_price DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_assigned_agent INT DEFAULT NULL;
    DECLARE v_new_order_id INT DEFAULT 0;
    DECLARE v_new_pay_id INT DEFAULT 0;

    -- Error handler for rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'Transaction aborted due to SQL Exception. Rollback executed.';
        SET p_order_id = 0;
    END;

    -- START ATOMIC TRANSACTION
    START TRANSACTION;

    -- STEP 1: Acquire EXCLUSIVE ROW-LEVEL LOCK on target daily dish
    SELECT stock_qty, daily_price 
    INTO v_current_stock, v_daily_price
    FROM DAILY_AVAILABILITY
    WHERE record_id = p_record_id
    FOR UPDATE;

    -- Validate record exists
    IF v_daily_price = 0.00 AND v_current_stock = 0 THEN
        ROLLBACK;
        SET p_status = 'NOT_FOUND';
        SET p_message = 'Menu item availability record not found for today.';
        LEAVE proc_block;
    END IF;

    -- STEP 2: Concurrency check for plate stock
    IF v_current_stock < p_quantity THEN
        ROLLBACK;
        SET p_status = 'OUT_OF_STOCK';
        SET p_message = CONCAT('Insufficient plates! Only ', v_current_stock, ' remaining.');
        LEAVE proc_block;
    END IF;

    -- STEP 3: Calculate pricing & check promo code
    SET v_raw_total = v_daily_price * p_quantity;

    IF p_promo_code IS NOT NULL AND TRIM(p_promo_code) <> '' THEN
        SELECT discount_amount, min_order 
        INTO v_discount, v_min_order
        FROM PROMOTIONS
        WHERE code = TRIM(p_promo_code) 
          AND vendor_id = p_vendor_id 
          AND is_active = TRUE;

        IF v_discount > 0.00 AND v_raw_total >= v_min_order THEN
            SET v_final_price = GREATEST(1.00, v_raw_total - v_discount);
        ELSE
            SET v_final_price = v_raw_total;
        END IF;
    ELSE
        SET v_final_price = v_raw_total;
    END IF;

    -- STEP 4: Deduct plate stock
    UPDATE DAILY_AVAILABILITY
    SET stock_qty = stock_qty - p_quantity
    WHERE record_id = p_record_id;

    -- STEP 5: Insert order record
    INSERT INTO ORDERS (cust_id, vendor_id, order_mode, final_price, order_status)
    VALUES (p_cust_id, p_vendor_id, p_order_mode, v_final_price, 'Confirmed');
    SET v_new_order_id = LAST_INSERT_ID();
    SET p_order_id = v_new_order_id;

    -- STEP 6: Insert order details
    INSERT INTO ORDER_DETAILS (order_id, record_id, quantity, unit_price)
    VALUES (v_new_order_id, p_record_id, p_quantity, v_daily_price);

    -- STEP 7: Insert payment record
    INSERT INTO PAYMENTS (order_id, amount, payment_method, payment_status)
    VALUES (v_new_order_id, v_final_price, p_payment_method, 'Success');
    SET v_new_pay_id = LAST_INSERT_ID();

    -- STEP 8: Dispatch Delivery Tracking if Tiffin Delivery
    IF p_order_mode = 'Tiffin Delivery' THEN
        SELECT agent_id INTO v_assigned_agent 
        FROM DELIVERY_AGENTS 
        WHERE is_available = TRUE 
        LIMIT 1;

        IF v_assigned_agent IS NOT NULL THEN
            UPDATE DELIVERY_AGENTS SET is_available = FALSE WHERE agent_id = v_assigned_agent;
        END IF;

        INSERT INTO DELIVERY_TRACKING (order_id, agent_id, payment_id, delivery_status, eta_minutes)
        VALUES (v_new_order_id, v_assigned_agent, v_new_pay_id, 'Assigned', 18);
    END IF;

    -- COMMIT ATOMIC TRANSACTION
    COMMIT;
    SET p_status = 'SUCCESS';
    SET p_message = CONCAT('Order #', v_new_order_id, ' confirmed successfully! Remaining stock: ', (v_current_stock - p_quantity));
END proc_block$$


-- 2. sp_VendorBatchDynamicPriceAdjust
-- Batch adjusts dynamic prices based on peak meal surge or critical inventory shortage
DROP PROCEDURE IF EXISTS sp_VendorBatchDynamicPriceAdjust$$
CREATE PROCEDURE sp_VendorBatchDynamicPriceAdjust(
    IN p_vendor_id INT,
    IN p_meal_slot VARCHAR(20),
    IN p_surge_factor DECIMAL(5,2),
    IN p_min_stock_threshold INT,
    OUT p_updated_count INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_rec_id INT;
    DECLARE v_curr_price DECIMAL(8,2);
    DECLARE v_base_price DECIMAL(8,2);
    DECLARE v_new_price DECIMAL(8,2);
    DECLARE v_count INT DEFAULT 0;

    -- Cursor to iterate through dishes for this vendor in this slot
    DECLARE cur_items CURSOR FOR
        SELECT d.record_id, d.daily_price, m.base_price
        FROM DAILY_AVAILABILITY d
        JOIN MENU_ITEMS m ON d.item_id = m.item_id
        WHERE m.vendor_id = p_vendor_id
          AND d.date = CURDATE()
          AND (p_meal_slot = 'ALL' OR d.meal_slot = p_meal_slot)
          AND d.stock_qty <= p_min_stock_threshold;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur_items;

    read_loop: LOOP
        FETCH cur_items INTO v_rec_id, v_curr_price, v_base_price;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Apply surge with bounded ceiling (never exceed 2.0x base price, never drop below 0.5x base price)
        SET v_new_price = ROUND(v_curr_price * (1 + (p_surge_factor / 100)), 2);
        IF v_new_price > (v_base_price * 2.0) THEN
            SET v_new_price = ROUND(v_base_price * 2.0, 2);
        END IF;
        IF v_new_price < (v_base_price * 0.5) THEN
            SET v_new_price = ROUND(v_base_price * 0.5, 2);
        END IF;

        UPDATE DAILY_AVAILABILITY 
        SET daily_price = v_new_price,
            special_note = CONCAT('Dynamic Surge Active (+', p_surge_factor, '%)')
        WHERE record_id = v_rec_id;

        SET v_count = v_count + 1;
    END LOOP;

    CLOSE cur_items;
    SET p_updated_count = v_count;
END$$


-- 3. sp_CalculateStudentLoyaltyAndTier
-- Evaluates student order history, spend, assigns VIT Mess Club Tier and returns promo eligibility
DROP PROCEDURE IF EXISTS sp_CalculateStudentLoyaltyAndTier$$
CREATE PROCEDURE sp_CalculateStudentLoyaltyAndTier(
    IN p_cust_id INT,
    OUT p_tier VARCHAR(20),
    OUT p_total_spend DECIMAL(10,2),
    OUT p_eligible_discount DECIMAL(5,2)
)
BEGIN
    DECLARE v_pts INT DEFAULT 0;
    DECLARE v_spend DECIMAL(10,2) DEFAULT 0.00;

    SELECT loyalty_points INTO v_pts
    FROM CUSTOMERS
    WHERE cust_id = p_cust_id;

    SELECT COALESCE(SUM(final_price), 0.00) INTO v_spend
    FROM ORDERS
    WHERE cust_id = p_cust_id AND order_status IN ('Confirmed', 'Completed');

    IF v_pts >= 500 OR v_spend >= 2500 THEN
        SET p_tier = 'PLATINUM';
        SET p_eligible_discount = 25.00;
    ELSEIF v_pts >= 200 OR v_spend >= 1000 THEN
        SET p_tier = 'GOLD';
        SET p_eligible_discount = 15.00;
    ELSEIF v_pts >= 50 OR v_spend >= 300 THEN
        SET p_tier = 'SILVER';
        SET p_eligible_discount = 10.00;
    ELSE
        SET p_tier = 'BRONZE';
        SET p_eligible_discount = 5.00;
    END IF;

    SET p_total_spend = v_spend;
END$$


-- 4. sp_VendorDailyEndMealFlashSale
-- End-of-meal clearance procedure to prevent food waste (applies flash discount)
DROP PROCEDURE IF EXISTS sp_VendorDailyEndMealFlashSale$$
CREATE PROCEDURE sp_VendorDailyEndMealFlashSale(
    IN p_vendor_id INT,
    IN p_meal_slot VARCHAR(20),
    IN p_discount_percent DECIMAL(5,2),
    OUT p_items_discounted INT
)
BEGIN
    DECLARE v_affected INT DEFAULT 0;

    UPDATE DAILY_AVAILABILITY d
    JOIN MENU_ITEMS m ON d.item_id = m.item_id
    SET d.daily_price = ROUND(d.daily_price * (1 - (p_discount_percent / 100.0)), 2),
        d.special_note = CONCAT('[FLASH SALE ', p_discount_percent, '% OFF] End-of-meal clearance!')
    WHERE m.vendor_id = p_vendor_id
      AND d.date = CURDATE()
      AND d.meal_slot = p_meal_slot
      AND d.stock_qty > 0;

    SET v_affected = ROW_COUNT();
    SET p_items_discounted = v_affected;
END$$

DELIMITER ;


-- ####################################################################
-- SECTION C: 7 AUTOMATED DATABASE TRIGGERS
-- ####################################################################

DELIMITER $$

-- 1. trg_vendor_after_insert_audit
-- Audit trail: logs new vendor onboarding into vendor_audit
DROP TRIGGER IF EXISTS trg_vendor_after_insert_audit$$
CREATE TRIGGER trg_vendor_after_insert_audit
AFTER INSERT ON VENDORS
FOR EACH ROW
BEGIN
    INSERT INTO vendor_audit (vendor_id, action_type, vendor_name, logged_at)
    VALUES (NEW.vendor_id, 'INSERT', NEW.name, NOW());
END$$

-- 2. trg_vendor_after_update_city_trace
-- Audit trail: tracks any change in vendor city/location
DROP TRIGGER IF EXISTS trg_vendor_after_update_city_trace$$
CREATE TRIGGER trg_vendor_after_update_city_trace
AFTER UPDATE ON VENDORS
FOR EACH ROW
BEGIN
    IF OLD.city <> NEW.city THEN
        INSERT INTO vendor_city_trace (vendor_id, old_city, new_city, changed_at)
        VALUES (NEW.vendor_id, OLD.city, NEW.city, NOW());
    END IF;
END$$

-- 3. trg_vendor_before_delete_cold_retention
-- Retention trail: archives vendor details to cold retention before deletion
DROP TRIGGER IF EXISTS trg_vendor_before_delete_cold_retention$$
CREATE TRIGGER trg_vendor_before_delete_cold_retention
BEFORE DELETE ON VENDORS
FOR EACH ROW
BEGIN
    INSERT INTO vendor_cold_retention_log (vendor_id, name, phone, city, deleted_at)
    VALUES (OLD.vendor_id, OLD.name, OLD.phone, OLD.city, NOW());
END$$

-- 4. trg_prevent_negative_stock
-- Integrity Guard: Rejects transactions attempting to set stock < 0 with SQLSTATE '45000'
DROP TRIGGER IF EXISTS trg_prevent_negative_stock$$
CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE ON DAILY_AVAILABILITY
FOR EACH ROW
BEGIN
    IF NEW.stock_qty < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Daily plate stock quantity cannot be negative.';
    END IF;
END$$

-- 5. trg_auto_update_vendor_rating
-- Dynamic Aggregate: Automatically updates VENDORS.rating on every new review
DROP TRIGGER IF EXISTS trg_auto_update_vendor_rating$$
CREATE TRIGGER trg_auto_update_vendor_rating
AFTER INSERT ON REVIEWS
FOR EACH ROW
BEGIN
    DECLARE v_new_avg DECIMAL(3,2);
    
    SELECT ROUND(AVG(rating), 2) INTO v_new_avg
    FROM REVIEWS
    WHERE vendor_id = NEW.vendor_id;

    UPDATE VENDORS
    SET rating = v_new_avg
    WHERE vendor_id = NEW.vendor_id;
END$$

-- 6. trg_award_student_loyalty
-- Business Rule: Automatically awards 1 loyalty point per 20 INR spent on confirmed orders
DROP TRIGGER IF EXISTS trg_award_student_loyalty$$
CREATE TRIGGER trg_award_student_loyalty
AFTER INSERT ON ORDERS
FOR EACH ROW
BEGIN
    IF NEW.order_status = 'Confirmed' THEN
        UPDATE CUSTOMERS
        SET loyalty_points = loyalty_points + FLOOR(NEW.final_price / 20)
        WHERE cust_id = NEW.cust_id;
    END IF;
END$$

-- 7. trg_delivery_auto_assign_completion
-- Workflow Automation: Upon delivery completion, sets order status to Completed and frees agent
DROP TRIGGER IF EXISTS trg_delivery_auto_assign_completion$$
CREATE TRIGGER trg_delivery_auto_assign_completion
AFTER UPDATE ON DELIVERY_TRACKING
FOR EACH ROW
BEGIN
    IF NEW.delivery_status = 'Delivered' AND OLD.delivery_status <> 'Delivered' THEN
        UPDATE ORDERS
        SET order_status = 'Completed'
        WHERE order_id = NEW.order_id;

        IF NEW.agent_id IS NOT NULL THEN
            UPDATE DELIVERY_AGENTS
            SET is_available = TRUE
            WHERE agent_id = NEW.agent_id;
        END IF;
    END IF;
END$$

DELIMITER ;


-- ####################################################################
-- SECTION D: ADVANCED SEMIJOIN & ANTI-SEMIJOIN QUERIES
-- Demonstrating Loose Scan / FirstMatch Query Plan Optimizations
-- ####################################################################

-- 1. SEMIJOIN (EXISTS subquery optimization):
-- "Retrieve all VIT Campus Messes that have active inventory available for today's Lunch"
-- Eliminates duplicate vendor rows without expensive GROUP BY or DISTINCT
SELECT v.vendor_id, v.name, v.area_zone, v.rating
FROM VENDORS v
WHERE EXISTS (
    SELECT 1 
    FROM MENU_ITEMS m
    JOIN DAILY_AVAILABILITY d ON m.item_id = d.item_id
    WHERE m.vendor_id = v.vendor_id
      AND d.date = CURDATE()
      AND d.meal_slot = 'Lunch'
      AND d.stock_qty > 0
);

-- 2. ANTI-SEMIJOIN (NOT EXISTS subquery optimization):
-- "Retrieve all registered students who have never placed an order (Dormant Customer Identification)"
-- Superior execution plan compared to `LEFT JOIN ... WHERE order_id IS NULL`
SELECT c.cust_id, c.regd_no, c.name, c.course, c.phone
FROM CUSTOMERS c
WHERE NOT EXISTS (
    SELECT 1 
    FROM ORDERS o 
    WHERE o.cust_id = c.cust_id
);


-- ####################################################################
-- SECTION E: HORIZONTAL SHARDING / PARTITIONING BLUEPRINT
-- Campus Zone Partitioning on VENDORS and DAILY_AVAILABILITY
-- ####################################################################

-- In high-throughput distributed campus deployments, VENDORS and DAILY_AVAILABILITY 
-- can be partition-pruned horizontally by `area_zone` or hash of `vendor_id`:
/*
ALTER TABLE VENDORS PARTITION BY LIST COLUMNS(area_zone) (
    PARTITION p_bibwewadi VALUES IN ('Bibwewadi'),       -- Shard A: VIT Main Campus
    PARTITION p_kondhwa VALUES IN ('Kondhwa'),           -- Shard B: VIT Upper Campus
    PARTITION p_indira_nagar VALUES IN ('Upper Indira Nagar'), -- Shard C: Student Hostels
    PARTITION p_katraj VALUES IN ('Katraj')              -- Shard D: Transit Corridor
);
*/
