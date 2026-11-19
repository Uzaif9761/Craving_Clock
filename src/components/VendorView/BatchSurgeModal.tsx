import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { MealSlot, Vendor } from '../../types';
import { X, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

interface BatchSurgeModalProps {
  vendor: Vendor;
  activeSlot: MealSlot;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const BatchSurgeModal: React.FC<BatchSurgeModalProps> = ({
  vendor,
  activeSlot,
  onClose,
  onSuccess
}) => {
  const [surgeFactor, setSurgeFactor] = useState(15);
  const [minThreshold, setMinThreshold] = useState(20);
  const [targetSlot, setTargetSlot] = useState<string>(activeSlot);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = db.sp_VendorBatchDynamicPriceAdjust({
      vendor_id: vendor.vendor_id,
      meal_slot: targetSlot,
      surge_factor: surgeFactor,
      min_stock_threshold: minThreshold
    });

    setIsSubmitting(false);
    onSuccess(result.updated_count);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-6 border border-[#FF9F1C]/30 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF9F1C]" />
            <h3 className="text-lg font-bold font-syne text-white">Batch Dynamic Pricing Engine</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-mono text-neutral-300">
            Executes <strong>sp_VendorBatchDynamicPriceAdjust</strong> cursor in MySQL 8.0 to dynamically recalculate prices for dishes facing peak demand or shortage.
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1.5">TARGET MEAL WINDOW:</label>
            <select
              value={targetSlot}
              onChange={(e) => setTargetSlot(e.target.value)}
              className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF9F1C]"
            >
              <option value="ALL">ALL SLOTS</option>
              <option value="Breakfast">Breakfast (07:30–10:30)</option>
              <option value="Lunch">Lunch (12:00–15:00)</option>
              <option value="Snacks">Evening Snacks (16:30–18:30)</option>
              <option value="Dinner">Dinner (19:30–22:30)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-neutral-400">SURGE PERCENTAGE FACTOR:</span>
              <span className="text-[#FF9F1C] font-bold">+{surgeFactor}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={surgeFactor}
              onChange={(e) => setSurgeFactor(Number(e.target.value))}
              className="w-full accent-[#FF9F1C]"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>+5% (Mild)</span>
              <span>+20% (Standard Peak)</span>
              <span>+40% (Max Ceiling)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-neutral-400">STOCK INVENTORY THRESHOLD:</span>
              <span className="text-white font-bold">&lt;= {minThreshold} plates left</span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={5}
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-full accent-[#FF9F1C]"
            />
            <p className="text-[10px] font-mono text-neutral-500 mt-1">
              Only items with stock less than or equal to this threshold will be surged.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 text-[11px] font-mono text-[#FF9F1C] flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Mathematical Bounding Guarantee: Prices are capped between 0.5x and 2.0x of the catalog base price.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-sm shadow-xl shadow-[#FF9F1C]/25 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isSubmitting ? 'Adjusting Prices...' : 'Run Dynamic Surge Procedure'}
          </button>
        </form>
      </div>
    </div>
  );
};
