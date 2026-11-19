import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { Play, Sparkles, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';

export const StoredProcRunner: React.FC = () => {
  const [selectedProc, setSelectedProc] = useState<1 | 2 | 3 | 4>(1);
  const [procOutput, setProcOutput] = useState<any>(null);

  // Proc 1 state
  const [p1Quantity, setP1Quantity] = useState(2);
  const [p1Promo, setP1Promo] = useState('VITIAN20');
  const [p1Mode, setP1Mode] = useState<'Dine-In Token' | 'Tiffin Delivery'>('Dine-In Token');

  // Proc 2 state
  const [p2Surge, setP2Surge] = useState(20);
  const [p2Threshold, setP2Threshold] = useState(20);

  // Proc 3 state
  const [p3CustId, setP3CustId] = useState(1);

  // Proc 4 state
  const [p4Discount, setP4Discount] = useState(30);

  const runProc1 = () => {
    // Annapurna Mess, record 1
    const res = db.sp_PlaceAtomicOrderWithStockDeduction({
      cust_id: 1,
      vendor_id: 1,
      record_id: 1,
      quantity: p1Quantity,
      order_mode: p1Mode,
      promo_code: p1Promo,
      payment_method: 'UPI'
    });
    setProcOutput({
      procedure: 'sp_PlaceAtomicOrderWithStockDeduction',
      parameters: {
        IN_cust_id: 1,
        IN_vendor_id: 1,
        IN_record_id: 1,
        IN_quantity: p1Quantity,
        IN_order_mode: p1Mode,
        IN_promo_code: p1Promo,
        IN_payment_method: 'UPI'
      },
      outVariables: {
        '@p_order_id': res.order_id,
        '@p_status': res.status,
        '@p_message': res.message,
        'final_price_charged': `₹${res.final_price}`,
        'remaining_stock': res.stock_remaining
      },
      success: res.success
    });
  };

  const runProc2 = () => {
    const res = db.sp_VendorBatchDynamicPriceAdjust({
      vendor_id: 1,
      meal_slot: 'ALL',
      surge_factor: p2Surge,
      min_stock_threshold: p2Threshold
    });
    setProcOutput({
      procedure: 'sp_VendorBatchDynamicPriceAdjust',
      parameters: {
        IN_vendor_id: 1,
        IN_meal_slot: 'ALL',
        IN_surge_factor: p2Surge,
        IN_min_stock_threshold: p2Threshold
      },
      outVariables: {
        '@p_updated_count': res.updated_count,
        '@message': res.message
      },
      success: true
    });
  };

  const runProc3 = () => {
    const res = db.sp_CalculateStudentLoyaltyAndTier(p3CustId);
    setProcOutput({
      procedure: 'sp_CalculateStudentLoyaltyAndTier',
      parameters: {
        IN_cust_id: p3CustId
      },
      outVariables: {
        '@p_tier': res.tier,
        '@p_total_spend': `₹${res.total_spend.toFixed(2)}`,
        '@p_eligible_discount': `${res.eligible_discount}%`,
        'loyalty_points': res.loyalty_points
      },
      success: true
    });
  };

  const runProc4 = () => {
    const res = db.sp_VendorDailyEndMealFlashSale({
      vendor_id: 1,
      meal_slot: 'Lunch',
      discount_percent: p4Discount
    });
    setProcOutput({
      procedure: 'sp_VendorDailyEndMealFlashSale',
      parameters: {
        IN_vendor_id: 1,
        IN_meal_slot: 'Lunch',
        IN_discount_percent: p4Discount
      },
      outVariables: {
        '@p_items_discounted': res.items_discounted,
        '@message': res.message
      },
      success: true
    });
  };

  return (
    <div className="space-y-6">
      {/* 4 Procedure Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            id: 1 as const,
            name: 'sp_PlaceAtomicOrderWithStockDeduction',
            tag: 'ACID & Row-Lock',
            desc: 'Places order with SELECT FOR UPDATE row-level lock and promo validation'
          },
          {
            id: 2 as const,
            name: 'sp_VendorBatchDynamicPriceAdjust',
            tag: 'Dynamic Pricing Cursor',
            desc: 'Batch adjusts prices based on inventory threshold with bounded ceilings'
          },
          {
            id: 3 as const,
            name: 'sp_CalculateStudentLoyaltyAndTier',
            tag: 'Tier Evaluation',
            desc: 'Aggregates student order spend and computes loyalty tier discount'
          },
          {
            id: 4 as const,
            name: 'sp_VendorDailyEndMealFlashSale',
            tag: 'Clearance Procedure',
            desc: 'End-of-meal inventory clearance to eliminate student food waste'
          }
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedProc(p.id);
              setProcOutput(null);
            }}
            className={`p-4 rounded-2xl text-left border transition-all ${
              selectedProc === p.id
                ? 'bg-gradient-to-br from-[#1E1916] to-[#14110F] border-[#FF9F1C] shadow-lg shadow-[#FF9F1C]/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#FF9F1C] font-bold">PROCEDURE {p.id}</span>
              {selectedProc === p.id && <CheckCircle2 className="w-4 h-4 text-[#2EC4B6]" />}
            </div>
            <div className="font-bold text-xs font-mono text-white truncate">{p.name}</div>
            <div className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Interactive Parameter Controls for Selected Procedure */}
      <div className="p-6 rounded-2xl glass-panel border border-[#FF9F1C]/20 space-y-4">
        <h4 className="text-sm font-bold font-syne text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#FF9F1C]" />
          Configure IN Parameters & Execute Stored Procedure
        </h4>

        {selectedProc === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="text-neutral-400 block mb-1">p_quantity (INT):</label>
              <input
                type="number"
                min={1}
                max={50}
                value={p1Quantity}
                onChange={(e) => setP1Quantity(Number(e.target.value))}
                className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">p_order_mode (VARCHAR):</label>
              <select
                value={p1Mode}
                onChange={(e) => setP1Mode(e.target.value as any)}
                className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-white"
              >
                <option value="Dine-In Token">Dine-In Token</option>
                <option value="Tiffin Delivery">Tiffin Delivery</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">p_promo_code (VARCHAR):</label>
              <input
                type="text"
                value={p1Promo}
                onChange={(e) => setP1Promo(e.target.value)}
                placeholder="VITIAN20"
                className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        )}

        {selectedProc === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-neutral-400 block mb-1">p_surge_factor (DECIMAL):</label>
              <input
                type="number"
                min={5}
                max={50}
                value={p2Surge}
                onChange={(e) => setP2Surge(Number(e.target.value))}
                className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">p_min_stock_threshold (INT):</label>
              <input
                type="number"
                min={1}
                max={50}
                value={p2Threshold}
                onChange={(e) => setP2Threshold(Number(e.target.value))}
                className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        )}

        {selectedProc === 3 && (
          <div className="text-xs font-mono max-w-xs">
            <label className="text-neutral-400 block mb-1">p_cust_id (INT):</label>
            <select
              value={p3CustId}
              onChange={(e) => setP3CustId(Number(e.target.value))}
              className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-white"
            >
              {db.getCustomers().map((c) => (
                <option key={c.cust_id} value={c.cust_id}>
                  {c.name} ({c.regd_no})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedProc === 4 && (
          <div className="text-xs font-mono max-w-xs">
            <label className="text-neutral-400 block mb-1">p_discount_percent (DECIMAL):</label>
            <input
              type="number"
              min={10}
              max={60}
              value={p4Discount}
              onChange={(e) => setP4Discount(Number(e.target.value))}
              className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>
        )}

        <button
          onClick={() => {
            if (selectedProc === 1) runProc1();
            else if (selectedProc === 2) runProc2();
            else if (selectedProc === 3) runProc3();
            else if (selectedProc === 4) runProc4();
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-xs shadow-lg shadow-[#FF9F1C]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>CALL Stored Procedure</span>
        </button>
      </div>

      {/* Execution Results & OUT Variables Panel */}
      {procOutput && (
        <div className="p-5 rounded-2xl bg-[#0B0908] border border-[#2EC4B6]/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#2EC4B6] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Procedure Execution Success • OUT Parameters Received
            </span>
            <span className="text-[10px] font-mono text-neutral-400">MySQL 8.0 Protocol</span>
          </div>

          <pre className="p-4 rounded-xl bg-black/80 border border-white/5 text-xs font-mono text-neutral-200 overflow-x-auto">
            {JSON.stringify(procOutput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
