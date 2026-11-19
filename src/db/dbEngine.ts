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
  VendorColdRetentionLog,
  SqlTelemetryLog,
  MealSlot,
  CampusZone
} from '../types';

import {
  INITIAL_VENDORS,
  INITIAL_PROMOTIONS,
  INITIAL_MENU_ITEMS,
  INITIAL_DAILY_AVAILABILITY,
  INITIAL_CUSTOMERS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS,
  INITIAL_ORDER_DETAILS,
  INITIAL_PAYMENTS,
  INITIAL_DELIVERY_AGENTS,
  INITIAL_DELIVERY_TRACKING,
  INITIAL_VENDOR_AUDIT,
  INITIAL_VENDOR_CITY_TRACE,
  INITIAL_VENDOR_COLD_RETENTION
} from './initialData';

class DbEngine {
  private vendors: Vendor[] = [...INITIAL_VENDORS];
  private promotions: Promotion[] = [...INITIAL_PROMOTIONS];
  private menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
  private dailyAvailability: DailyAvailability[] = [...INITIAL_DAILY_AVAILABILITY];
  private customers: Customer[] = [...INITIAL_CUSTOMERS];
  private reviews: Review[] = [...INITIAL_REVIEWS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private orderDetails: OrderDetail[] = [...INITIAL_ORDER_DETAILS];
  private payments: Payment[] = [...INITIAL_PAYMENTS];
  private deliveryAgents: DeliveryAgent[] = [...INITIAL_DELIVERY_AGENTS];
  private deliveryTracking: DeliveryTracking[] = [...INITIAL_DELIVERY_TRACKING];

  // Audit and retention tables
  private vendorAudit: VendorAudit[] = [...INITIAL_VENDOR_AUDIT];
  private vendorCityTrace: VendorCityTrace[] = [...INITIAL_VENDOR_CITY_TRACE];
  private vendorColdRetention: VendorColdRetentionLog[] = [...INITIAL_VENDOR_COLD_RETENTION];

  // SQL Telemetry log buffer
  private telemetryLogs: SqlTelemetryLog[] = [];
  private listeners: Set<() => void> = new Set();

  // Active Row Locks Map (record_id -> lock meta)
  private activeRowLocks: Map<number, { lockedAt: number; transactionId: string }> = new Map();

  constructor() {
    this.logTelemetry({
      type: 'TRANSACTION',
      sql: `-- Initialized Craving Clock Relational Engine (MySQL 8.0 Emulation)\n-- 10 Tables, 4 Views, 4 Procedures, 7 Triggers Loaded.`,
      executionTimeMs: 1.2,
      affectedRows: 0,
      lockStatus: 'NONE',
      details: 'Database ready with VIT Pune ecosystem initial dataset'
    });
  }

  // Subscription for UI updates
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public logTelemetry(entry: Omit<SqlTelemetryLog, 'id' | 'timestamp'>) {
    const log: SqlTelemetryLog = {
      ...entry,
      id: 'sql_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(Math.random() * 900 + 100)
    };
    this.telemetryLogs.unshift(log);
    if (this.telemetryLogs.length > 80) {
      this.telemetryLogs.pop();
    }
    this.notify();
  }

  public getTelemetryLogs(): SqlTelemetryLog[] {
    return this.telemetryLogs;
  }

  public clearTelemetry() {
    this.telemetryLogs = [];
    this.notify();
  }

  // ====================================================================
  // GETTERS FOR CORE RELATIONAL TABLES
  // ====================================================================
  public getVendors(zone?: CampusZone): Vendor[] {
    if (!zone || zone === 'All Zones') return this.vendors;
    return this.vendors.filter((v) => v.area_zone.toLowerCase() === zone.toLowerCase());
  }

  public getMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  public getDailyAvailability(): DailyAvailability[] {
    return this.dailyAvailability;
  }

  public getCustomers(): Customer[] {
    return this.customers;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getReviews(): Review[] {
    return this.reviews;
  }

  public getPromotions(): Promotion[] {
    return this.promotions;
  }

  public getDeliveryAgents(): DeliveryAgent[] {
    return this.deliveryAgents;
  }

  public getDeliveryTracking(): DeliveryTracking[] {
    return this.deliveryTracking;
  }

  public getVendorAudit(): VendorAudit[] {
    return this.vendorAudit;
  }

  public getVendorCityTrace(): VendorCityTrace[] {
    return this.vendorCityTrace;
  }

  public getVendorColdRetention(): VendorColdRetentionLog[] {
    return this.vendorColdRetention;
  }

  // ====================================================================
  // SECTION A: 4 STRUCTURAL DATABASE VIEWS
  // ====================================================================

  /**
   * View 1: Live_Menu_Customer_View
   * SELECT record_id, item_id, date, meal_slot, daily_price, stock_qty, special_note
   * FROM DAILY_AVAILABILITY WHERE date = CURDATE() AND stock_qty > 0;
   */
  public executeViewLiveMenuCustomer(slot?: MealSlot) {
    const startTime = performance.now();
    const rows = this.dailyAvailability
      .filter((d) => d.stock_qty > 0 && (!slot || d.meal_slot === slot))
      .map((d) => {
        const item = this.menuItems.find((m) => m.item_id === d.item_id);
        const vendor = item ? this.vendors.find((v) => v.vendor_id === item.vendor_id) : undefined;
        return {
          record_id: d.record_id,
          item_id: d.item_id,
          dish_name: item?.name || 'Unknown',
          category: item?.category || 'Special',
          is_veg: item?.is_veg ?? true,
          vendor_id: vendor?.vendor_id,
          vendor_name: vendor?.name || 'Unknown Mess',
          area_zone: vendor?.area_zone,
          date: d.date,
          meal_slot: d.meal_slot,
          daily_price: d.daily_price,
          stock_qty: d.stock_qty,
          special_note: d.special_note || ''
        };
      });

    this.logTelemetry({
      type: 'VIEW',
      sql: `SELECT * FROM Live_Menu_Customer_View ${slot ? `WHERE meal_slot = '${slot}'` : ''};`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: rows.length,
      details: 'Materialized customer abstraction: excluded zero-stock items and private vendor pricing columns.'
    });

    return rows;
  }

  /**
   * View 2: Vendor_Performance_Summary_View
   */
  public executeViewVendorPerformance() {
    const startTime = performance.now();
    const rows = this.vendors.map((v) => {
      const vendorOrders = this.orders.filter((o) => o.vendor_id === v.vendor_id);
      const successfulPayments = this.payments.filter((p) => {
        const ord = vendorOrders.find((o) => o.order_id === p.order_id);
        return ord && p.payment_status === 'Success';
      });
      const grossRev = successfulPayments.reduce((acc, p) => acc + p.amount, 0);
      const avgOrder = successfulPayments.length > 0 ? +(grossRev / successfulPayments.length).toFixed(2) : 0;
      const vReviews = this.reviews.filter((r) => r.vendor_id === v.vendor_id);
      const catalogCount = this.menuItems.filter((m) => m.vendor_id === v.vendor_id).length;

      return {
        vendor_id: v.vendor_id,
        vendor_name: v.name,
        area_zone: v.area_zone,
        rating: v.rating,
        is_open: v.is_open,
        total_catalog_dishes: catalogCount,
        total_orders_placed: vendorOrders.length,
        gross_revenue_inr: grossRev,
        avg_order_value_inr: avgOrder,
        review_count: vReviews.length
      };
    });

    this.logTelemetry({
      type: 'VIEW',
      sql: `SELECT * FROM Vendor_Performance_Summary_View ORDER BY gross_revenue_inr DESC;`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: rows.length,
      details: 'Aggregated cross-table metrics joining VENDORS, ORDERS, PAYMENTS, REVIEWS and MENU_ITEMS.'
    });

    return rows;
  }

  /**
   * View 3: Tiffin_Delivery_Dispatch_View
   */
  public executeViewTiffinDispatch() {
    const startTime = performance.now();
    const tiffinOrders = this.orders.filter(
      (o) => o.order_mode === 'Tiffin Delivery' && o.order_status !== 'Completed' && o.order_status !== 'Cancelled'
    );

    const rows = tiffinOrders.map((o) => {
      const cust = this.customers.find((c) => c.cust_id === o.cust_id);
      const vendor = this.vendors.find((v) => v.vendor_id === o.vendor_id);
      const tracking = this.deliveryTracking.find((t) => t.order_id === o.order_id);
      const agent = tracking?.agent_id ? this.deliveryAgents.find((a) => a.agent_id === tracking.agent_id) : null;
      const payment = this.payments.find((p) => p.order_id === o.order_id);

      return {
        track_id: tracking?.track_id || 0,
        order_id: o.order_id,
        student_name: cust?.name || 'Student',
        student_phone: cust?.phone || '',
        delivery_address: cust?.address || '',
        mess_name: vendor?.name || 'Mess',
        mess_zone: vendor?.area_zone || '',
        mess_phone: vendor?.phone || '',
        final_price: o.final_price,
        order_status: o.order_status,
        delivery_status: tracking?.delivery_status || 'Pending',
        eta_minutes: tracking?.eta_minutes ?? 18,
        assigned_agent_name: agent?.name || 'Awaiting Agent Assignment',
        agent_phone: agent?.phone || 'N/A',
        payment_status: payment?.payment_status || 'Pending',
        order_time: o.created_at
      };
    });

    this.logTelemetry({
      type: 'VIEW',
      sql: `SELECT * FROM Tiffin_Delivery_Dispatch_View;`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: rows.length,
      details: 'Active logistics view joining ORDERS, CUSTOMERS, VENDORS, DELIVERY_TRACKING, and AGENTS.'
    });

    return rows;
  }

  /**
   * View 4: Dynamic_Pricing_Audit_View
   */
  public executeViewDynamicPricingAudit() {
    const startTime = performance.now();
    const rows = this.dailyAvailability.map((d) => {
      const item = this.menuItems.find((m) => m.item_id === d.item_id);
      const vendor = item ? this.vendors.find((v) => v.vendor_id === item.vendor_id) : undefined;
      const basePrice = item?.base_price || d.daily_price;
      const delta = +(d.daily_price - basePrice).toFixed(2);
      const surgePercent = +(((d.daily_price - basePrice) / basePrice) * 100).toFixed(1);

      let urgencyLevel = 'SURPLUS_HIGH_STOCK';
      if (d.stock_qty === 0) urgencyLevel = 'OUT_OF_STOCK';
      else if (d.stock_qty <= 5) urgencyLevel = 'CRITICAL_LAST_FEW';
      else if (d.stock_qty <= 20) urgencyLevel = 'MODERATE_FILLING_FAST';

      return {
        record_id: d.record_id,
        vendor_id: vendor?.vendor_id || 0,
        vendor_name: vendor?.name || 'Mess',
        dish_name: item?.name || 'Item',
        category: item?.category || 'Special',
        meal_slot: d.meal_slot,
        base_price: basePrice,
        daily_price: d.daily_price,
        price_delta: delta,
        surge_percentage: surgePercent,
        stock_qty: d.stock_qty,
        urgency_level: urgencyLevel,
        date: d.date
      };
    });

    this.logTelemetry({
      type: 'VIEW',
      sql: `SELECT * FROM Dynamic_Pricing_Audit_View ORDER BY urgency_level ASC;`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: rows.length,
      details: 'Dynamic price variance and inventory urgency evaluation computed against permanent base catalog.'
    });

    return rows;
  }

  // ====================================================================
  // SECTION B: 4 STORED PROCEDURES
  // ====================================================================

  /**
   * Stored Procedure 1: sp_PlaceAtomicOrderWithStockDeduction
   * Guarantees ZERO overselling with simulated SELECT ... FOR UPDATE exclusive row lock
   */
  public sp_PlaceAtomicOrderWithStockDeduction(params: {
    cust_id: number;
    vendor_id: number;
    record_id: number;
    quantity: number;
    order_mode: 'Dine-In Token' | 'Tiffin Delivery';
    promo_code?: string;
    payment_method: 'UPI' | 'Campus Wallet' | 'Cash at Mess' | 'Card';
    simulateThreadDelayMs?: number; // for concurrency demonstration
  }): {
    success: boolean;
    order_id: number;
    status: string;
    message: string;
    final_price: number;
    stock_remaining: number;
  } {
    const startTime = performance.now();
    const txId = 'tx_' + Math.random().toString(36).substring(2, 7);

    // Concurrency Lock Check: Is another transaction holding this row lock?
    if (this.activeRowLocks.has(params.record_id)) {
      const existing = this.activeRowLocks.get(params.record_id)!;
      this.logTelemetry({
        type: 'LOCK',
        sql: `-- [DEADLOCK / CONTENTION PREVENTED] Row record_id=${params.record_id} is currently locked by ${existing.transactionId}.\n-- Requesting tx: ${txId}`,
        executionTimeMs: 0.8,
        affectedRows: 0,
        lockStatus: 'ROW_EXCLUSIVE_LOCKED',
        details: 'Row lock contention detected! Transaction blocked until lock release.'
      });
    }

    // ACQUIRE EXCLUSIVE ROW-LEVEL LOCK
    this.activeRowLocks.set(params.record_id, { lockedAt: Date.now(), transactionId: txId });
    this.logTelemetry({
      type: 'LOCK',
      sql: `START TRANSACTION;\nSELECT stock_qty, daily_price FROM DAILY_AVAILABILITY WHERE record_id = ${params.record_id} FOR UPDATE;`,
      executionTimeMs: 1.1,
      affectedRows: 1,
      lockStatus: 'ROW_EXCLUSIVE_LOCKED',
      details: `Acquired EXCLUSIVE ROW-LEVEL LOCK on DAILY_AVAILABILITY [record_id=${params.record_id}]`
    });

    const targetAvailability = this.dailyAvailability.find((d) => d.record_id === params.record_id);

    if (!targetAvailability) {
      this.activeRowLocks.delete(params.record_id);
      this.logTelemetry({
        type: 'TRANSACTION',
        sql: `ROLLBACK; -- Record not found`,
        executionTimeMs: 0.5,
        affectedRows: 0,
        lockStatus: 'ROLLBACK'
      });
      return {
        success: false,
        order_id: 0,
        status: 'NOT_FOUND',
        message: 'Menu item availability record not found.',
        final_price: 0,
        stock_remaining: 0
      };
    }

    // CHECK OVERSELLING / STOCK
    if (targetAvailability.stock_qty < params.quantity) {
      this.activeRowLocks.delete(params.record_id);
      this.logTelemetry({
        type: 'TRANSACTION',
        sql: `ROLLBACK; -- Insufficient stock: requested ${params.quantity}, available ${targetAvailability.stock_qty}`,
        executionTimeMs: 1.0,
        affectedRows: 0,
        lockStatus: 'ROLLBACK',
        details: 'Zero Oversell Guarantee Triggered: Transaction rolled back to maintain integrity.'
      });
      return {
        success: false,
        order_id: 0,
        status: 'OUT_OF_STOCK',
        message: `Insufficient stock! Only ${targetAvailability.stock_qty} plate(s) remaining.`,
        final_price: 0,
        stock_remaining: targetAvailability.stock_qty
      };
    }

    // Calculate Pricing & Apply Promo
    const rawTotal = +(targetAvailability.daily_price * params.quantity).toFixed(2);
    let discount = 0;
    if (params.promo_code && params.promo_code.trim()) {
      const promo = this.promotions.find(
        (p) =>
          p.code.toUpperCase() === params.promo_code!.trim().toUpperCase() &&
          p.vendor_id === params.vendor_id &&
          p.is_active
      );
      if (promo && rawTotal >= promo.min_order) {
        discount = promo.discount_amount;
      }
    }
    const finalPrice = Math.max(1, +(rawTotal - discount).toFixed(2));

    // DEDUCT STOCK (Enforces trg_prevent_negative_stock)
    targetAvailability.stock_qty -= params.quantity;

    // INSERT ORDER
    const newOrderId = (this.orders.length > 0 ? Math.max(...this.orders.map((o) => o.order_id)) : 0) + 1;
    const menuItem = this.menuItems.find((m) => m.item_id === targetAvailability.item_id);
    const vendor = this.vendors.find((v) => v.vendor_id === params.vendor_id);

    const newOrder: Order = {
      order_id: newOrderId,
      cust_id: params.cust_id,
      vendor_id: params.vendor_id,
      order_mode: params.order_mode,
      final_price: finalPrice,
      order_status: 'Confirmed',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      vendor_name: vendor?.name || 'Mess',
      items: [
        {
          dish_name: menuItem?.name || 'Dish',
          quantity: params.quantity,
          unit_price: targetAvailability.daily_price
        }
      ]
    };
    this.orders.unshift(newOrder);

    // INSERT ORDER_DETAILS
    const newDetailId = this.orderDetails.length + 1;
    this.orderDetails.push({
      detail_id: newDetailId,
      order_id: newOrderId,
      record_id: params.record_id,
      quantity: params.quantity,
      unit_price: targetAvailability.daily_price
    });

    // INSERT PAYMENT
    const newPayId = this.payments.length + 1;
    this.payments.push({
      payment_id: newPayId,
      order_id: newOrderId,
      amount: finalPrice,
      payment_method: params.payment_method,
      payment_status: 'Success',
      paid_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    // EXECUTE TRIGGER 6: trg_award_student_loyalty
    const customer = this.customers.find((c) => c.cust_id === params.cust_id);
    if (customer) {
      const earnedPoints = Math.floor(finalPrice / 20);
      customer.loyalty_points += earnedPoints;
      this.logTelemetry({
        type: 'TRIGGER',
        sql: `-- TRIGGER trg_award_student_loyalty FIRED!\nUPDATE CUSTOMERS SET loyalty_points = loyalty_points + ${earnedPoints} WHERE cust_id = ${customer.cust_id};`,
        executionTimeMs: 0.6,
        affectedRows: 1,
        details: `Awarded ${earnedPoints} VIT loyalty points for ₹${finalPrice} order.`
      });
    }

    // IF TIFFIN DELIVERY: ASSIGN AGENT AND INSERT DELIVERY_TRACKING
    if (params.order_mode === 'Tiffin Delivery') {
      const availableAgent = this.deliveryAgents.find((a) => a.is_available);
      if (availableAgent) {
        availableAgent.is_available = false;
      }
      const newTrackId = this.deliveryTracking.length + 1;
      this.deliveryTracking.unshift({
        track_id: newTrackId,
        order_id: newOrderId,
        agent_id: availableAgent?.agent_id || null,
        payment_id: newPayId,
        delivery_status: 'Assigned',
        eta_minutes: 18
      });
    }

    // RELEASE ROW-LEVEL LOCK AND COMMIT
    this.activeRowLocks.delete(params.record_id);

    this.logTelemetry({
      type: 'PROCEDURE',
      sql: `CALL sp_PlaceAtomicOrderWithStockDeduction(${params.cust_id}, ${params.vendor_id}, ${params.record_id}, ${params.quantity}, '${params.order_mode}', '${params.promo_code || ''}', '${params.payment_method}', @order_id, @status, @msg);\nCOMMIT;`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: 4,
      lockStatus: 'RELEASED',
      details: `Atomic transaction committed successfully. Stock deducted from ${targetAvailability.stock_qty + params.quantity} to ${targetAvailability.stock_qty}.`
    });

    this.notify();

    return {
      success: true,
      order_id: newOrderId,
      status: 'SUCCESS',
      message: `Order #${newOrderId} confirmed! ${targetAvailability.stock_qty} plates remaining.`,
      final_price: finalPrice,
      stock_remaining: targetAvailability.stock_qty
    };
  }

  /**
   * Stored Procedure 2: sp_VendorBatchDynamicPriceAdjust
   */
  public sp_VendorBatchDynamicPriceAdjust(params: {
    vendor_id: number;
    meal_slot: string; // 'Lunch' | 'Dinner' | 'ALL'
    surge_factor: number; // e.g., 15 for +15%
    min_stock_threshold: number; // e.g., 20
  }): { updated_count: number; message: string } {
    const startTime = performance.now();
    let updatedCount = 0;

    const vendorDishes = this.menuItems
      .filter((m) => m.vendor_id === params.vendor_id)
      .map((m) => m.item_id);

    this.dailyAvailability.forEach((d) => {
      if (
        vendorDishes.includes(d.item_id) &&
        (params.meal_slot === 'ALL' || d.meal_slot === params.meal_slot) &&
        d.stock_qty <= params.min_stock_threshold
      ) {
        const item = this.menuItems.find((m) => m.item_id === d.item_id);
        const base = item?.base_price || d.daily_price;
        let newPrice = +(d.daily_price * (1 + params.surge_factor / 100)).toFixed(2);

        // Bounded ceilings: [0.5 * base, 2.0 * base]
        if (newPrice > base * 2.0) newPrice = +(base * 2.0).toFixed(2);
        if (newPrice < base * 0.5) newPrice = +(base * 0.5).toFixed(2);

        d.daily_price = newPrice;
        d.special_note = `Dynamic Surge Active (+${params.surge_factor}%)`;
        updatedCount++;
      }
    });

    this.logTelemetry({
      type: 'PROCEDURE',
      sql: `CALL sp_VendorBatchDynamicPriceAdjust(${params.vendor_id}, '${params.meal_slot}', ${params.surge_factor}, ${params.min_stock_threshold}, @updated_count);`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: updatedCount,
      details: `Batch dynamic pricing cursor iterated. Adjusted ${updatedCount} items below threshold.`
    });

    this.notify();
    return {
      updated_count: updatedCount,
      message: `Successfully adjusted dynamic prices for ${updatedCount} dish(es).`
    };
  }

  /**
   * Stored Procedure 3: sp_CalculateStudentLoyaltyAndTier
   */
  public sp_CalculateStudentLoyaltyAndTier(cust_id: number): {
    tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    total_spend: number;
    eligible_discount: number;
    loyalty_points: number;
  } {
    const startTime = performance.now();
    const cust = this.customers.find((c) => c.cust_id === cust_id);
    const pts = cust?.loyalty_points || 0;

    const studentOrders = this.orders.filter(
      (o) => o.cust_id === cust_id && (o.order_status === 'Confirmed' || o.order_status === 'Completed')
    );
    const totalSpend = studentOrders.reduce((sum, o) => sum + o.final_price, 0);

    let tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' = 'BRONZE';
    let eligibleDiscount = 5.0;

    if (pts >= 500 || totalSpend >= 2500) {
      tier = 'PLATINUM';
      eligibleDiscount = 25.0;
    } else if (pts >= 200 || totalSpend >= 1000) {
      tier = 'GOLD';
      eligibleDiscount = 15.0;
    } else if (pts >= 50 || totalSpend >= 300) {
      tier = 'SILVER';
      eligibleDiscount = 10.0;
    }

    this.logTelemetry({
      type: 'PROCEDURE',
      sql: `CALL sp_CalculateStudentLoyaltyAndTier(${cust_id}, @tier, @spend, @discount);\n-- Results: @tier='${tier}', @spend=₹${totalSpend}, @discount=${eligibleDiscount}%`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: 1,
      details: `Student loyalty evaluation: ${pts} points -> ${tier} tier.`
    });

    return {
      tier,
      total_spend: totalSpend,
      eligible_discount: eligibleDiscount,
      loyalty_points: pts
    };
  }

  /**
   * Stored Procedure 4: sp_VendorDailyEndMealFlashSale
   */
  public sp_VendorDailyEndMealFlashSale(params: {
    vendor_id: number;
    meal_slot: string;
    discount_percent: number;
  }): { items_discounted: number; message: string } {
    const startTime = performance.now();
    let count = 0;

    const vendorDishes = this.menuItems
      .filter((m) => m.vendor_id === params.vendor_id)
      .map((m) => m.item_id);

    this.dailyAvailability.forEach((d) => {
      if (vendorDishes.includes(d.item_id) && d.meal_slot === params.meal_slot && d.stock_qty > 0) {
        const discounted = +(d.daily_price * (1 - params.discount_percent / 100.0)).toFixed(2);
        d.daily_price = Math.max(20, discounted);
        d.special_note = `[FLASH SALE ${params.discount_percent}% OFF] End-of-meal zero food waste clearance!`;
        count++;
      }
    });

    this.logTelemetry({
      type: 'PROCEDURE',
      sql: `CALL sp_VendorDailyEndMealFlashSale(${params.vendor_id}, '${params.meal_slot}', ${params.discount_percent}, @items_discounted);`,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      affectedRows: count,
      details: `End-of-meal clearance activated: ${count} plates discounted by ${params.discount_percent}%.`
    });

    this.notify();
    return {
      items_discounted: count,
      message: `Flash clearance active on ${count} item(s)! Dynamic prices reduced by ${params.discount_percent}%.`
    };
  }

  // ====================================================================
  // SECTION C: 7 AUTOMATED DATABASE TRIGGERS
  // ====================================================================

  /**
   * Trigger 1: trg_vendor_after_insert_audit
   */
  public insertVendor(vendor: Omit<Vendor, 'vendor_id' | 'created_at'>): Vendor {
    const newId = Math.max(...this.vendors.map((v) => v.vendor_id), 0) + 1;
    const newVendor: Vendor = {
      ...vendor,
      vendor_id: newId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.vendors.push(newVendor);

    // TRIGGER FIRES
    const newAudit: VendorAudit = {
      audit_id: this.vendorAudit.length + 1,
      vendor_id: newId,
      action_type: 'INSERT',
      vendor_name: newVendor.name,
      logged_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.vendorAudit.unshift(newAudit);

    this.logTelemetry({
      type: 'TRIGGER',
      sql: `-- TRIGGER trg_vendor_after_insert_audit FIRED!\nINSERT INTO vendor_audit (vendor_id, action_type, vendor_name) VALUES (${newId}, 'INSERT', '${newVendor.name}');`,
      executionTimeMs: 0.8,
      affectedRows: 1,
      details: `Onboarding audit record created for new vendor #${newId}`
    });

    this.notify();
    return newVendor;
  }

  /**
   * Trigger 2: trg_vendor_after_update_city_trace
   */
  public updateVendorCity(vendor_id: number, newCity: string): boolean {
    const vendor = this.vendors.find((v) => v.vendor_id === vendor_id);
    if (!vendor) return false;

    if (vendor.city !== newCity) {
      const oldCity = vendor.city;
      vendor.city = newCity;

      // TRIGGER FIRES
      this.vendorCityTrace.unshift({
        trace_id: this.vendorCityTrace.length + 1,
        vendor_id,
        old_city: oldCity,
        new_city: newCity,
        changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      this.logTelemetry({
        type: 'TRIGGER',
        sql: `-- TRIGGER trg_vendor_after_update_city_trace FIRED!\nINSERT INTO vendor_city_trace (vendor_id, old_city, new_city) VALUES (${vendor_id}, '${oldCity}', '${newCity}');`,
        executionTimeMs: 0.7,
        affectedRows: 1,
        details: `Vendor relocation trace logged: '${oldCity}' -> '${newCity}'`
      });

      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Trigger 3: trg_vendor_before_delete_cold_retention
   */
  public deleteVendorWithColdRetention(vendor_id: number): boolean {
    const index = this.vendors.findIndex((v) => v.vendor_id === vendor_id);
    if (index === -1) return false;

    const vendor = this.vendors[index];

    // BEFORE DELETE TRIGGER FIRES
    this.vendorColdRetention.unshift({
      archive_id: this.vendorColdRetention.length + 1,
      vendor_id: vendor.vendor_id,
      name: vendor.name,
      phone: vendor.phone,
      city: vendor.city,
      deleted_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    this.logTelemetry({
      type: 'TRIGGER',
      sql: `-- TRIGGER trg_vendor_before_delete_cold_retention FIRED!\nINSERT INTO vendor_cold_retention_log (vendor_id, name, phone, city) VALUES (${vendor_id}, '${vendor.name}', '${vendor.phone}', '${vendor.city}');\nDELETE FROM VENDORS WHERE vendor_id = ${vendor_id};`,
      executionTimeMs: 1.2,
      affectedRows: 1,
      details: `Pre-delete trigger archived vendor to cold retention storage before removal.`
    });

    this.vendors.splice(index, 1);
    this.notify();
    return true;
  }

  /**
   * Trigger 4: trg_prevent_negative_stock
   */
  public updateDailyStock(record_id: number, newStock: number): { success: boolean; error?: string } {
    const record = this.dailyAvailability.find((d) => d.record_id === record_id);
    if (!record) return { success: false, error: 'Record not found' };

    // TRIGGER CHECK: IF NEW.stock_qty < 0 SIGNAL SQLSTATE '45000'
    if (newStock < 0) {
      this.logTelemetry({
        type: 'TRIGGER',
        sql: `-- TRIGGER trg_prevent_negative_stock REJECTED!\nSIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Integrity Violation: Daily plate stock quantity cannot be negative.';`,
        executionTimeMs: 0.4,
        affectedRows: 0,
        lockStatus: 'ROLLBACK',
        details: 'DBMS Check Violation: Negative stock rejected by trigger.'
      });
      return {
        success: false,
        error: "SQLSTATE '45000': Daily plate stock quantity cannot be negative."
      };
    }

    record.stock_qty = newStock;
    this.logTelemetry({
      type: 'UPDATE',
      sql: `UPDATE DAILY_AVAILABILITY SET stock_qty = ${newStock} WHERE record_id = ${record_id};`,
      executionTimeMs: 0.6,
      affectedRows: 1,
      details: `Plate stock updated to ${newStock}`
    });

    this.notify();
    return { success: true };
  }

  /**
   * Trigger 5: trg_auto_update_vendor_rating
   */
  public addReview(review: Omit<Review, 'review_id' | 'created_at'>): Review {
    const newId = this.reviews.length + 1;
    const newRev: Review = {
      ...review,
      review_id: newId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.reviews.unshift(newRev);

    // TRIGGER FIRES: Recalculates average rating
    const vendorReviews = this.reviews.filter((r) => r.vendor_id === review.vendor_id);
    const avg = +(vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length).toFixed(2);

    const vendor = this.vendors.find((v) => v.vendor_id === review.vendor_id);
    if (vendor) {
      vendor.rating = avg;
    }

    this.logTelemetry({
      type: 'TRIGGER',
      sql: `-- TRIGGER trg_auto_update_vendor_rating FIRED!\nUPDATE VENDORS SET rating = (SELECT ROUND(AVG(rating), 2) FROM REVIEWS WHERE vendor_id = ${review.vendor_id}) WHERE vendor_id = ${review.vendor_id};`,
      executionTimeMs: 0.9,
      affectedRows: 1,
      details: `Vendor rating dynamically updated to ${avg} based on ${vendorReviews.length} verified reviews.`
    });

    this.notify();
    return newRev;
  }

  /**
   * Trigger 7: trg_delivery_auto_assign_completion
   */
  public updateDeliveryStatus(track_id: number, status: 'Assigned' | 'Picked Up' | 'Out for Delivery' | 'Delivered') {
    const tracking = this.deliveryTracking.find((t) => t.track_id === track_id);
    if (!tracking) return;

    const oldStatus = tracking.delivery_status;
    tracking.delivery_status = status;

    if (status === 'Delivered' && oldStatus !== 'Delivered') {
      tracking.eta_minutes = 0;
      const order = this.orders.find((o) => o.order_id === tracking.order_id);
      if (order) {
        order.order_status = 'Completed';
      }

      if (tracking.agent_id) {
        const agent = this.deliveryAgents.find((a) => a.agent_id === tracking.agent_id);
        if (agent) {
          agent.is_available = true;
        }
      }

      this.logTelemetry({
        type: 'TRIGGER',
        sql: `-- TRIGGER trg_delivery_auto_assign_completion FIRED!\nUPDATE ORDERS SET order_status = 'Completed' WHERE order_id = ${tracking.order_id};\nUPDATE DELIVERY_AGENTS SET is_available = TRUE WHERE agent_id = ${tracking.agent_id};`,
        executionTimeMs: 1.1,
        affectedRows: 2,
        details: 'Delivery workflow trigger completed: Order finalized and delivery partner freed for next dispatch.'
      });
    } else {
      this.logTelemetry({
        type: 'UPDATE',
        sql: `UPDATE DELIVERY_TRACKING SET delivery_status = '${status}' WHERE track_id = ${track_id};`,
        executionTimeMs: 0.5,
        affectedRows: 1
      });
    }

    this.notify();
  }

  // ====================================================================
  // SECTION D: SEMIJOIN & ANTI-SEMIJOIN QUERY EXECUTOR
  // ====================================================================

  public executeSemijoinQuery() {
    const startTime = performance.now();
    // VENDORS where EXISTS in DAILY_AVAILABILITY with stock > 0
    const results = this.vendors.filter((v) => {
      const vItems = this.menuItems.filter((m) => m.vendor_id === v.vendor_id).map((m) => m.item_id);
      return this.dailyAvailability.some(
        (d) => vItems.includes(d.item_id) && d.meal_slot === 'Lunch' && d.stock_qty > 0
      );
    });

    const executionPlan = {
      type: 'SEMIJOIN (FirstMatch / LooseScan)',
      query: `SELECT v.vendor_id, v.name, v.area_zone, v.rating\nFROM VENDORS v\nWHERE EXISTS (\n    SELECT 1 FROM MENU_ITEMS m\n    JOIN DAILY_AVAILABILITY d ON m.item_id = d.item_id\n    WHERE m.vendor_id = v.vendor_id\n      AND d.meal_slot = 'Lunch'\n      AND d.stock_qty > 0\n);`,
      optimizerStrategy: 'FirstMatch (Evaluates subquery and halts at first match per vendor, eliminating duplicates without sort/group overhead)',
      scannedRows: results.length,
      timeMs: +(performance.now() - startTime).toFixed(2),
      results
    };

    this.logTelemetry({
      type: 'SELECT',
      sql: executionPlan.query,
      executionTimeMs: executionPlan.timeMs,
      affectedRows: results.length,
      details: 'Semijoin optimization: deduplication achieved via EXISTS subquery strategy.'
    });

    return executionPlan;
  }

  public executeAntiSemijoinQuery() {
    const startTime = performance.now();
    // CUSTOMERS where NOT EXISTS in ORDERS
    const results = this.customers.filter((c) => {
      return !this.orders.some((o) => o.cust_id === c.cust_id);
    });

    const executionPlan = {
      type: 'ANTI-SEMIJOIN (NOT EXISTS / Not-In-Subquery)',
      query: `SELECT c.cust_id, c.regd_no, c.name, c.course, c.phone\nFROM CUSTOMERS c\nWHERE NOT EXISTS (\n    SELECT 1 FROM ORDERS o\n    WHERE o.cust_id = c.cust_id\n);`,
      optimizerStrategy: 'Anti-Semijoin Hash-Lookup (Identifies registered students who have never placed an order without NULL-check joins)',
      scannedRows: results.length,
      timeMs: +(performance.now() - startTime).toFixed(2),
      results
    };

    this.logTelemetry({
      type: 'SELECT',
      sql: executionPlan.query,
      executionTimeMs: executionPlan.timeMs,
      affectedRows: results.length,
      details: 'Anti-Semijoin identification of dormant student accounts.'
    });

    return executionPlan;
  }

  // ====================================================================
  // VENDOR CONTROLS (Mess Owner View Actions)
  // ====================================================================

  public updateDailyPrice(record_id: number, newPrice: number) {
    const record = this.dailyAvailability.find((d) => d.record_id === record_id);
    if (!record || newPrice <= 0) return;

    record.daily_price = newPrice;
    this.logTelemetry({
      type: 'UPDATE',
      sql: `UPDATE DAILY_AVAILABILITY SET daily_price = ${newPrice.toFixed(2)} WHERE record_id = ${record_id};`,
      executionTimeMs: 0.6,
      affectedRows: 1,
      details: `Daily dynamic price adjusted to ₹${newPrice.toFixed(2)}`
    });

    this.notify();
  }

  public toggleVendorOpenStatus(vendor_id: number) {
    const vendor = this.vendors.find((v) => v.vendor_id === vendor_id);
    if (!vendor) return;

    vendor.is_open = !vendor.is_open;
    this.logTelemetry({
      type: 'UPDATE',
      sql: `UPDATE VENDORS SET is_open = ${vendor.is_open ? 'TRUE' : 'FALSE'} WHERE vendor_id = ${vendor_id};`,
      executionTimeMs: 0.5,
      affectedRows: 1,
      details: `Vendor operational status switched to ${vendor.is_open ? 'OPEN' : 'CLOSED'}`
    });

    this.notify();
  }

  public updateOrderStatus(order_id: number, status: Order['order_status']) {
    const order = this.orders.find((o) => o.order_id === order_id);
    if (!order) return;

    order.order_status = status;
    this.logTelemetry({
      type: 'UPDATE',
      sql: `UPDATE ORDERS SET order_status = '${status}' WHERE order_id = ${order_id};`,
      executionTimeMs: 0.6,
      affectedRows: 1,
      details: `Order #${order_id} moved to status: ${status}`
    });

    this.notify();
  }

  // Reset to initial clean state
  public resetDatabase() {
    this.vendors = [...INITIAL_VENDORS];
    this.promotions = [...INITIAL_PROMOTIONS];
    this.menuItems = [...INITIAL_MENU_ITEMS];
    this.dailyAvailability = [...INITIAL_DAILY_AVAILABILITY];
    this.customers = [...INITIAL_CUSTOMERS];
    this.reviews = [...INITIAL_REVIEWS];
    this.orders = [...INITIAL_ORDERS];
    this.orderDetails = [...INITIAL_ORDER_DETAILS];
    this.payments = [...INITIAL_PAYMENTS];
    this.deliveryAgents = [...INITIAL_DELIVERY_AGENTS];
    this.deliveryTracking = [...INITIAL_DELIVERY_TRACKING];
    this.vendorAudit = [...INITIAL_VENDOR_AUDIT];
    this.vendorCityTrace = [];
    this.vendorColdRetention = [];
    this.activeRowLocks.clear();

    this.logTelemetry({
      type: 'TRANSACTION',
      sql: `-- Database reseeded to default VIT Pune production dataset.\n-- All row locks cleared, triggers and views reset.`,
      executionTimeMs: 1.5,
      affectedRows: 0,
      lockStatus: 'RELEASED'
    });

    this.notify();
  }
}

export const db = new DbEngine();
