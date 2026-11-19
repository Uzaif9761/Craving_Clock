import React from 'react';
import { db } from '../../db/dbEngine';
import { X, Shield, MapPin, Sparkles } from 'lucide-react';

interface StudentProfileModalProps {
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ onClose }) => {
  const customer = db.getCustomers()[0]; // Default student Aarav Deshmukh
  const loyaltyData = db.sp_CalculateStudentLoyaltyAndTier(customer.cust_id);
  const studentOrders = db.getOrders().filter((o) => o.cust_id === customer.cust_id);

  const tierColors: Record<string, { bg: string; text: string; border: string }> = {
    PLATINUM: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40' },
    GOLD: { bg: 'bg-[#FF9F1C]/20', text: 'text-[#FF9F1C]', border: 'border-[#FF9F1C]/40' },
    SILVER: { bg: 'bg-neutral-400/20', text: 'text-neutral-300', border: 'border-neutral-400/40' },
    BRONZE: { bg: 'bg-amber-800/20', text: 'text-amber-500', border: 'border-amber-700/40' }
  };

  const currentTierStyle = tierColors[loyaltyData.tier] || tierColors.BRONZE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-3xl p-4 sm:p-6 border border-[#FF9F1C]/30 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FF9F1C]" />
            <h3 className="text-base sm:text-lg font-bold font-syne text-white">VIT Student Identity & DBMS Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIT Student Digital Smart Card */}
        <div className="my-4 sm:my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1E1916] via-[#14110F] to-[#0B0908] border border-[#FF9F1C]/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF9F1C]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-[#FF9F1C]">
                VISHWAKARMA INSTITUTE OF TECHNOLOGY, PUNE
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-syne text-white mt-0.5">{customer.name}</h2>
              <div className="text-[11px] sm:text-xs font-mono text-neutral-400 mt-0.5">{customer.course}</div>
            </div>

            <div className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold border ${currentTierStyle.bg} ${currentTierStyle.text} ${currentTierStyle.border} flex-shrink-0`}>
              {loyaltyData.tier}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-3.5 pt-3.5 border-t border-white/10 text-xs font-mono">
            <div>
              <div className="text-neutral-400 text-[9px] sm:text-[10px]">REGD NO.</div>
              <div className="text-white font-bold text-[11px] sm:text-xs truncate">{customer.regd_no}</div>
            </div>
            <div>
              <div className="text-neutral-400 text-[9px] sm:text-[10px]">PHONE</div>
              <div className="text-white font-bold text-[11px] sm:text-xs">{customer.phone}</div>
            </div>
            <div>
              <div className="text-neutral-400 text-[9px] sm:text-[10px]">LOYALTY BALANCE</div>
              <div className="text-[#FF9F1C] font-bold text-xs sm:text-sm">{customer.loyalty_points} pts</div>
            </div>
          </div>

          <div className="mt-2.5 text-[10px] sm:text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FF9F1C] flex-shrink-0" />
            <span className="truncate">{customer.address}</span>
          </div>
        </div>

        {/* Stored Procedure sp_CalculateStudentLoyaltyAndTier Output Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B0908]/90 border border-white/10 mb-4 sm:mb-5">
          <div className="flex items-center justify-between text-xs font-mono mb-2 flex-wrap gap-1">
            <span className="text-[#2EC4B6] font-bold flex items-center gap-1 text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              DBMS Procedure: sp_CalculateStudentLoyaltyAndTier
            </span>
            <span className="text-neutral-500 text-[10px]">cust_id: {customer.cust_id}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-neutral-400 text-[9px] sm:text-[10px]">TIER</div>
              <div className="text-xs sm:text-base font-bold text-[#FF9F1C] mt-0.5">{loyaltyData.tier}</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-neutral-400 text-[9px] sm:text-[10px]">LIFETIME SPEND</div>
              <div className="text-xs sm:text-base font-bold text-white mt-0.5">₹{loyaltyData.total_spend.toFixed(0)}</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-neutral-400 text-[9px] sm:text-[10px]">TIER BENEFIT</div>
              <div className="text-xs sm:text-base font-bold text-[#2EC4B6] mt-0.5">{loyaltyData.eligible_discount}% OFF</div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div>
          <h4 className="text-xs sm:text-sm font-bold font-syne text-white mb-2 sm:mb-3">Recent Orders & Dine-In Tokens</h4>
          <div className="space-y-2">
            {studentOrders.map((ord) => (
              <div
                key={ord.order_id}
                className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2 text-xs font-mono"
              >
                <div>
                  <div className="text-white font-bold text-[11px] sm:text-xs">Token #{ord.order_id} • {ord.vendor_name}</div>
                  <div className="text-neutral-400 text-[10px] mt-0.5">
                    {ord.order_mode} • {ord.created_at.substring(0, 16)}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[#FF9F1C] font-bold text-xs sm:text-sm">₹{ord.final_price.toFixed(2)}</div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                    ord.order_status === 'Completed' ? 'bg-[#2EC4B6]/15 text-[#2EC4B6]' : 'bg-[#FF9F1C]/15 text-[#FF9F1C]'
                  }`}>
                    {ord.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
