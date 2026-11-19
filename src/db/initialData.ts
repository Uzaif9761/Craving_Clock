import {
  Vendor,
  Promotion,
  MenuItem,
  DailyAvailability,
  Customer,
  Review,
  Order,
  OrderDetail,
  Payment,
  DeliveryAgent,
  DeliveryTracking,
  VendorAudit,
  VendorCityTrace,
  VendorColdRetentionLog
} from '../types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    vendor_id: 1,
    name: 'Annapurna Mess Bibwewadi',
    phone: '9822011221',
    city: 'Pune',
    area_zone: 'Bibwewadi',
    rating: 4.85,
    is_open: true,
    created_at: '2026-10-01 10:00:00',
    description: 'VIT Main Gate legendary Maharashtrian kitchen. Known for unlimited hot phulkas and homemade Solkadhi.',
    address: 'Near VIT Back Gate, Bibwewadi, Pune - 411037'
  },
  {
    vendor_id: 2,
    name: 'Sai Krupa Dining Hall',
    phone: '9822033442',
    city: 'Pune',
    area_zone: 'Bibwewadi',
    rating: 4.65,
    is_open: true,
    created_at: '2026-10-03 11:30:00',
    description: 'The ultimate pocket-friendly student feast. Unlimited thali with Khandeshi special sev bhaji.',
    address: 'Opposite Chintamani Supermarket, Bibwewadi, Pune'
  },
  {
    vendor_id: 3,
    name: 'Maharaja Special Thali Kitchen',
    phone: '9890123456',
    city: 'Pune',
    area_zone: 'Upper Indira Nagar',
    rating: 4.70,
    is_open: true,
    created_at: '2026-10-05 09:15:00',
    description: 'Royal North Indian & Punjabi delicacies with Shahi Paneer, Puran Poli, and pure ghee sweets.',
    address: 'Lane 4, Upper Indira Nagar, Bibwewadi-Kondhwa Link Road'
  },
  {
    vendor_id: 4,
    name: 'Kondhwa Campus Rasoi',
    phone: '9765432100',
    city: 'Pune',
    area_zone: 'Kondhwa',
    rating: 4.55,
    is_open: true,
    created_at: '2026-10-08 14:00:00',
    description: 'Specializing in authentic Hyderabadi Dum Biryani and Irani Chai with maska pav for VIT Upper Campus.',
    address: 'Near VIT Kondhwa Campus Gate 2, Kondhwa Budruk'
  },
  {
    vendor_id: 5,
    name: 'Indira Nagar Home Mess',
    phone: '9823456789',
    city: 'Pune',
    area_zone: 'Upper Indira Nagar',
    rating: 4.40,
    is_open: true,
    created_at: '2026-10-10 12:00:00',
    description: 'Homely mother-made food, gentle spices, Dal Baati Churma, and daily fresh curd.',
    address: 'Sector 2, Indira Nagar Hostel Hub, Pune'
  },
  {
    vendor_id: 6,
    name: 'Katraj Lake Student Bhojanalaya',
    phone: '9822987654',
    city: 'Pune',
    area_zone: 'Katraj',
    rating: 4.30,
    is_open: true,
    created_at: '2026-10-12 16:30:00',
    description: 'Fast South Indian combos, crispy paper dosas, and quick student meal bowls.',
    address: 'Katraj Dairy Chowk, Near Lake Garden, Pune'
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  { promo_id: 1, vendor_id: 1, code: 'VITIAN20', discount_amount: 20.00, min_order: 100.00, is_active: true },
  { promo_id: 2, vendor_id: 2, code: 'SAI30', discount_amount: 30.00, min_order: 150.00, is_active: true },
  { promo_id: 3, vendor_id: 3, code: 'EXAMFEAST', discount_amount: 40.00, min_order: 200.00, is_active: true },
  { promo_id: 4, vendor_id: 4, code: 'KONDHWA15', discount_amount: 15.00, min_order: 80.00, is_active: true },
  { promo_id: 5, vendor_id: 5, code: 'HOMEY25', discount_amount: 25.00, min_order: 120.00, is_active: true }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Annapurna Mess
  { item_id: 1, vendor_id: 1, name: 'Executive Maharashtrian Deluxe Thali', category: 'Thali', is_veg: true, base_price: 120.00, description: '3 Chapati/Bhakri, Dal Tadka, Seasonal Veg, Patal Bhaji, Steamed Rice, Sweet Sheera & Solkadhi' },
  { item_id: 2, vendor_id: 1, name: 'Special Paneer Butter Masala Meal', category: 'Main Course', is_veg: true, base_price: 140.00, description: 'Rich cottage cheese gravy with 3 Butter Phulkas, Jeera Rice, Papad and roasted onions' },
  { item_id: 3, vendor_id: 1, name: 'Kolhapuri Tambda-Pandhra Rassa Special', category: 'Special', is_veg: false, base_price: 180.00, description: 'Authentic spicy Kolhapuri mutton/chicken curry with unlimited pandhra rassa & 2 Jowar Bhakris' },
  { item_id: 4, vendor_id: 1, name: 'Kanda Poha & Masala Chai Combo', category: 'Snacks', is_veg: true, base_price: 50.00, description: 'Warm roasted poha with peanuts, fresh coconut and piping hot cutting chai' },

  // Sai Krupa Dining Hall
  { item_id: 5, vendor_id: 2, name: 'Unlimited Student Regular Thali', category: 'Thali', is_veg: true, base_price: 90.00, description: 'Unlimited Hot Chapatis, Dal Fry, 2 Veg Sabzis of the day, Steamed Rice, Pickle & Papad' },
  { item_id: 6, vendor_id: 2, name: 'Sev Bhaji Khandeshi Plate', category: 'Main Course', is_veg: true, base_price: 100.00, description: 'Spicy traditional Sev bhaji in black roasted coconut gravy, 3 Chapatis, sliced onions' },
  { item_id: 7, vendor_id: 2, name: 'Misal Pav Extreme Pune Special', category: 'Snacks', is_veg: true, base_price: 70.00, description: 'Double tari misal served with fresh farsan, chopped onions, lemon wedge and 2 warm pavs' },

  // Maharaja Special Thali Kitchen
  { item_id: 8, vendor_id: 3, name: 'Royal Shahi Paneer Thali', category: 'Thali', is_veg: true, base_price: 150.00, description: 'Shahi Paneer, Dal Makhani, 4 Butter Rotis, Gulab Jamun, Jeera Rice, Boondi Raita' },
  { item_id: 9, vendor_id: 3, name: 'Egg Curry & Jeera Rice Student Bowl', category: 'Main Course', is_veg: false, base_price: 110.00, description: 'Double egg home-style masala curry with fragrant jeera rice and spiced salad' },
  { item_id: 10, vendor_id: 3, name: 'Puran Poli Mahotsav Thali', category: 'Special', is_veg: true, base_price: 160.00, description: '2 Pure Ghee Puran Polis, Katachi Amti, Kurdai, Batata Sukki Bhaji, Rice' },

  // Kondhwa Campus Rasoi
  { item_id: 11, vendor_id: 4, name: 'Hyderabadi Dum Biryani Plate', category: 'Special', is_veg: false, base_price: 160.00, description: 'Slow cooked spiced chicken dum biryani served with Mirchi Ka Salan and Cucumber Raita' },
  { item_id: 12, vendor_id: 4, name: 'Veg Biryani & Paneer Tikka Combo', category: 'Main Course', is_veg: true, base_price: 130.00, description: 'Layered saffron basmati rice with marinated paneer cubes and cooling raita' },
  { item_id: 13, vendor_id: 4, name: 'Bun Maska & Irani Chai', category: 'Snacks', is_veg: true, base_price: 45.00, description: 'Crispy buttery pav paired with authentic slow-brewed sweet Irani chai' },

  // Indira Nagar Home Mess
  { item_id: 14, vendor_id: 5, name: 'Ghar Jaisa Dal Baati Churma', category: 'Special', is_veg: true, base_price: 120.00, description: '3 Crispy baked baatis dipped in pure ghee, Panchmel dal, sweet crushed churma' },
  { item_id: 15, vendor_id: 5, name: 'Daily Pocket-Friendly Veg Thali', category: 'Thali', is_veg: true, base_price: 80.00, description: '3 Chapatis, Aloo Methi, Dal Fry, Rice and freshly churned curd' },

  // Katraj Lake Student Bhojanalaya
  { item_id: 16, vendor_id: 6, name: 'South Indian Masala Dosa Meal', category: 'Snacks', is_veg: true, base_price: 65.00, description: 'Golden crispy dosa with spiced potato filling, coconut chutney and hot sambar' },
  { item_id: 17, vendor_id: 6, name: 'Mini Rajma Chawal Bowl', category: 'Main Course', is_veg: true, base_price: 75.00, description: 'Slow-simmered Punjabi Rajma served over steamed basmati rice with pickled onions' }
];

