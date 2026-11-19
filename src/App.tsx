import React, { useState, useEffect } from 'react';
import { db } from './db/dbEngine';
import { UserRole, CampusZone, MealSlot } from './types';
import { Navbar } from './components/Navbar';
import { ThreeHeroScene } from './components/ThreeHeroScene';
import { CampusMessExplorer } from './components/StudentView/CampusMessExplorer';
import { ActiveOrderTracker } from './components/StudentView/ActiveOrderTracker';
import { StudentProfileModal } from './components/StudentView/StudentProfileModal';
import { KitchenCommandCenter } from './components/VendorView/KitchenCommandCenter';
import { DbmsTelemetryDrawer } from './components/DbmsInspector/DbmsTelemetryDrawer';
import { ViewInspector } from './components/DbmsInspector/ViewInspector';
import { StoredProcRunner } from './components/DbmsInspector/StoredProcRunner';
import { TriggerAuditPanel } from './components/DbmsInspector/TriggerAuditPanel';
import { ConcurrencySimLab } from './components/DbmsInspector/ConcurrencySimLab';
import { ShardingVisualizer } from './components/DbmsInspector/ShardingVisualizer';
import { SemijoinExplainLab } from './components/DbmsInspector/SemijoinExplainLab';
import { SqlConsole } from './components/DbmsInspector/SqlConsole';
import {
  Clock,
  Sparkles,
  Database,
  ShieldCheck,
  Award,
  Layers,
  Zap,
  Terminal,
  FileCode2,
  ExternalLink,
  Play
} from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [selectedZone, setSelectedZone] = useState<CampusZone>('Bibwewadi');
  const [activeSlot, setActiveSlot] = useState<MealSlot>('Lunch');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<
    'views' | 'procedures' | 'triggers' | 'concurrency' | 'sharding' | 'semijoin' | 'console'
  >('views');

  // Trigger state refresh on db mutation
  const [, setDbTick] = useState(0);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setDbTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const loggedInStudent = db.getCustomers()[0];
  const allOrders = db.getOrders();

  return (
    <div className="min-h-screen bg-[#0B0908] text-neutral-100 flex flex-col font-sans selection:bg-[#FF9F1C]/30 selection:text-[#FF9F1C]">
      {/* Top Background Glow Ambient Elements */}
      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[600px] h-[350px] bg-[#FF9F1C]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-40 right-10 w-[500px] h-[350px] bg-[#E71D36]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Floating Glassmorphic Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        selectedZone={selectedZone}
        onZoneChange={setSelectedZone}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        loyaltyPoints={loggedInStudent.loyalty_points}
      />

      {/* Main Role Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pb-16 relative z-10">
        {/* ============================================================== */}
        {/* ROLE 1: STUDENT VIEW (Customer Mess Discovery & Dynamic Ticker) */}
        {/* ============================================================== */}
        {currentRole === 'student' && (
          <div className="space-y-8 animate-fade-in">
            {/* Interactive 3D Hero Scene with Craving Clock Dial & Floating Thali */}
            <ThreeHeroScene activeSlot={activeSlot} onSlotSelect={setActiveSlot} />

            {/* Active In-Flight Orders Dispatch Tracker */}
            <ActiveOrderTracker orders={allOrders} />

            {/* Live Mess Discovery Grid */}
            <CampusMessExplorer
              selectedZone={selectedZone}
              activeSlot={activeSlot}
              onOrderPlaced={() => setIsProfileOpen(false)}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE 2: MESS OWNER VIEW (Kitchen Command Center & Surge)        */}
        {/* ============================================================== */}
        {currentRole === 'vendor' && (
          <div className="animate-fade-in">
            <KitchenCommandCenter activeSlot={activeSlot} />
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE 3: DBMS LAB EVALUATION DASHBOARD                          */}
        {/* ============================================================== */}
        {currentRole === 'dbms_evaluator' && (
          <div className="space-y-6 animate-fade-in">
            {/* Evaluator Welcome Banner */}
            <div className="p-6 rounded-3xl glass-panel-elevated border border-[#2EC4B6]/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2EC4B6] animate-ping" />
                  <span className="text-xs font-mono text-[#2EC4B6] font-bold uppercase tracking-wider">
                    VIT PUNE DBMS LAB EVALUATION BENCH
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-syne text-white">
                  Relational Schema, Views, Procedures, Triggers & ACID Telemetry
                </h2>
                <p className="text-xs text-neutral-400 font-sans max-w-2xl">
                  Interactive real-time execution inspector for 4 Structural Views, 4 Stored Procedures with CURSORs, 7 Automated Triggers, Exclusive Row-Locks (SELECT FOR UPDATE), Sharding partitions, and Semijoin optimizations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/database/Craving_Clock_DBMS_Architecture_Report.docx"
                  download="Craving_Clock_DBMS_Architecture_Report.docx"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-xs shadow-lg shadow-[#FF9F1C]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <FileCode2 className="w-4 h-4" />
                  <span>Download Word Report (.docx)</span>
                </a>

                <button
                  onClick={() => setIsInspectorOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2EC4B6] to-[#0D9488] text-black font-bold font-syne text-xs shadow-lg shadow-[#2EC4B6]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Open Drawer Logs</span>
                </button>
              </div>
            </div>

            {/* Evaluator Sub-Nav Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { id: 'views' as const, label: '4 Structural Views', icon: Database },
                { id: 'procedures' as const, label: '4 Stored Procedures', icon: Play },
                { id: 'triggers' as const, label: '7 Triggers & Audits', icon: Zap },
                { id: 'concurrency' as const, label: 'ACID Row-Lock Race Lab', icon: ShieldCheck },
                { id: 'sharding' as const, label: 'Campus Zone Sharding', icon: Layers },
                { id: 'semijoin' as const, label: 'Semijoin / Anti-Semijoin', icon: ExternalLink },
                { id: 'console' as const, label: 'Interactive SQL Console', icon: Terminal }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeInspectorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveInspectorTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold shadow-lg shadow-[#FF9F1C]/20'
                        : 'bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Inspector Screen */}
            <div className="pt-2">
              {activeInspectorTab === 'views' && <ViewInspector />}
              {activeInspectorTab === 'procedures' && <StoredProcRunner />}
              {activeInspectorTab === 'triggers' && <TriggerAuditPanel />}
              {activeInspectorTab === 'concurrency' && <ConcurrencySimLab />}
              {activeInspectorTab === 'sharding' && <ShardingVisualizer />}
              {activeInspectorTab === 'semijoin' && <SemijoinExplainLab />}
              {activeInspectorTab === 'console' && <SqlConsole />}
            </div>
          </div>
        )}
      </main>

      {/* Global Bottom Sticky Banner with Live Telemetry Quick Bar */}
      <footer className="border-t border-white/10 bg-[#0B0908]/90 backdrop-blur-md py-4 px-4 sm:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2EC4B6]" />
            <span className="text-white font-bold">Craving Clock DBMS Engine</span>
            <span>•</span>
            <span className="hidden sm:inline">Vishwakarma Institute of Technology, Pune</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="/database/Craving_Clock_DBMS_Architecture_Report.docx"
              download="Craving_Clock_DBMS_Architecture_Report.docx"
              className="text-[#FF9F1C] hover:underline flex items-center gap-1 font-bold"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Word Report (.docx)</span>
            </a>
            <span>•</span>
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="text-[#2EC4B6] hover:underline flex items-center gap-1 font-bold"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Inspect Live SQL Stream ({db.getTelemetryLogs().length})</span>
            </button>
            <span>•</span>
            <span>InnoDB Strict • MySQL 8.0</span>
          </div>
        </div>
      </footer>

      {/* Global DBMS Telemetry & Architecture Drawer */}
      <DbmsTelemetryDrawer isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} />

      {/* Student Profile & Digital Smart Card Modal */}
      {isProfileOpen && <StudentProfileModal onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}

export default App;
