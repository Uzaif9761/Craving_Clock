-- ====================================================================
-- CRAVING CLOCK: COMPREHENSIVE SEED DATA
-- Tailored for Vishwakarma Institute of Technology (VIT Pune) Ecosystem
-- Realistic Messes, Permanent Menus, Dynamic Daily Inventories & Orders
-- ====================================================================

USE craving_clock_db;

-- --------------------------------------------------------------------
-- 1. SEED VENDORS (Real/Iconic Messes near VIT Pune Campuses)
-- --------------------------------------------------------------------
INSERT INTO VENDORS (vendor_id, name, phone, city, area_zone, rating, is_open) VALUES
(1, 'Annapurna Mess Bibwewadi', '9822011221', 'Pune', 'Bibwewadi', 4.85, TRUE),
(2, 'Sai Krupa Dining Hall', '9822033442', 'Pune', 'Bibwewadi', 4.65, TRUE),
(3, 'Maharaja Special Thali Kitchen', '9890123456', 'Pune', 'Upper Indira Nagar', 4.70, TRUE),
(4, 'Kondhwa Campus Rasoi', '9765432100', 'Pune', 'Kondhwa', 4.55, TRUE),
(5, 'Indira Nagar Home Mess', '9823456789', 'Pune', 'Upper Indira Nagar', 4.40, TRUE),
(6, 'Katraj Lake Student Bhojanalaya', '9822987654', 'Pune', 'Katraj', 4.30, TRUE);

-- --------------------------------------------------------------------
-- 2. SEED PROMOTIONS
-- --------------------------------------------------------------------
INSERT INTO PROMOTIONS (promo_id, vendor_id, code, discount_amount, min_order, is_active) VALUES
(1, 1, 'VITIAN20', 20.00, 100.00, TRUE),
(2, 2, 'SAI30', 30.00, 150.00, TRUE),
(3, 3, 'EXAMFEAST', 40.00, 200.00, TRUE),
(4, 4, 'KONDHWA15', 15.00, 80.00, TRUE),
(5, 5, 'MASTERTUTOR', 25.00, 120.00, TRUE);

-- --------------------------------------------------------------------
-- 3. SEED MENU_ITEMS (Permanent Dish Catalogs)
-- --------------------------------------------------------------------
INSERT INTO MENU_ITEMS (item_id, vendor_id, name, category, is_veg, base_price, description) VALUES
-- Annapurna Mess (Bibwewadi)
(1, 1, 'Executive Maharashtrian Deluxe Thali', 'Thali', TRUE, 120.00, '3 Chapati/Bhakri, Dal Tadka, Seasonal Veg, Patal Bhaji, Rice, Sweet Sheera & Solkadhi'),
(2, 1, 'Special Paneer Butter Masala Meal', 'Main Course', TRUE, 140.00, 'Rich cottage cheese gravy with 3 Butter Phulkas, Jeera Rice and Papad'),
(3, 1, 'Kolhapuri Tambda-Pandhra Rassa Special', 'Special', FALSE, 180.00, 'Authentic spicy mutton curry with unlimited pandhra rassa, 2 Jowar Bhakris'),
(4, 1, 'Kanda Poha & Masala Chai Combo', 'Breakfast', TRUE, 50.00, 'Warm roasted poha with peanuts, fresh coconut and piping hot cutting chai'),

-- Sai Krupa Dining Hall (Bibwewadi)
(5, 2, 'Unlimited Student Regular Thali', 'Thali', TRUE, 90.00, 'Unlimited Hot Chapatis, Dal Fry, 2 Veg Sabzis of the day, Steamed Rice, Pickle'),
(6, 2, 'Sev Bhaji Khandeshi Plate', 'Main Course', TRUE, 100.00, 'Spicy traditional Sev bhaji in black spicy rassa, 3 Chapatis, Kanda Nimbu'),
(7, 2, 'Misal Pav Extreme Pune Special', 'Snacks', TRUE, 70.00, 'Double tari misal served with farsan, chopped onions, lemon and 2 fresh pavs'),

-- Maharaja Special Thali Kitchen (Upper Indira Nagar)
(8, 3, 'Royal Shahi Paneer Thali', 'Thali', TRUE, 150.00, 'Shahi Paneer, Dal Makhani, 4 Butter Rotis, Gulab Jamun, Jeera Rice, Boondi Raita'),
(9, 3, 'Egg Curry & Jeera Rice Student Bowl', 'Main Course', FALSE, 110.00, 'Double egg home-style masala curry with fragrant jeera rice and spiced onions'),
(10, 3, 'Puran Poli Mahotsav Thali', 'Special', TRUE, 160.00, '2 Pure Ghee Puran Polis, Katachi Amti, Kurdai, Batata Sukki Bhaji, Rice'),