export const INITIAL_DAILY_AVAILABILITY: DailyAvailability[] = [
  // Lunch
  { record_id: 1, item_id: 1, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 130.00, stock_qty: 28, special_note: 'Fresh Ukadiche Modak included in first 20 orders!' },
  { record_id: 2, item_id: 2, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 145.00, stock_qty: 14, special_note: 'Filling fast — Chef special buttery gravy' },
  { record_id: 3, item_id: 5, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 95.00, stock_qty: 42, special_note: 'Unlimited Chapati refill guarantee till 14:30' },
  { record_id: 4, item_id: 6, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 105.00, stock_qty: 4, special_note: 'Only 4 plates remaining! Extra spicy tari' },
  { record_id: 5, item_id: 8, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 155.00, stock_qty: 19, special_note: 'Includes chilled saffron lassi shooter' },
  { record_id: 6, item_id: 11, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 170.00, stock_qty: 2, special_note: 'LAST 2 PLATES! Handi nearly finished' },
  { record_id: 7, item_id: 14, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 125.00, stock_qty: 22, special_note: 'Traditional Rajasthani Ghee Baati' },
  { record_id: 8, item_id: 17, date: '2026-10-31', meal_slot: 'Lunch', daily_price: 80.00, stock_qty: 35, special_note: 'Home-made North Indian comforting meal' },

  // Breakfast
  { record_id: 9, item_id: 4, date: '2026-10-31', meal_slot: 'Breakfast', daily_price: 50.00, stock_qty: 12, special_note: 'Hot batch ready fresh from kadhai' },
  { record_id: 10, item_id: 13, date: '2026-10-31', meal_slot: 'Breakfast', daily_price: 45.00, stock_qty: 8, special_note: 'Fresh baked pav arriving every 30 mins' },

  // Evening Snacks
  { record_id: 11, item_id: 7, date: '2026-10-31', meal_slot: 'Snacks', daily_price: 75.00, stock_qty: 25, special_note: 'Spicy Pune Katraj Farsan recipe' },
  { record_id: 12, item_id: 16, date: '2026-10-31', meal_slot: 'Snacks', daily_price: 70.00, stock_qty: 16, special_note: 'Fermented batter prepared this morning' },

  // Dinner
  { record_id: 13, item_id: 1, date: '2026-10-31', meal_slot: 'Dinner', daily_price: 135.00, stock_qty: 30, special_note: 'Dinner service starts 19:30 sharp' },
  { record_id: 14, item_id: 5, date: '2026-10-31', meal_slot: 'Dinner', daily_price: 95.00, stock_qty: 50, special_note: 'Fresh phulkas rolled live' },
  { record_id: 15, item_id: 8, date: '2026-10-31', meal_slot: 'Dinner', daily_price: 160.00, stock_qty: 20, special_note: 'Evening exam booster royal meal' },
  { record_id: 16, item_id: 10, date: '2026-10-31', meal_slot: 'Dinner', daily_price: 175.00, stock_qty: 9, special_note: 'Special weekend treat — limited batch' }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { cust_id: 1, regd_no: 'VIT-AIML-D-13', name: 'Aarav Deshmukh', contact: 'aarav.deshmukh@vit.edu', phone: '9123456780', course: 'B.Tech AI & Data Science', address: 'Hostel B, Room 204, VIT Bibwewadi Campus', city: 'Pune', loyalty_points: 125, state: 'active' },
  { cust_id: 2, regd_no: 'VIT-CS-B-42', name: 'Rhea Kulkarni', contact: 'rhea.k@vit.edu', phone: '9123456781', course: 'B.Tech Computer Engineering', address: 'Flat 402, Shri Krishna Heights, Bibwewadi', city: 'Pune', loyalty_points: 280, state: 'active' },
  { cust_id: 3, regd_no: 'VIT-MECH-A-09', name: 'Siddharth Patil', contact: 'sid.patil@vit.edu', phone: '9123456782', course: 'B.Tech Mechanical', address: 'Wing C, Silver Nest, Kondhwa Budruk', city: 'Pune', loyalty_points: 45, state: 'active' },
  { cust_id: 4, regd_no: 'VIT-ENTC-C-27', name: 'Tanvi Joshi', contact: 'tanvi.j@vit.edu', phone: '9123456783', course: 'B.Tech Electronics & Telecom', address: 'Plot 18, Indira Nagar Society, Upper Indira Nagar', city: 'Pune', loyalty_points: 510, state: 'active' },
  { cust_id: 5, regd_no: 'VIT-IT-A-15', name: 'Kabir Sharma', contact: 'kabir.s@vit.edu', phone: '9123456784', course: 'B.Tech Information Technology', address: 'Hostel A, Room 108, VIT Main Campus', city: 'Pune', loyalty_points: 0, state: 'active' }
];

