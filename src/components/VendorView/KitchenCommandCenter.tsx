import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { MealSlot } from '../../types';
import { BatchSurgeModal } from './BatchSurgeModal';
import { FlashSaleModal } from './FlashSaleModal';
import { IncomingOrdersQueue } from './IncomingOrdersQueue';
import { SlotTicker } from '../SlotTicker';
import {
  TrendingUp,
  Zap,
  Power,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  RefreshCw,
  MoveHorizontal
} from 'lucide-react';

interface KitchenCommandCenterProps {
  activeSlot: MealSlot;
}

export const KitchenCommandCenter: React.FC<KitchenCommandCenterProps> = ({ activeSlot }) => {
  const vendors = db.getVendors();
  const [selectedVendorId, setSelectedVendorId] = useState<number>(1);
  const [showSurgeModal, setShowSurgeModal] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string>('');
  const [triggerError, setTriggerError] = useState<string>('');

  const currentVendor = vendors.find((v) => v.vendor_id === selectedVendorId) || vendors[0];
  const menuItems = db.getMenuItems().filter((m) => m.vendor_id === currentVendor.vendor_id);
  const dailyAvailability = db.getDailyAvailability();

  const vendorDishes = dailyAvailability.filter((d) =>
    menuItems.some((m) => m.item_id === d.item_id)
  );

  const vendorOrders = db.getOrders().filter((o) => o.vendor_id === currentVendor.vendor_id);
  const grossRev = vendorOrders.reduce((acc, o) => acc + o.final_price, 0);

  const handleStockChange = (record_id: number, currentStock: number, delta: number) => {
    setTriggerError('');
    setActionNotice('');
    const newStock = currentStock + delta;

    const result = db.updateDailyStock(record_id, newStock);
    if (!result.success) {
      setTriggerError(result.error || 'Trigger trg_prevent_negative_stock rejected negative stock!');
    }
  };

  const handleRelocateMess = () => {
    const newCity = currentVendor.city === 'Pune' ? 'PCMC Pune' : 'Pune';
    db.updateVendorCity(currentVendor.vendor_id, newCity);
    setActionNotice(`Relocated mess city to '${newCity}'. Trigger trg_vendor_after_update_city_trace fired and logged in trace table!`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Mess Header & Switcher */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel-elevated border border-[#FF9F1C]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF9F1C] to-[#E71D36] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl font-syne shadow-lg shadow-[#FF9F1C]/25 flex-shrink-0">
            {currentVendor.name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold font-syne text-white">{currentVendor.name}</h2>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30">
                Vendor #{currentVendor.vendor_id}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-neutral-400 mt-1">
              <span className="flex items-center gap-1 text-[#FF9F1C]">
                <MapPin className="w-3.5 h-3.5" />
                {currentVendor.area_zone}, {currentVendor.city}
              </span>
              <span>•</span>
              <span>Rating: {currentVendor.rating.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Vendor Selector & Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(Number(e.target.value))}
            className="flex-1 sm:flex-none bg-[#0B0908] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF9F1C]"
          >
            {vendors.map((v) => (
              <option key={v.vendor_id} value={v.vendor_id}>
                {v.name} ({v.area_zone})
              </option>
            ))}
          </select>

          <button
            onClick={() => db.toggleVendorOpenStatus(currentVendor.vendor_id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              currentVendor.is_open
                ? 'bg-[#2EC4B6]/20 border-[#2EC4B6] text-[#2EC4B6]'
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{currentVendor.is_open ? 'OPEN' : 'CLOSED'}</span>
          </button>

          <button
            onClick={handleRelocateMess}
            title="Updates vendor city to test Trigger 2"
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all"
          >
            <RefreshCw className="w-3 h-3 text-[#FF9F1C]" />
            <span className="hidden xs:inline">Test Relocation</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-2xl bg-[#2EC4B6]/15 border border-[#2EC4B6]/30 text-xs font-mono text-[#2EC4B6] flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {triggerError && (
        <div className="p-3.5 rounded-2xl bg-[#E71D36]/20 border border-[#E71D36]/50 text-xs font-mono text-[#E71D36] flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Automated Trigger Rejection (trg_prevent_negative_stock):</strong>
            <p className="mt-0.5">{triggerError}</p>
          </div>
        </div>
      )}

      {/* Analytics & Fast Procedure Launchers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-[#FF9F1C]/20">
          <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase">TODAY'S REVENUE</div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#FF9F1C] mt-1">₹{grossRev.toFixed(2)}</div>
          <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400 mt-1">{vendorOrders.length} orders</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-[#FF9F1C]/20">
          <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase">CATALOG ITEMS</div>
          <div className="text-xl sm:text-2xl font-extrabold font-syne text-white mt-1">{menuItems.length}</div>
          <div className="text-[10px] sm:text-[11px] font-mono text-[#2EC4B6] mt-1">{vendorDishes.length} active slots</div>
        </div>

        <button
          onClick={() => setShowSurgeModal(true)}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1916] to-[#0B0908] border border-[#FF9F1C]/40 hover:border-[#FF9F1C] transition-all text-left group shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#FF9F1C] uppercase font-bold">PROCEDURE 2</span>
            <TrendingUp className="w-4 h-4 text-[#FF9F1C] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold font-syne text-white">Batch Surge</div>
            <div className="text-[9px] sm:text-[10px] text-neutral-400 font-mono mt-0.5">sp_VendorBatchDynamicPriceAdjust</div>
          </div>
        </button>

        <button
          onClick={() => setShowFlashModal(true)}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#121A18] to-[#0B0908] border border-[#2EC4B6]/40 hover:border-[#2EC4B6] transition-all text-left group shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#2EC4B6] uppercase font-bold">PROCEDURE 4</span>
            <Zap className="w-4 h-4 text-[#2EC4B6] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold font-syne text-white">Flash Clearance</div>
            <div className="text-[9px] sm:text-[10px] text-neutral-400 font-mono mt-0.5">sp_VendorDailyEndMealFlashSale</div>
          </div>
        </button>
      </div>

      {/* Inventory & Daily Availability Control Table with Scroll Hint */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-[#FF9F1C]/20 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-syne text-white">Daily Plate Inventory & Dynamic Pricing</h3>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              Live updates to <strong>DAILY_AVAILABILITY</strong> with stock integrity triggers
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="sm:hidden text-neutral-400 flex items-center gap-1 text-[10px]">
              <MoveHorizontal className="w-3.5 h-3.5 text-[#FF9F1C]" />
              Scroll table
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 text-[11px]">
              Slot: <strong>{activeSlot}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs font-mono min-w-[560px]">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 text-[11px]">
                <th className="pb-3 font-semibold">DISH & CATEGORY</th>
                <th className="pb-3 font-semibold">SLOT</th>
                <th className="pb-3 font-semibold">BASE</th>
                <th className="pb-3 font-semibold">DYNAMIC PRICE</th>
                <th className="pb-3 font-semibold">LIVE STOCK</th>
                <th className="pb-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vendorDishes.map((dish) => {
                const item = menuItems.find((m) => m.item_id === dish.item_id);
                if (!item) return null;

                return (
                  <tr key={dish.record_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-3">
                      <div className="font-bold text-white text-xs sm:text-sm">{item.name}</div>
                      <div className="text-[10px] text-neutral-400">{item.category} • {item.is_veg ? 'Veg' : 'Non-Veg'}</div>
                      {dish.special_note && (
                        <div className="text-[10px] text-[#FF9F1C] mt-0.5">{dish.special_note}</div>
                      )}
                    </td>

                    <td className="py-3 pr-3">
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 text-neutral-300 text-[10px] border border-white/5">
                        {dish.meal_slot}
                      </span>
                    </td>

                    <td className="py-3 pr-3 text-neutral-400 text-[11px]">
                      ₹{item.base_price.toFixed(2)}
                    </td>

                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#FF9F1C] font-bold text-xs sm:text-sm">₹{dish.daily_price.toFixed(2)}</span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => db.updateDailyPrice(dish.record_id, dish.daily_price - 5)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 flex items-center justify-center text-[10px]"
                            title="Discount ₹5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => db.updateDailyPrice(dish.record_id, dish.daily_price + 5)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-[#FF9F1C] flex items-center justify-center text-[10px]"
                            title="Surge ₹5"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockChange(dish.record_id, dish.stock_qty, -1)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10"
                          title="Deduct 1 Plate"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-7 text-center font-bold text-white text-xs">
                          {dish.stock_qty}
                        </span>

                        <button
                          onClick={() => handleStockChange(dish.record_id, dish.stock_qty, 5)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-[#2EC4B6] flex items-center justify-center border border-white/10"
                          title="Add 5 Plates"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3">
                      <SlotTicker value={dish.stock_qty} type="stock" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <IncomingOrdersQueue vendorId={currentVendor.vendor_id} />

      {showSurgeModal && (
        <BatchSurgeModal
          vendor={currentVendor}
          activeSlot={activeSlot}
          onClose={() => setShowSurgeModal(false)}
          onSuccess={(cnt) => setActionNotice(`Batch surge completed! Updated dynamic prices for ${cnt} dish(es).`)}
        />
      )}

      {showFlashModal && (
        <FlashSaleModal
          vendor={currentVendor}
          activeSlot={activeSlot}
          onClose={() => setShowFlashModal(false)}
          onSuccess={(cnt) => setActionNotice(`Flash clearance activated! Discounted ${cnt} plates for end-of-meal.`)}
        />
      )}
    </div>
  );
};
