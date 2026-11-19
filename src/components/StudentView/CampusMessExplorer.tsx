import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { CampusZone, DailyAvailability, MealSlot, MenuItem, Vendor } from '../../types';
import { TiltCard } from '../TiltCard';
import { SlotTicker } from '../SlotTicker';
import { DishOrderModal } from './DishOrderModal';
import { ReviewModal } from './ReviewModal';
import { Star, MapPin, Sparkles, Search, Utensils } from 'lucide-react';

interface CampusMessExplorerProps {
  selectedZone: CampusZone;
  activeSlot: MealSlot;
  onOrderPlaced: (orderId: number) => void;
}

export const CampusMessExplorer: React.FC<CampusMessExplorerProps> = ({
  selectedZone,
  activeSlot,
  onOrderPlaced
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalDish, setActiveModalDish] = useState<{
    record: DailyAvailability;
    item: MenuItem;
    vendor: Vendor;
  } | null>(null);
  const [activeReviewVendor, setActiveReviewVendor] = useState<Vendor | null>(null);

  const vendors = db.getVendors(selectedZone);
  const menuItems = db.getMenuItems();
  const dailyAvailability = db.getDailyAvailability();

  const currentSlotDishes = dailyAvailability.filter(
    (d) => d.meal_slot === activeSlot && d.stock_qty > 0
  );

  const totalPlatesInSlot = currentSlotDishes.reduce((sum, d) => sum + d.stock_qty, 0);
  const openMessesCount = vendors.filter((v) => v.is_open).length;

  const categories = ['All', 'Thali', 'Main Course', 'Snacks', 'Special'];

  return (
    <div className="space-y-6">
      {/* Real-time Urgency & Capacity Hero Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl glass-panel border border-[#FF9F1C]/20 shadow-lg">
          <div className="text-[10px] sm:text-[11px] font-mono uppercase text-neutral-400">OPEN MESSES</div>
          <div className="text-xl sm:text-2xl font-extrabold font-syne text-white mt-0.5 flex items-baseline gap-1.5">
            <span>{openMessesCount}</span>
            <span className="text-xs font-mono text-[#2EC4B6]">/ {vendors.length}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl glass-panel border border-[#FF9F1C]/20 shadow-lg">
          <div className="text-[10px] sm:text-[11px] font-mono uppercase text-neutral-400">PLATES FOR {activeSlot.toUpperCase()}</div>
          <div className="text-xl sm:text-2xl font-extrabold font-syne text-[#FF9F1C] mt-0.5 flex items-baseline gap-1.5">
            <span>{totalPlatesInSlot}</span>
            <span className="text-[11px] font-mono text-neutral-400">left</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl glass-panel border border-[#FF9F1C]/20 shadow-lg">
          <div className="text-[10px] sm:text-[11px] font-mono uppercase text-neutral-400">AVG MEAL PRICE</div>
          <div className="text-xl sm:text-2xl font-extrabold font-syne text-white mt-0.5">
            ₹
            {currentSlotDishes.length > 0
              ? (currentSlotDishes.reduce((sum, d) => sum + d.daily_price, 0) / currentSlotDishes.length).toFixed(0)
              : '95'}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl glass-panel border border-[#FF9F1C]/20 shadow-lg">
          <div className="text-[10px] sm:text-[11px] font-mono uppercase text-neutral-400">ZERO OVER-ORDERING</div>
          <div className="text-xl sm:text-2xl font-extrabold font-syne text-[#2EC4B6] mt-0.5 flex items-center gap-1.5">
            <span>100%</span>
            <span className="text-[11px] font-mono text-neutral-400">Locked</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Thali, Paneer, Biryani, Poha or Mess..."
            className="w-full bg-[#14110F] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF9F1C]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold shadow-md'
                  : 'bg-white/5 border border-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Messes & Daily Dishes Grid */}
      <div className="space-y-8">
        {vendors.map((vendor) => {
          const vendorItems = menuItems.filter((m) => m.vendor_id === vendor.vendor_id);
          const vendorTodayDishes = currentSlotDishes.filter((d) =>
            vendorItems.some((m) => m.item_id === d.item_id)
          );

          const filteredDishes = vendorTodayDishes.filter((d) => {
            const item = vendorItems.find((m) => m.item_id === d.item_id);
            if (!item) return false;

            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch =
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
          });

          if (searchQuery && filteredDishes.length === 0) return null;

          return (
            <div key={vendor.vendor_id} className="space-y-4">
              {/* Responsive Mess Header Banner */}
              <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-[#FF9F1C]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FF9F1C] to-[#E71D36] flex items-center justify-center text-white font-bold text-base sm:text-lg font-syne shadow-md shadow-[#FF9F1C]/20 flex-shrink-0">
                    {vendor.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold font-syne text-white">{vendor.name}</h3>
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold text-[#FF9F1C] bg-[#FF9F1C]/15 px-2 py-0.5 rounded-full border border-[#FF9F1C]/30">
                        <Star className="w-3 h-3 fill-[#FF9F1C]" />
                        {vendor.rating.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono text-neutral-400 mt-0.5">
                      <span className="flex items-center gap-1 text-[#FF9F1C]">
                        <MapPin className="w-3 h-3" />
                        {vendor.area_zone}
                      </span>
                      <span>•</span>
                      <span className="truncate">{vendor.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setActiveReviewVendor(vendor)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs font-mono text-neutral-300 hover:text-white transition-all flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 text-[#FF9F1C]" />
                    <span>Rate Mess</span>
                  </button>

                  <span
                    className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold ${
                      vendor.is_open ? 'bg-[#2EC4B6]/15 text-[#2EC4B6] border border-[#2EC4B6]/30' : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {vendor.is_open ? 'OPEN NOW' : 'CLOSED'}
                  </span>
                </div>
              </div>

              {/* Responsive Dishes Grid */}
              {filteredDishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredDishes.map((dish) => {
                    const item = vendorItems.find((m) => m.item_id === dish.item_id)!;
                    const priceSurge = +(dish.daily_price - item.base_price).toFixed(2);

                    return (
                      <TiltCard key={dish.record_id} maxTilt={8}>
                        <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3.5">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 border border-white/5">
                                {item.category}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full border ${
                                    item.is_veg
                                      ? 'border-[#2EC4B6] bg-[#2EC4B6]/30'
                                      : 'border-[#E71D36] bg-[#E71D36]/30'
                                  }`}
                                />
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {item.is_veg ? 'VEG' : 'NON-VEG'}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold font-syne text-white leading-snug">
                              {item.name}
                            </h4>
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          {dish.special_note && (
                            <div className="p-2 sm:p-2.5 rounded-xl bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 text-[10px] sm:text-[11px] font-mono text-[#FF9F1C] flex items-start gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{dish.special_note}</span>
                            </div>
                          )}

                          <div className="pt-2.5 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-neutral-400 uppercase">PRICE</div>
                                <div className="flex items-baseline gap-1.5">
                                  <SlotTicker value={dish.daily_price} prefix="₹" />
                                  {priceSurge !== 0 && (
                                    <span
                                      className={`text-[9px] sm:text-[10px] font-mono font-bold ${
                                        priceSurge > 0 ? 'text-[#FF9F1C]' : 'text-[#2EC4B6]'
                                      }`}
                                    >
                                      {priceSurge > 0 ? `+₹${priceSurge}` : `-₹${Math.abs(priceSurge)}`}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-[9px] sm:text-[10px] font-mono text-neutral-400 uppercase mb-0.5">STOCK</div>
                                <SlotTicker value={dish.stock_qty} type="stock" />
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                setActiveModalDish({
                                  record: dish,
                                  item,
                                  vendor
                                })
                              }
                              disabled={dish.stock_qty <= 0 || !vendor.is_open}
                              className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-xs shadow-lg shadow-[#FF9F1C]/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                              <span>Book Plate / Tiffin Token</span>
                            </button>
                          </div>
                        </div>
                      </TiltCard>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-mono text-neutral-400">
                  No active menu items available for <strong>{activeSlot}</strong> at this mess today.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeModalDish && (
        <DishOrderModal
          dishRecord={activeModalDish.record}
          menuItem={activeModalDish.item}
          vendor={activeModalDish.vendor}
          onClose={() => setActiveModalDish(null)}
          onOrderPlaced={onOrderPlaced}
        />
      )}

      {activeReviewVendor && (
        <ReviewModal
          vendor={activeReviewVendor}
          onClose={() => setActiveReviewVendor(null)}
          onReviewAdded={() => {}}
        />
      )}
    </div>
  );
};