-- Kondhwa Campus Rasoi (Kondhwa)
(11, 4, 'Hyderabadi Dum Biryani Plate', 'Special', FALSE, 160.00, 'Slow cooked spiced chicken dum biryani served with Mirchi Ka Salan and Raita'),
(12, 4, 'Veg Biryani & Paneer Tikka Combo', 'Main Course', TRUE, 130.00, 'Layered saffron basmati rice with marinated paneer cubes and cooling raita'),
(13, 4, 'Bun Maska & Irani Chai', 'Breakfast', TRUE, 45.00, 'Crispy buttery pav paired with authentic slow-brewed sweet Irani chai'),

-- Indira Nagar Home Mess
(14, 5, 'Ghar Jaisa Dal Baati Churma', 'Special', TRUE, 120.00, '3 Crispy baked baatis dipped in pure ghee, Panchmel dal, sweet churma'),
(15, 5, 'Daily Pocket-Friendly Veg Thali', 'Thali', TRUE, 80.00, '3 Chapatis, Aloo Methi, Dal Fry, Rice and fresh curd'),

-- Katraj Lake Student Bhojanalaya
(16, 6, 'South Indian Masala Dosa Meal', 'Snacks', TRUE, 65.00, 'Golden crispy dosa with spiced potato filling, coconut chutney and hot sambar'),
(17, 6, 'Mini Rajma Chawal Bowl', 'Main Course', TRUE, 75.00, 'Slow-simmered Punjabi Rajma served over steamed basmati rice with pickled onions');

-- --------------------------------------------------------------------
-- 4. SEED DAILY_AVAILABILITY (Dynamic Daily Menus & Dynamic Pricing)
-- --------------------------------------------------------------------
INSERT INTO DAILY_AVAILABILITY (record_id, item_id, date, meal_slot, daily_price, stock_qty, special_note) VALUES
-- Today's Lunch Records
(1, 1, CURDATE(), 'Lunch', 130.00, 28, 'Fresh Ukadiche Modak included in first 20 orders!'),
(2, 2, CURDATE(), 'Lunch', 145.00, 14, 'Filling fast - Chef special buttery gravy'),
(3, 5, CURDATE(), 'Lunch', 95.00, 42, 'Unlimited Chapati refill guarantee till 14:30'),
(4, 6, CURDATE(), 'Lunch', 105.00, 4, 'Only 4 plates remaining! Extra tari available'),
(5, 8, CURDATE(), 'Lunch', 155.00, 19, 'Includes chilled saffron lassi shooter'),
(6, 11, CURDATE(), 'Lunch', 170.00, 2, 'LAST 2 PLATES! Handi nearly finished'),
(7, 14, CURDATE(), 'Lunch', 125.00, 22, 'Traditional Rajasthani Ghee Baati'),
(8, 17, CURDATE(), 'Lunch', 80.00, 35, 'Home-made North Indian comforting meal'),

-- Today's Breakfast Records
(9, 4, CURDATE(), 'Breakfast', 50.00, 12, 'Hot batch ready fresh from kadhai'),
(10, 13, CURDATE(), 'Breakfast', 45.00, 8, 'Fresh baked pav arriving every 30 mins'),

-- Today's Evening Snacks Records
(11, 7, CURDATE(), 'Snacks', 75.00, 25, 'Spicy Pune Katraj Farsan recipe'),
(12, 16, CURDATE(), 'Snacks', 70.00, 16, 'Fermented batter prepared this morning'),

-- Today's Dinner Records
(13, 1, CURDATE(), 'Dinner', 135.00, 30, 'Dinner service starts 19:30 sharp'),
(14, 5, CURDATE(), 'Dinner', 95.00, 50, 'Fresh phulkas rolled live'),
(15, 8, CURDATE(), 'Dinner', 160.00, 20, 'Evening exam booster royal meal'),
(16, 10, CURDATE(), 'Dinner', 175.00, 9, 'Special weekend treat - limited batch');

-- --------------------------------------------------------------------
-- 5. SEED CUSTOMERS (VIT Students)
-- --------------------------------------------------------------------
INSERT INTO CUSTOMERS (cust_id, regd_no, name, contact, phone, course, address, city, loyalty_points, state) VALUES
(1, 'VIT-AIML-D-13', 'Aarav Deshmukh', 'aarav.deshmukh@vit.edu', '9123456780', 'B.Tech AI & Data Science', 'Hostel B, Room 204, VIT Bibwewadi Campus', 'Pune', 125, 'active'),
(2, 'VIT-CS-B-42', 'Rhea Kulkarni', 'rhea.k@vit.edu', '9123456781', 'B.Tech Computer Engineering', 'Flat 402, Shri Krishna Heights, Bibwewadi', 'Pune', 280, 'active'),
(3, 'VIT-MECH-A-09', 'Siddharth Patil', 'sid.patil@vit.edu', '9123456782', 'B.Tech Mechanical', 'Wing C, Silver Nest, Kondhwa Budruk', 'Pune', 45, 'active'),
(4, 'VIT-ENTC-C-27', 'Tanvi Joshi', 'tanvi.j@vit.edu', '9123456783', 'B.Tech Electronics & Telecom', 'Plot 18, Indira Nagar Society, Upper Indira Nagar', 'Pune', 510, 'active'),
(5, 'VIT-IT-A-15', 'Kabir Sharma', 'kabir.s@vit.edu', '9123456784', 'B.Tech Information Technology', 'Hostel A, Room 108, VIT Main Campus', 'Pune', 0, 'active');