export const INITIAL_REVIEWS: Review[] = [
  { review_id: 1, customer_id: 1, vendor_id: 1, rating: 5.0, comment: 'Best Solkadhi and chapatis around VIT! Taste reminds me of home.', created_at: '2026-10-29 13:10:00', customer_name: 'Aarav Deshmukh' },
  { review_id: 2, customer_id: 2, vendor_id: 1, rating: 4.8, comment: 'Portion sizes are generous and food is always served piping hot.', created_at: '2026-10-30 14:05:00', customer_name: 'Rhea Kulkarni' },
  { review_id: 3, customer_id: 3, vendor_id: 2, rating: 4.5, comment: 'Best unlimited deal in Bibwewadi for hostel students. Super fast refill.', created_at: '2026-10-28 20:30:00', customer_name: 'Siddharth Patil' },
  { review_id: 4, customer_id: 4, vendor_id: 3, rating: 5.0, comment: 'The Shahi Paneer Thali is unbeatable during semester exam stress!', created_at: '2026-10-30 19:45:00', customer_name: 'Tanvi Joshi' },
  { review_id: 5, customer_id: 1, vendor_id: 4, rating: 4.2, comment: 'Authentic biryani flavors near Kondhwa campus. Highly recommended.', created_at: '2026-10-27 12:40:00', customer_name: 'Aarav Deshmukh' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    order_id: 1,
    cust_id: 1,
    vendor_id: 1,
    order_mode: 'Dine-In Token',
    final_price: 110.00,
    order_status: 'Completed',
    created_at: '2026-10-31 11:30:00',
    vendor_name: 'Annapurna Mess Bibwewadi',
    items: [{ dish_name: 'Executive Maharashtrian Deluxe Thali', quantity: 1, unit_price: 130.00 }]
  },
  {
    order_id: 2,
    cust_id: 2,
    vendor_id: 1,
    order_mode: 'Tiffin Delivery',
    final_price: 270.00,
    order_status: 'Out for Delivery',
    created_at: '2026-10-31 12:45:00',
    vendor_name: 'Annapurna Mess Bibwewadi',
    items: [{ dish_name: 'Executive Maharashtrian Deluxe Thali', quantity: 2, unit_price: 130.00 }]
  },
  {
    order_id: 3,
    cust_id: 4,
    vendor_id: 3,
    order_mode: 'Tiffin Delivery',
    final_price: 155.00,
    order_status: 'Preparing',
    created_at: '2026-10-31 12:55:00',
    vendor_name: 'Maharaja Special Thali Kitchen',
    items: [{ dish_name: 'Royal Shahi Paneer Thali', quantity: 1, unit_price: 155.00 }]
  },
  {
    order_id: 4,
    cust_id: 3,
    vendor_id: 2,
    order_mode: 'Dine-In Token',
    final_price: 95.00,
    order_status: 'Confirmed',
    created_at: '2026-10-31 13:05:00',
    vendor_name: 'Sai Krupa Dining Hall',
    items: [{ dish_name: 'Unlimited Student Regular Thali', quantity: 1, unit_price: 95.00 }]
  }
];

