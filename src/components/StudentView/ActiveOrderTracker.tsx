import React from 'react';
import { db } from '../../db/dbEngine';
import { Order } from '../../types';
import { Bike, Clock, Phone, Sparkles } from 'lucide-react';

interface ActiveOrderTrackerProps {
  orders: Order[];
  onOrderUpdated?: () => void;
}

export const ActiveOrderTracker: React.FC<ActiveOrderTrackerProps> = ({ orders }) => {
  const activeOrders = orders.filter((o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled');
  const deliveryTracking = db.getDeliveryTracking();
  const deliveryAgents = db.getDeliveryAgents();

  if (activeOrders.length === 0) return null;

  return (
    <div className="mb-6 sm:mb-8 p-3.5 sm:p-5 rounded-3xl glass-panel-elevated border border-[#FF9F1C]/30 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 sm:mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2EC4B6] animate-ping" />
          <h3 className="text-sm sm:text-base font-bold font-syne text-white">Live Active Orders & Dispatch</h3>
          <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-[#2EC4B6]/15 text-[#2EC4B6] border border-[#2EC4B6]/30">
            {activeOrders.length} active
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 hidden sm:inline">
          VIT Real-Time Kitchen Dispatch
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {activeOrders.map((order) => {
          const tracking = deliveryTracking.find((t) => t.order_id === order.order_id);
          const agent = tracking?.agent_id ? deliveryAgents.find((a) => a.agent_id === tracking.agent_id) : null;

          const steps: Array<Order['order_status']> = ['Confirmed', 'Preparing', 'Out for Delivery', 'Completed'];
          const currentStepIndex = steps.indexOf(order.order_status);

          return (
            <div
              key={order.order_id}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#0B0908]/85 border border-white/10 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-2.5 gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-[#FF9F1C]">Token #{order.order_id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-300">
                      {order.order_mode}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">{order.vendor_name}</h4>
                  <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                    {order.items?.map((it) => `${it.quantity}x ${it.dish_name}`).join(', ')}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm sm:text-base font-extrabold font-mono text-[#FF9F1C]">₹{order.final_price.toFixed(2)}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-[#2EC4B6] flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{order.created_at.substring(11, 16)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="my-2.5">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-neutral-400 mb-1">
                  <span>Status: <strong className="text-white">{order.order_status}</strong></span>
                  {order.order_mode === 'Tiffin Delivery' && (
                    <span className="text-[#FF9F1C] font-bold">ETA: ~{tracking?.eta_minutes || 15}m</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                  {steps.map((st, i) => {
                    const isPassed = i <= currentStepIndex;
                    return (
                      <div
                        key={st}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isPassed ? 'bg-gradient-to-r from-[#FF9F1C] to-[#2EC4B6]' : 'bg-neutral-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Delivery Agent Details */}
              {order.order_mode === 'Tiffin Delivery' && agent && (
                <div className="mt-2 p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <Bike className="w-3.5 h-3.5 text-[#2EC4B6] flex-shrink-0" />
                    <span className="text-neutral-200 truncate">{agent.name}</span>
                  </div>
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center gap-1 text-[#FF9F1C] hover:underline flex-shrink-0 ml-2"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{agent.phone}</span>
                  </a>
                </div>
              )}

              {/* Advance Status Button */}
              <div className="mt-2.5 flex justify-end">
                {order.order_status !== 'Completed' && (
                  <button
                    onClick={() => {
                      if (order.order_status === 'Confirmed') {
                        db.updateOrderStatus(order.order_id, 'Preparing');
                      } else if (order.order_status === 'Preparing') {
                        db.updateOrderStatus(order.order_id, 'Out for Delivery');
                        if (tracking) db.updateDeliveryStatus(tracking.track_id, 'Out for Delivery');
                      } else if (order.order_status === 'Out for Delivery') {
                        if (tracking) {
                          db.updateDeliveryStatus(tracking.track_id, 'Delivered');
                        } else {
                          db.updateOrderStatus(order.order_id, 'Completed');
                        }
                      }
                    }}
                    className="text-[10px] sm:text-[11px] font-mono px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-[#FF9F1C] hover:text-black text-neutral-300 font-semibold border border-white/10 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Advance Status (Simulate Kitchen)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
