import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { Database, Eye, Play, Sparkles, CheckCircle2 } from 'lucide-react';

export const ViewInspector: React.FC = () => {
  const [activeView, setActiveView] = useState<1 | 2 | 3 | 4>(1);

  const viewDefinitions = {
    1: {
      name: 'Live_Menu_Customer_View',
      type: 'Single-Table Read-Only Abstraction',
      description: 'Abstracts DAILY_AVAILABILITY for campus students, automatically hiding dishes with 0 stock and shielding vendor cost margins and private operational metadata.',
      sql: `CREATE OR REPLACE VIEW Live_Menu_Customer_View AS
SELECT record_id, item_id, date, meal_slot, daily_price, stock_qty, special_note
FROM DAILY_AVAILABILITY
WHERE date = CURDATE() AND stock_qty > 0;`,
      getData: () => db.executeViewLiveMenuCustomer()
    },
    2: {
      name: 'Vendor_Performance_Summary_View',
      type: 'Multi-Table Analytical Aggregate View',
      description: 'Materializes operational business intelligence across 4 tables (VENDORS, ORDERS, PAYMENTS, REVIEWS) computing total gross revenue, average ticket size, and catalog depth.',
      sql: `CREATE OR REPLACE VIEW Vendor_Performance_Summary_View AS
SELECT 
    v.vendor_id, v.name AS vendor_name, v.area_zone, v.rating, v.is_open,
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
GROUP BY v.vendor_id, v.name, v.area_zone, v.rating, v.is_open;`,
      getData: () => db.executeViewVendorPerformance()
    },
    3: {
      name: 'Tiffin_Delivery_Dispatch_View',
      type: 'Active Logistics & Dispatch View',
      description: 'Joins 5 relational tables (ORDERS, CUSTOMERS, VENDORS, DELIVERY_TRACKING, AGENTS) for hostel delivery dispatch, isolating in-flight campus deliveries and real-time ETAs.',
      sql: `CREATE OR REPLACE VIEW Tiffin_Delivery_Dispatch_View AS
SELECT 
    t.track_id, o.order_id, c.name AS student_name, c.phone AS student_phone,
    c.address AS delivery_address, v.name AS mess_name, v.area_zone AS mess_zone,
    o.final_price, o.order_status, t.delivery_status, t.eta_minutes,
    a.name AS assigned_agent_name, a.phone AS agent_phone, p.payment_status
FROM ORDERS o
JOIN CUSTOMERS c ON o.cust_id = c.cust_id
JOIN VENDORS v ON o.vendor_id = v.vendor_id
JOIN DELIVERY_TRACKING t ON o.order_id = t.order_id
LEFT JOIN DELIVERY_AGENTS a ON t.agent_id = a.agent_id
LEFT JOIN PAYMENTS p ON o.order_id = p.order_id
WHERE o.order_mode = 'Tiffin Delivery' AND o.order_status NOT IN ('Completed', 'Cancelled');`,
      getData: () => db.executeViewTiffinDispatch()
    },
    4: {
      name: 'Dynamic_Pricing_Audit_View',
      type: 'Inventory Urgency & Dynamic Variance View',
      description: 'Computes real-time price deltas against base catalog pricing, calculating dynamic surge/discount percentages and classifying plate stock into urgency tiers.',
      sql: `CREATE OR REPLACE VIEW Dynamic_Pricing_Audit_View AS
SELECT 
    d.record_id, v.name AS vendor_name, m.name AS dish_name, m.category, d.meal_slot,
    m.base_price, d.daily_price,
    (d.daily_price - m.base_price) AS price_delta,
    ROUND(((d.daily_price - m.base_price) / m.base_price) * 100, 1) AS surge_percentage,
    d.stock_qty,
    CASE 
        WHEN d.stock_qty = 0 THEN 'OUT_OF_STOCK'
        WHEN d.stock_qty <= 5 THEN 'CRITICAL_LAST_FEW'
        WHEN d.stock_qty <= 20 THEN 'MODERATE_FILLING_FAST'
        ELSE 'SURPLUS_HIGH_STOCK'
    END AS urgency_level
FROM DAILY_AVAILABILITY d
JOIN MENU_ITEMS m ON d.item_id = m.item_id
JOIN VENDORS v ON m.vendor_id = v.vendor_id
WHERE d.date = CURDATE();`,
      getData: () => db.executeViewDynamicPricingAudit()
    }
  };

  const selectedDef = viewDefinitions[activeView];
  const tableData = selectedDef.getData();
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="space-y-6">
      {/* 4 View Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(viewDefinitions) as unknown as Array<1 | 2 | 3 | 4>).map((key) => {
          const v = viewDefinitions[key];
          const isSelected = activeView === key;

          return (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-[#1E1916] to-[#14110F] border-[#FF9F1C] shadow-lg shadow-[#FF9F1C]/20'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#FF9F1C] font-bold">VIEW {key}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2EC4B6]" />}
              </div>
              <div className="font-bold text-xs font-mono text-white truncate">{v.name}</div>
              <div className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{v.type}</div>
            </button>
          );
        })}
      </div>

      {/* SQL Definition Box */}
      <div className="p-5 rounded-2xl bg-[#0B0908] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#2EC4B6]" />
            <h4 className="text-sm font-bold font-syne text-white">{selectedDef.name}</h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2EC4B6]/15 text-[#2EC4B6] border border-[#2EC4B6]/30">
            {selectedDef.type}
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed font-sans">{selectedDef.description}</p>

        <div className="relative">
          <pre className="p-3.5 rounded-xl bg-black/70 border border-white/5 text-[11px] font-mono text-[#FFB84D] overflow-x-auto leading-relaxed">
            <code>{selectedDef.sql}</code>
          </pre>
        </div>
      </div>

      {/* Materialized Result Table */}
      <div className="p-5 rounded-2xl glass-panel border border-[#FF9F1C]/20 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-mono text-white font-bold flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#FF9F1C]" />
            Materialized View Output ({tableData.length} rows returned)
          </h5>
          <span className="text-[10px] font-mono text-neutral-400">Live query executed against DBMS memory state</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#14110F] sticky top-0 border-b border-white/10 text-neutral-400">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="p-2.5 font-bold whitespace-nowrap uppercase text-[10px]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#0B0908]">
              {tableData.map((row: any, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                  {columns.map((col) => (
                    <td key={col} className="p-2.5 whitespace-nowrap text-neutral-300">
                      {typeof row[col] === 'boolean'
                        ? row[col] ? 'TRUE' : 'FALSE'
                        : String(row[col] ?? 'NULL')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
