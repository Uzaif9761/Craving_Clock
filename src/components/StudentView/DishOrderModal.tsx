import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { DailyAvailability, MenuItem, Vendor } from '../../types';
import { SlotTicker } from '../SlotTicker';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Tag, Bike, Store, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface DishOrderModalProps {
  dishRecord: DailyAvailability | null;
  menuItem: MenuItem | null;
  vendor: Vendor | null;
  onClose: () => void;
  onOrderPlaced: (orderId: number) => void;
}

export const DishOrderModal: React.FC<DishOrderModalProps> = ({
  dishRecord,
  menuItem,
  vendor,
  onClose,
  onOrderPlaced
}) => {
  const [quantity, setQuantity] = useState(1);
  const [orderMode, setOrderMode] = useState<'Dine-In Token' | 'Tiffin Delivery'>('Dine-In Token');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Campus Wallet' | 'Cash at Mess' | 'Card'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!dishRecord || !menuItem || !vendor) return null;

  const rawTotal = dishRecord.daily_price * quantity;
  const finalPrice = Math.max(1, +(rawTotal - promoDiscount).toFixed(2));

  const handleApplyPromo = () => {
    setErrorMessage('');
    const promo = db.getPromotions().find(
      (p) =>
        p.code.toUpperCase() === promoCode.trim().toUpperCase() &&
        p.vendor_id === vendor.vendor_id &&
        p.is_active
    );

    if (!promo) {
      setPromoDiscount(0);
      setPromoMessage('Invalid or inactive promo code for this mess.');
      return;
    }

    if (rawTotal < promo.min_order) {
      setPromoDiscount(0);
      setPromoMessage(`Min order ₹${promo.min_order} required for ${promo.code}.`);
      return;
    }

    setPromoDiscount(promo.discount_amount);
    setPromoMessage(`Success! ₹${promo.discount_amount} VIT discount applied.`);
  };

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    setErrorMessage('');

    const result = db.sp_PlaceAtomicOrderWithStockDeduction({
      cust_id: 1, // Aarav Deshmukh (VIT-AIML-D-13)
      vendor_id: vendor.vendor_id,
      record_id: dishRecord.record_id,
      quantity,
      order_mode: orderMode,
      promo_code: promoDiscount > 0 ? promoCode.trim() : undefined,
      payment_method: paymentMethod
    });

    setIsSubmitting(false);

    if (result.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }
      onOrderPlaced(result.order_id);
      onClose();
    } else {
      setErrorMessage(result.message || 'Transaction rejected. Insufficient plate inventory.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-4 sm:p-6 border border-[#FF9F1C]/30 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF9F1C]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="pr-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#FF9F1C] font-bold">
              {vendor.name} • {vendor.area_zone}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-syne text-white mt-0.5">{menuItem.name}</h3>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{menuItem.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Pricing & Live Stock Banner */}
        <div className="my-3 sm:my-4 p-3 rounded-2xl bg-[#0B0908]/90 border border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase">TODAY'S DYNAMIC PRICE</div>
            <SlotTicker value={dishRecord.daily_price} prefix="₹" suffix="/ plate" />
          </div>
          <div className="text-right">
            <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase mb-1">INVENTORY</div>
            <SlotTicker value={dishRecord.stock_qty} type="stock" />
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/5">
          <span className="text-xs sm:text-sm font-medium text-neutral-300">Number of Plates:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 text-white font-bold flex items-center justify-center transition-all"
            >
              -
            </button>
            <span className="font-mono text-base sm:text-lg font-bold text-white w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(dishRecord.stock_qty, quantity + 1))}
              disabled={quantity >= dishRecord.stock_qty}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 text-white font-bold flex items-center justify-center transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Order Mode: Dine-In Token vs Tiffin Delivery */}
        <div className="py-2.5 sm:py-3 border-b border-white/5">
          <label className="text-[11px] font-mono text-neutral-400 block mb-2">SERVICE FULFILLMENT MODE:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderMode('Dine-In Token')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                orderMode === 'Dine-In Token'
                  ? 'bg-[#FF9F1C]/20 border-[#FF9F1C] text-[#FF9F1C] font-bold shadow-md'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Dine-In Token</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode('Tiffin Delivery')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                orderMode === 'Tiffin Delivery'
                  ? 'bg-[#2EC4B6]/20 border-[#2EC4B6] text-[#2EC4B6] font-bold shadow-md'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Tiffin Delivery</span>
            </button>
          </div>
        </div>

        {/* Promo Code Input */}
        <div className="py-2.5 sm:py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#FF9F1C]" />
              CAMPUS PROMO:
            </label>
            <span className="text-[10px] text-neutral-400 font-mono">Try: VITIAN20, SAI30, EXAMFEAST</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="e.g. VITIAN20"
              className="flex-1 bg-[#0B0908] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF9F1C]"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-bold text-white transition-all flex-shrink-0"
            >
              Apply
            </button>
          </div>
          {promoMessage && (
            <p className={`text-[11px] mt-1.5 font-mono ${promoDiscount > 0 ? 'text-[#2EC4B6]' : 'text-[#E71D36]'}`}>
              {promoMessage}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div className="py-2.5 sm:py-3 border-b border-white/5">
          <label className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-[#2EC4B6]" />
            SETTLEMENT METHOD:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {(['UPI', 'Campus Wallet', 'Cash at Mess', 'Card'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-mono border transition-all text-center ${
                  paymentMethod === method
                    ? 'bg-[#FF9F1C] text-black font-bold border-[#FF9F1C]'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#E71D36]/20 border border-[#E71D36]/50 flex items-center gap-2 text-xs text-[#E71D36]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Price Breakdown & Checkout Action */}
        <div className="mt-3 sm:mt-4 pt-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase">Total Payable</div>
            <div className="text-xl sm:text-2xl font-extrabold font-syne text-[#FF9F1C]">₹{finalPrice.toFixed(2)}</div>
            {promoDiscount > 0 && (
              <div className="text-[10px] font-mono text-[#2EC4B6]">Saved ₹{promoDiscount} with promo</div>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting || dishRecord.stock_qty <= 0}
            onClick={handleConfirmOrder}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-xs sm:text-sm shadow-xl shadow-[#FF9F1C]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Locking Row...' : 'Confirm Order'}</span>
          </button>
        </div>

        {/* ACID Guarantee footer badge */}
        <div className="mt-2.5 text-center">
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF9F1C]" />
            ACID Transaction • SELECT FOR UPDATE row-lock guarantees 0 oversell
          </span>
        </div>
      </div>
    </div>
  );
};