-- --------------------------------------------------------------------
-- 6. SEED REVIEWS
-- --------------------------------------------------------------------
INSERT INTO REVIEWS (review_id, customer_id, vendor_id, rating, comment, created_at) VALUES
(1, 1, 1, 5.00, 'Best Solkadhi and chapatis around VIT! Taste reminds me of home.', NOW() - INTERVAL 2 DAY),
(2, 2, 1, 4.80, 'Portion sizes are generous and food is always served piping hot.', NOW() - INTERVAL 1 DAY),
(3, 3, 2, 4.50, 'Best unlimited deal in Bibwewadi for hostel students. Super fast refill.', NOW() - INTERVAL 3 DAY),
(4, 4, 3, 5.00, 'The Shahi Paneer Thali is unbeatable during semester exam stress!', NOW() - INTERVAL 1 DAY),
(5, 1, 4, 4.20, 'Authentic biryani flavors near Kondhwa campus. Highly recommended.', NOW() - INTERVAL 4 DAY);

-- --------------------------------------------------------------------
-- 7. SEED ORDERS
-- --------------------------------------------------------------------
INSERT INTO ORDERS (order_id, cust_id, vendor_id, order_mode, final_price, order_status, created_at) VALUES
(1, 1, 1, 'Dine-In Token', 110.00, 'Completed', NOW() - INTERVAL 3 HOUR),
(2, 2, 1, 'Tiffin Delivery', 270.00, 'Out for Delivery', NOW() - INTERVAL 25 MINUTE),
(3, 4, 3, 'Tiffin Delivery', 155.00, 'Preparing', NOW() - INTERVAL 12 MINUTE),
(4, 3, 2, 'Dine-In Token', 95.00, 'Confirmed', NOW() - INTERVAL 5 MINUTE);

-- --------------------------------------------------------------------
-- 8. SEED ORDER_DETAILS
-- --------------------------------------------------------------------
INSERT INTO ORDER_DETAILS (detail_id, order_id, record_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 130.00),
(2, 2, 1, 2, 130.00),
(3, 3, 5, 1, 155.00),
(4, 4, 3, 1, 95.00);

-- --------------------------------------------------------------------
-- 9. SEED PAYMENTS
-- --------------------------------------------------------------------
INSERT INTO PAYMENTS (payment_id, order_id, amount, payment_method, payment_status, paid_at) VALUES
(1, 1, 110.00, 'UPI', 'Success', NOW() - INTERVAL 3 HOUR),
(2, 2, 270.00, 'UPI', 'Success', NOW() - INTERVAL 25 MINUTE),
(3, 3, 155.00, 'Campus Wallet', 'Success', NOW() - INTERVAL 12 MINUTE),
(4, 4, 95.00, 'Cash at Mess', 'Success', NOW() - INTERVAL 5 MINUTE);

-- --------------------------------------------------------------------
-- 10. SEED DELIVERY_AGENTS & DELIVERY_TRACKING
-- --------------------------------------------------------------------
INSERT INTO DELIVERY_AGENTS (agent_id, name, phone, is_available) VALUES
(1, 'Ramesh Shinde (E-Bike 04)', '9921001122', FALSE),
(2, 'Sachin Gaikwad (Cycle 12)', '9921003344', TRUE),
(3, 'Pratik More (Scooter 07)', '9921005566', TRUE);

INSERT INTO DELIVERY_TRACKING (track_id, order_id, agent_id, payment_id, delivery_status, eta_minutes) VALUES
(1, 2, 1, 2, 'Out for Delivery', 9),
(2, 3, NULL, 3, 'Assigned', 22);

-- --------------------------------------------------------------------
-- 11. AUDIT INITIALIZATION SEED
-- --------------------------------------------------------------------
INSERT INTO vendor_audit (vendor_id, action_type, vendor_name, logged_at) VALUES
(1, 'INSERT', 'Annapurna Mess Bibwewadi', NOW() - INTERVAL 10 DAY),
(2, 'INSERT', 'Sai Krupa Dining Hall', NOW() - INTERVAL 8 DAY),
(3, 'INSERT', 'Maharaja Special Thali Kitchen', NOW() - INTERVAL 5 DAY);