export const INITIAL_ORDER_DETAILS: OrderDetail[] = [
  { detail_id: 1, order_id: 1, record_id: 1, quantity: 1, unit_price: 130.00 },
  { detail_id: 2, order_id: 2, record_id: 1, quantity: 2, unit_price: 130.00 },
  { detail_id: 3, order_id: 3, record_id: 5, quantity: 1, unit_price: 155.00 },
  { detail_id: 4, order_id: 4, record_id: 3, quantity: 1, unit_price: 95.00 }
];

export const INITIAL_PAYMENTS: Payment[] = [
  { payment_id: 1, order_id: 1, amount: 110.00, payment_method: 'UPI', payment_status: 'Success', paid_at: '2026-10-31 11:31:00' },
  { payment_id: 2, order_id: 2, amount: 270.00, payment_method: 'UPI', payment_status: 'Success', paid_at: '2026-10-31 12:46:00' },
  { payment_id: 3, order_id: 3, amount: 155.00, payment_method: 'Campus Wallet', payment_status: 'Success', paid_at: '2026-10-31 12:56:00' },
  { payment_id: 4, order_id: 4, amount: 95.00, payment_method: 'Cash at Mess', payment_status: 'Success', paid_at: '2026-10-31 13:06:00' }
];

export const INITIAL_DELIVERY_AGENTS: DeliveryAgent[] = [
  { agent_id: 1, name: 'Ramesh Shinde (E-Bike 04)', phone: '9921001122', is_available: false },
  { agent_id: 2, name: 'Sachin Gaikwad (Cycle 12)', phone: '9921003344', is_available: true },
  { agent_id: 3, name: 'Pratik More (Scooter 07)', phone: '9921005566', is_available: true }
];

export const INITIAL_DELIVERY_TRACKING: DeliveryTracking[] = [
  { track_id: 1, order_id: 2, agent_id: 1, payment_id: 2, delivery_status: 'Out for Delivery', eta_minutes: 9 },
  { track_id: 2, order_id: 3, agent_id: null, payment_id: 3, delivery_status: 'Assigned', eta_minutes: 22 }
];

export const INITIAL_VENDOR_AUDIT: VendorAudit[] = [
  { audit_id: 1, vendor_id: 1, action_type: 'INSERT', vendor_name: 'Annapurna Mess Bibwewadi', logged_at: '2026-10-20 09:00:00' },
  { audit_id: 2, vendor_id: 2, action_type: 'INSERT', vendor_name: 'Sai Krupa Dining Hall', logged_at: '2026-10-22 10:15:00' },
  { audit_id: 3, vendor_id: 3, action_type: 'INSERT', vendor_name: 'Maharaja Special Thali Kitchen', logged_at: '2026-10-25 14:30:00' }
];

export const INITIAL_VENDOR_CITY_TRACE: VendorCityTrace[] = [];

export const INITIAL_VENDOR_COLD_RETENTION: VendorColdRetentionLog[] = [];
