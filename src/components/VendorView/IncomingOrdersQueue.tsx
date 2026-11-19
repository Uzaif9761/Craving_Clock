import React from 'react';
import { db } from '../../db/dbEngine';
import { Order } from '../../types';
import { Clock, CheckCircle2, ChevronRight, Bike, Store, AlertCircle } from 'lucide-react';

interface IncomingOrdersQueueProps {
  vendorId: number;
}

export const IncomingOrdersQueue: React.FC<IncomingOrdersQueueProps> = ({ vendorId }) => {
  const allOrders = db.getOrders().filter((o) => o.vendor_id === vendorId);
  const activeOrders = allOrders.filter((o) => o.order_status !== 'Cancelled');
  const deliveryTracking = db.getDeliveryTracking();

  return (
    <div className="p-6 rounded-3xl glass-panel border border-[#FF9F1C]/25 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div>
          <h3 className="text-lg font-bold font-syne text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2EC4B6] animate-pulse" />
            Kitchen Live Token Queue
          </h3>
          <p className="text-xs font-mono text-neutral-400 mt-0.5">
            Real-time tokens incoming from VIT students
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30 font-bold">
          {activeOrders.filter((o) => o.order_status !== 'Completed').length} Pending Fulfillment
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-neutral-400 bg-white/5 rounded-2xl">
          No orders received yet for this mess today.
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order) => {
            const tracking = deliveryTracking.find((t) => t.order_id === order.order_id);

            return (
              <div
                key={order.order_id}
                className="p-4 rounded-2xl bg-[#0B0908]/90 border border-white/10 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#FF9F1C]">Token #{order.order_id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-300 flex items-center gap-1">
                      {order.order_mode === 'Tiffin Delivery' ? <Bike className="w-3 h-3 text-[#2EC4B6]" /> : <Store className="w-3 h-3 text-[#FF9F1C]" />}
                      {order.order_mode}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {order.created_at.substring(11, 16)}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {order.items?.map((it) => `${it.quantity}x ${it.dish_name}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-extrabold font-mono text-[#FF9F1C]">
                      ₹{order.final_price.toFixed(2)}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        order.order_status === 'Completed'
                          ? 'bg-[#2EC4B6]/15 text-[#2EC4B6]'
                          : order.order_status === 'Out for Delivery'
                          ? 'bg-blue-500/15 text-blue-400'
                          : order.order_status === 'Preparing'
                          ? 'bg-[#FF9F1C]/15 text-[#FF9F1C]'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>

                  {/* Status Progression Actions */}
                  <div className="flex items-center gap-2">
                    {order.order_status === 'Confirmed' && (
                      <button
                        onClick={() => db.updateOrderStatus(order.order_id, 'Preparing')}
                        className="px-3 py-1.5 rounded-xl bg-[#FF9F1C] hover:bg-[#FF9F1C]/80 text-black text-xs font-mono font-bold transition-all"
                      >
                        Start Prep
                      </button>
                    )}

                    {order.order_status === 'Preparing' && (
                      <button
                        onClick={() => {
                          if (order.order_mode === 'Tiffin Delivery') {
                            db.updateOrderStatus(order.order_id, 'Out for Delivery');
                            if (tracking) db.updateDeliveryStatus(tracking.track_id, 'Out for Delivery');
                          } else {
                            db.updateOrderStatus(order.order_id, 'Completed');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#2EC4B6] hover:bg-[#2EC4B6]/80 text-black text-xs font-mono font-bold transition-all"
                      >
                        {order.order_mode === 'Tiffin Delivery' ? 'Dispatch Delivery' : 'Hand Over Plate'}
                      </button>
                    )}

                    {order.order_status === 'Out for Delivery' && (
                      <button
                        onClick={() => {
                          if (tracking) db.updateDeliveryStatus(tracking.track_id, 'Delivered');
                          else db.updateOrderStatus(order.order_id, 'Completed');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-mono font-bold transition-all"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
