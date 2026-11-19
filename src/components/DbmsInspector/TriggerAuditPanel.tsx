import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { Zap, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, History } from 'lucide-react';

export const TriggerAuditPanel: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [negativeTriggerAlert, setNegativeTriggerAlert] = useState<string>('');

  const audits = db.getVendorAudit();
  const traces = db.getVendorCityTrace();
  const retentions = db.getVendorColdRetention();

  const handleTestNegativeStockTrigger = () => {
    setNegativeTriggerAlert('');
    setTestResult('');
    // Attempt to set stock of record 1 to -5 plates
    const res = db.updateDailyStock(1, -5);
    if (!res.success) {
      setNegativeTriggerAlert(`TRIGGER trg_prevent_negative_stock SIGNALED EXCEPTION: ${res.error}`);
    }
  };

  const handleTestCityTraceTrigger = () => {
    setNegativeTriggerAlert('');
    const newCity = 'Pune North';
    db.updateVendorCity(1, newCity);
    setTestResult(`Fired trg_vendor_after_update_city_trace! Logged trace from old city to '${newCity}'.`);
  };

  const handleTestOnboardVendorTrigger = () => {
    setNegativeTriggerAlert('');
    const newV = db.insertVendor({
      name: `Sahyadri Bhojan Hub ${Math.floor(Math.random() * 90 + 10)}`,
      phone: `9822${Math.floor(Math.random() * 899999 + 100000)}`,
      city: 'Pune',
      area_zone: 'Bibwewadi',
      rating: 4.5,
      is_open: true,
      description: 'Newly registered campus mess near VIT Mechanical building'
    });
    setTestResult(`Fired trg_vendor_after_insert_audit! Logged INSERT action for '${newV.name}' into vendor_audit.`);
  };

  const handleTestDeleteRetentionTrigger = () => {
    setNegativeTriggerAlert('');
    const vendors = db.getVendors();
    if (vendors.length <= 2) {
      setTestResult('Preserving baseline vendors. Add a test vendor first before testing delete retention.');
      return;
    }
    const victim = vendors[vendors.length - 1];
    db.deleteVendorWithColdRetention(victim.vendor_id);
    setTestResult(`Fired trg_vendor_before_delete_cold_retention! Vendor '${victim.name}' archived to vendor_cold_retention_log before deletion.`);
  };

  return (
    <div className="space-y-6">
      {/* Trigger Fire Action Bar */}
      <div className="p-6 rounded-2xl glass-panel border border-[#FF9F1C]/25 space-y-4">
        <div>
          <h4 className="text-sm font-bold font-syne text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FF9F1C]" />
            Automated Database Triggers Testbench (7 Triggers Implemented)
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Trigger actions directly against the database engine to observe BEFORE/AFTER trigger execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleTestNegativeStockTrigger}
            className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 text-left text-xs font-mono text-red-200 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between font-bold text-red-400">
              <span>Trigger 4 Test</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="mt-1">Test Negative Stock Violation</div>
            <div className="text-[10px] text-red-400/80 mt-1">Signals SQLSTATE '45000'</div>
          </button>

          <button
            onClick={handleTestCityTraceTrigger}
            className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-left text-xs font-mono text-amber-200 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between font-bold text-[#FF9F1C]">
              <span>Trigger 2 Test</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="mt-1">Update Vendor City</div>
            <div className="text-[10px] text-amber-400/80 mt-1">Logs to vendor_city_trace</div>
          </button>

          <button
            onClick={handleTestOnboardVendorTrigger}
            className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 hover:bg-teal-900/50 text-left text-xs font-mono text-teal-200 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between font-bold text-[#2EC4B6]">
              <span>Trigger 1 Test</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="mt-1">Onboard New Vendor</div>
            <div className="text-[10px] text-teal-400/80 mt-1">Logs to vendor_audit</div>
          </button>

          <button
            onClick={handleTestDeleteRetentionTrigger}
            className="p-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-left text-xs font-mono text-neutral-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between font-bold text-neutral-400">
              <span>Trigger 3 Test</span>
              <History className="w-4 h-4" />
            </div>
            <div className="mt-1">Delete Vendor</div>
            <div className="text-[10px] text-neutral-500 mt-1">Pre-delete cold archive</div>
          </button>
        </div>

        {/* Dynamic Alerts */}
        {negativeTriggerAlert && (
          <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/60 text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{negativeTriggerAlert}</span>
          </div>
        )}

        {testResult && (
          <div className="p-3.5 rounded-xl bg-[#2EC4B6]/15 border border-[#2EC4B6]/30 text-xs font-mono text-[#2EC4B6] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2EC4B6] flex-shrink-0" />
            <span>{testResult}</span>
          </div>
        )}
      </div>

      {/* 3 Audit Trail Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table 1: vendor_audit */}
        <div className="p-4 rounded-2xl bg-[#0B0908] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-mono font-bold text-white">vendor_audit ({audits.length})</h5>
            <span className="text-[10px] font-mono text-[#2EC4B6]">AFTER INSERT</span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {audits.map((a) => (
              <div key={a.audit_id} className="p-2.5 rounded-xl bg-white/5 text-[11px] font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Audit #{a.audit_id} • {a.action_type}</span>
                  <span>{a.logged_at.substring(11, 19)}</span>
                </div>
                <div className="text-white font-bold mt-1 truncate">{a.vendor_name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2: vendor_city_trace */}
        <div className="p-4 rounded-2xl bg-[#0B0908] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-mono font-bold text-white">vendor_city_trace ({traces.length})</h5>
            <span className="text-[10px] font-mono text-[#FF9F1C]">AFTER UPDATE</span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {traces.length === 0 ? (
              <div className="text-neutral-500 text-xs font-mono p-4 text-center">No city traces yet. Click Trigger 2 Test above.</div>
            ) : (
              traces.map((t) => (
                <div key={t.trace_id} className="p-2.5 rounded-xl bg-white/5 text-[11px] font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Trace #{t.trace_id} (Vendor #{t.vendor_id})</span>
                    <span>{t.changed_at.substring(11, 19)}</span>
                  </div>
                  <div className="text-[#FF9F1C] font-bold mt-1">
                    {t.old_city} &rarr; {t.new_city}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table 3: vendor_cold_retention_log */}
        <div className="p-4 rounded-2xl bg-[#0B0908] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-mono font-bold text-white">vendor_cold_retention_log ({retentions.length})</h5>
            <span className="text-[10px] font-mono text-red-400">BEFORE DELETE</span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {retentions.length === 0 ? (
              <div className="text-neutral-500 text-xs font-mono p-4 text-center">Archive empty. Click Trigger 3 Test above.</div>
            ) : (
              retentions.map((r) => (
                <div key={r.archive_id} className="p-2.5 rounded-xl bg-white/5 text-[11px] font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Archive #{r.archive_id}</span>
                    <span>{r.deleted_at.substring(11, 19)}</span>
                  </div>
                  <div className="text-red-300 font-bold mt-1 truncate">{r.name}</div>
                  <div className="text-neutral-400 text-[10px]">{r.phone} • {r.city}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
