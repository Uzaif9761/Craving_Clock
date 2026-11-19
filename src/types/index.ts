// Type definitions for Craving Clock relational entities & DBMS runtime

export type CampusZone = 'Bibwewadi' | 'Upper Indira Nagar' | 'Kondhwa' | 'Katraj' | 'All Zones';

export type MealSlot = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export type UserRole = 'student' | 'vendor' | 'dbms_evaluator';

export interface Vendor {
  vendor_id: number;
  name: string;
  phone: string;
  city: string;
  area_zone: string;
  rating: number;
  is_open: boolean;
  created_at: string;
  banner_color?: string;
  description?: string;
  address?: string;
}

export interface Promotion {
  promo_id: number;
  vendor_id: number;
  code: string;
  discount_amount: number;
  min_order: number;
  is_active: boolean;
}

export interface MenuItem {
  item_id: number;
  vendor_id: number;
  name: string;
  category: 'Thali' | 'Main Course' | 'Snacks' | 'Beverages' | 'Special';
  is_veg: boolean;
  base_price: number;
  description: string;
}

export interface DailyAvailability {
  record_id: number;
  item_id: number;
  date: string;
  meal_slot: MealSlot;
  daily_price: number;
  stock_qty: number;
  special_note?: string;
}

export interface Customer {
  cust_id: number;
  regd_no: string;
  name: string;
  contact: string;
  phone: string;
  course: string;
  address: string;
  city: string;
  loyalty_points: number;
  state: 'active' | 'inactive' | 'suspended';
}

export interface Review {
  review_id: number;
  customer_id: number;
  vendor_id: number;
  rating: number;
  comment: string;
  created_at: string;
  customer_name?: string;
}

export interface Order {
  order_id: number;
  cust_id: number;
  vendor_id: number;
  order_mode: 'Dine-In Token' | 'Tiffin Delivery';
  final_price: number;
  order_status: 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  created_at: string;
  items?: Array<{
    dish_name: string;
    quantity: number;
    unit_price: number;
  }>;
  vendor_name?: string;
}

export interface OrderDetail {
  detail_id: number;
  order_id: number;
  record_id: number;
  quantity: number;
  unit_price: number;
}

export interface Payment {
  payment_id: number;
  order_id: number;
  amount: number;
  payment_method: 'UPI' | 'Campus Wallet' | 'Cash at Mess' | 'Card';
  payment_status: 'Success' | 'Pending' | 'Failed';
  paid_at: string;
}

export interface DeliveryAgent {
  agent_id: number;
  name: string;
  phone: string;
  is_available: boolean;
}

export interface DeliveryTracking {
  track_id: number;
  order_id: number;
  agent_id: number | null;
  payment_id: number | null;
  delivery_status: 'Assigned' | 'Picked Up' | 'Out for Delivery' | 'Delivered';
  eta_minutes: number;
}

// Audit tables
export interface VendorAudit {
  audit_id: number;
  vendor_id: number;
  action_type: 'INSERT' | 'UPDATE' | 'DELETE';
  vendor_name: string;
  logged_at: string;
}

export interface VendorCityTrace {
  trace_id: number;
  vendor_id: number;
  old_city: string;
  new_city: string;
  changed_at: string;
}

export interface VendorColdRetentionLog {
  archive_id: number;
  vendor_id: number;
  name: string;
  phone: string;
  city: string;
  deleted_at: string;
}

// Telemetry & DBMS Inspector Types
export interface SqlTelemetryLog {
  id: string;
  timestamp: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'VIEW' | 'PROCEDURE' | 'TRIGGER' | 'TRANSACTION' | 'LOCK';
  sql: string;
  executionTimeMs: number;
  affectedRows: number;
  lockStatus?: 'NONE' | 'ROW_EXCLUSIVE_LOCKED' | 'RELEASED' | 'ROLLBACK';
  details?: string;
}
