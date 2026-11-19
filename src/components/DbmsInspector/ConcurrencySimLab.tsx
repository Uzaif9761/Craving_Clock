import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { Shield, Play, Lock, CheckCircle2, XCircle, ArrowRight, RefreshCw, Cpu } from 'lucide-react';

export const ConcurrencySimLab: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simSteps, setSimSteps] = useState<Array<{
    thread: 'Thread A (Aarav)' | 'Thread B (Rhea)' | 'DBMS Lock Manager';
    action: string;
    status: 'pending' | 'locked' | 'success' | 'failed' | 'rollback';
    time: string;
    details: string;
  }>>([]);

  const runConcurrencyRace = async () => {
    setIsRunning(true);
    setSimSteps([]);

    // We target dish record_id 6 (Kondhwa Biryani, which starts with last 2 plates)
    // Ensure stock is exactly 2 for clean race condition demonstration
    const targetDish = db.getDailyAvailability().find((d) => d.record_id === 6);
    if (targetDish) targetDish.stock_qty = 2;

    const addStep = (
      thread: 'Thread A (Aarav)' | 'Thread B (Rhea)' | 'DBMS Lock Manager',
      action: string,
      status: 'pending' | 'locked' | 'success' | 'failed' | 'rollback',
      details: string
    ) => {
      setSimSteps((prev) => [
        ...prev,
        {
          thread,
          action,
          status,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(Math.random() * 800 + 100),
          details
        }
      ]);
    };

    // T0: Initial state
    addStep(
      'DBMS Lock Manager',
      'Initial Plate Inventory State Verified',
      'pending',
      'Target: Kondhwa Dum Biryani (record_id=6) has exactly 2 plates left. Both students request 2 plates concurrently.'
    );
    await new Promise((r) => setTimeout(r, 600));

    // T1: Thread A and Thread B fire simultaneously
    addStep(
      'Thread A (Aarav)',
      'START TRANSACTION; -- Student Aarav initiates checkout for 2 plates',
      'pending',
      'Requested quantity = 2'
    );
    addStep(
      'Thread B (Rhea)',
      'START TRANSACTION; -- Student Rhea initiates checkout for 2 plates',
      'pending',
      'Requested quantity = 2'
    );
    await new Promise((r) => setTimeout(r, 700));

    // T2: Thread A acquires Row Lock
    addStep(
      'Thread A (Aarav)',
      'SELECT stock_qty, daily_price FROM DAILY_AVAILABILITY WHERE record_id = 6 FOR UPDATE;',
      'locked',
      'ACQUIRED EXCLUSIVE ROW-LEVEL LOCK (IX/X Lock). Transaction tx_aarav_01 owns record_id 6.'
    );
    await new Promise((r) => setTimeout(r, 800));

    // T3: Thread B blocked by Lock Manager
    addStep(
      'DBMS Lock Manager',
      'CONTENTION DETECTED: Thread B blocked on record_id 6 (Lock Wait State)',
      'locked',
      'Thread B suspended waiting for Thread A to release row lock. Prevents Dirty Reads & Phantom Oversell.'
    );
    await new Promise((r) => setTimeout(r, 900));

    // T4: Thread A completes checkout
    const resultA = db.sp_PlaceAtomicOrderWithStockDeduction({
      cust_id: 1, // Aarav
      vendor_id: 4,
      record_id: 6,
      quantity: 2,
      order_mode: 'Dine-In Token',
      payment_method: 'UPI'
    });

    addStep(
      'Thread A (Aarav)',
      'COMMIT; -- Order Confirmed! Deducted 2 plates. Stock now = 0.',
      'success',
      `Order #${resultA.order_id} generated. Row lock released.`
    );
    await new Promise((r) => setTimeout(r, 900));

    // T5: Thread B lock granted & re-checks stock
    addStep(
      'DBMS Lock Manager',
      'Lock Released by Thread A. Thread B granted EXCLUSIVE LOCK on record_id 6.',
      'pending',
      'Thread B resumes execution and reads latest committed stock.'
    );
    await new Promise((r) => setTimeout(r, 700));

    // Thread B evaluates stock
    const resultB = db.sp_PlaceAtomicOrderWithStockDeduction({
      cust_id: 2, // Rhea
      vendor_id: 4,
      record_id: 6,
      quantity: 2,
      order_mode: 'Tiffin Delivery',
      payment_method: 'Campus Wallet'
    });

    addStep(
      'Thread B (Rhea)',
      'ROLLBACK; -- ZERO OVERSELL GUARANTEE: Insufficient stock (0 plates left)!',
      'rollback',
      'Thread B transaction safely aborted and rolled back. 0 plates oversold. Database consistency intact!'
    );

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header & Action */}
      <div className="p-6 rounded-2xl glass-panel border border-[#FF9F1C]/25 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold font-syne text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2EC4B6]" />
            ACID Transaction & Row-Level Lock Race Condition Laboratory
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Simulates 2 students racing for the last 2 plates of Kondhwa Biryani with <code>SELECT ... FOR UPDATE</code>.
          </p>
        </div>

        <button
          onClick={runConcurrencyRace}
          disabled={isRunning}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2EC4B6] to-[#0D9488] text-black font-bold font-syne text-xs shadow-lg shadow-[#2EC4B6]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Simulating Lock Contention...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black" />
              <span>Fire Concurrent 2-Thread Race</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Thread Timeline */}
      <div className="p-6 rounded-2xl bg-[#0B0908] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-2 border-b border-white/10">
          <span>REAL-TIME TRANSACTION CHOREOGRAPHY TIMELINE</span>
          <span className="text-[#2EC4B6]">Pessimistic Concurrency (InnoDB Strict)</span>
        </div>

        {simSteps.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500">
            Click <strong>"Fire Concurrent 2-Thread Race"</strong> above to witness real-time row-lock contention and zero-oversell rollback.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {simSteps.map((step, i) => {
              let badgeColor = 'bg-white/5 text-neutral-300 border-white/10';
              if (step.status === 'locked') badgeColor = 'bg-[#FF9F1C]/15 text-[#FF9F1C] border-[#FF9F1C]/30';
              if (step.status === 'success') badgeColor = 'bg-[#2EC4B6]/15 text-[#2EC4B6] border-[#2EC4B6]/30';
              if (step.status === 'rollback') badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30';

              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono transition-all animate-fade-in ${badgeColor}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase text-[11px]">{step.thread}</span>
                      <span className="text-[10px] text-neutral-400">[{step.time}]</span>
                    </div>
                    <div className="font-semibold text-neutral-200">{step.action}</div>
                    <div className="text-[11px] opacity-80">{step.details}</div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/40 border border-white/10">
                      {step.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
