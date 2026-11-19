import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { MealSlot, Vendor } from '../../types';
import { X, Zap, Leaf, Sparkles } from 'lucide-react';

interface FlashSaleModalProps {
  vendor: Vendor;
  activeSlot: MealSlot;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const FlashSaleModal: React.FC<FlashSaleModalProps> = ({
  vendor,
  activeSlot,
  onClose,
  onSuccess
}) => {
  const [discountPercent, setDiscountPercent] = useState(25);
  const [targetSlot, setTargetSlot] = useState<string>(activeSlot);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = db.sp_VendorDailyEndMealFlashSale({
      vendor_id: vendor.vendor_id,
      meal_slot: targetSlot,
      discount_percent: discountPercent
    });

    setIsSubmitting(false);
    onSuccess(result.items_discounted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-6 border border-[#2EC4B6]/30 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#2EC4B6]" />
            <h3 className="text-lg font-bold font-syne text-white">End-of-Meal Flash Clearance</h3>
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
            Executes <strong>sp_VendorDailyEndMealFlashSale</strong> to liquidate remaining plate inventory before kitchen closing time, eliminating campus food waste and serving students.
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1.5">CLEARANCE MEAL WINDOW:</label>
            <select
              value={targetSlot}
              onChange={(e) => setTargetSlot(e.target.value)}
              className="w-full bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2EC4B6]"
            >
              <option value="Lunch">Lunch (14:30 Closing Clearance)</option>
              <option value="Dinner">Dinner (22:00 Closing Clearance)</option>
              <option value="Breakfast">Breakfast (10:15 Closing Clearance)</option>
              <option value="Snacks">Evening Snacks (18:15 Closing Clearance)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-neutral-400">CLEARANCE DISCOUNT PERCENTAGE:</span>
              <span className="text-[#2EC4B6] font-bold">-{discountPercent}% OFF</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full accent-[#2EC4B6]"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>-10%</span>
              <span>-25% (Recommended)</span>
              <span>-50% (Flash Half-Price)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#2EC4B6]/10 border border-[#2EC4B6]/20 text-[11px] font-mono text-[#2EC4B6] flex items-center gap-2">
            <Leaf className="w-4 h-4 flex-shrink-0" />
            <span>Zero Waste Initiative: Dishes will be tagged with a special notice in student view.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#2EC4B6] to-[#0D9488] text-black font-bold font-syne text-sm shadow-xl shadow-[#2EC4B6]/25 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isSubmitting ? 'Applying Discounts...' : 'Broadcast Flash Sale'}
          </button>
        </form>
      </div>
    </div>
  );
};
