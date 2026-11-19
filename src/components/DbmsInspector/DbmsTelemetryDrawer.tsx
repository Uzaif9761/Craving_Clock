import React, { useState, useEffect } from 'react';
import { db } from '../../db/dbEngine';
import { SqlTelemetryLog } from '../../types';
import { ViewInspector } from './ViewInspector';
import { StoredProcRunner } from './StoredProcRunner';
import { TriggerAuditPanel } from './TriggerAuditPanel';
import { ConcurrencySimLab } from './ConcurrencySimLab';
import { ShardingVisualizer } from './ShardingVisualizer';
import { SemijoinExplainLab } from './SemijoinExplainLab';
import { SqlConsole } from './SqlConsole';
import {
  Database,
  Terminal,
  Layers,
  Zap,
  Play,
  GitCompare,
  Shield,
  RotateCcw,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  Lock
} from 'lucide-react';

interface DbmsTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbmsTelemetryDrawer: React.FC<DbmsTelemetryDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'telemetry' | 'views' | 'procedures' | 'triggers' | 'concurrency' | 'sharding' | 'semijoin' | 'console'
  >('telemetry');
  const [logs, setLogs] = useState<SqlTelemetryLog[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const updateLogs = () => {
      setLogs([...db.getTelemetryLogs()]);
    };
    updateLogs();
    const unsubscribe = db.subscribe(updateLogs);
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'telemetry' as const, label: 'Live Telemetry', icon: Terminal, count: logs.length },
    { id: 'views' as const, label: '4 Views', icon: Database },
    { id: 'procedures' as const, label: '4 Stored Procs', icon: Play },
    { id: 'triggers' as const, label: '7 Triggers', icon: Zap },
    { id: 'concurrency' as const, label: 'Row-Lock Lab', icon: Shield },
    { id: 'sharding' as const, label: 'Campus Sharding', icon: Layers },
    { id: 'semijoin' as const, label: 'Semijoin Lab', icon: GitCompare },
    { id: 'console' as const, label: 'SQL Console', icon: Terminal }
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full glass-panel-elevated border-t border-[#FF9F1C]/40 rounded-t-3xl shadow-2xl flex flex-col transition-all duration-300 ${
          isMaximized ? 'h-[96vh]' : 'h-[92vh] sm:h-[86vh]'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#0D9488] flex items-center justify-center text-black font-bold shadow-md shadow-[#2EC4B6]/20 flex-shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold font-syne text-white">
                  DBMS Architecture & SQL Telemetry Inspector
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2EC4B6]/15 text-[#2EC4B6] border border-[#2EC4B6]/30 font-bold hidden xs:inline">
                  VIT LAB BENCH
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-neutral-400">
                10 Relational Tables • Views • Stored Procs • Triggers • Row-Locks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => db.resetDatabase()}
              title="Reseed database state to initial baseline"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300 hover:text-white border border-white/5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#FF9F1C]" />
              <span className="hidden sm:inline">Reseed DB</span>
            </button>

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all hidden sm:block"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation with horizontal scrolling */}
        <div className="px-3 sm:px-6 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-[#0B0908]/70">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 text-neutral-200">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {activeTab === 'telemetry' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-mono text-neutral-400">
                  Real-time parameterized stream of all executed operations:
                </span>
                <button
                  onClick={() => db.clearTelemetry()}
                  className="flex items-center gap-1 text-xs font-mono text-neutral-400 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Stream</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {logs.map((log) => {
                  let badge = { bg: 'bg-blue-500/15', text: 'text-blue-400' };
                  if (log.type === 'TRANSACTION') badge = { bg: 'bg-purple-500/20', text: 'text-purple-300' };
                  if (log.type === 'PROCEDURE') badge = { bg: 'bg-[#FF9F1C]/20', text: 'text-[#FF9F1C]' };
                  if (log.type === 'TRIGGER') badge = { bg: 'bg-[#2EC4B6]/20', text: 'text-[#2EC4B6]' };
                  if (log.type === 'LOCK') badge = { bg: 'bg-red-500/20', text: 'text-red-300' };
                  if (log.type === 'VIEW') badge = { bg: 'bg-teal-500/20', text: 'text-teal-300' };

                  return (
                    <div
                      key={log.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-[#0B0908] border border-white/5 space-y-1.5 hover:border-white/20 transition-all font-mono"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                            {log.type}
                          </span>
                          <span className="text-neutral-500 text-[10px] sm:text-[11px]">{log.timestamp}</span>
                          {log.lockStatus && log.lockStatus !== 'NONE' && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              {log.lockStatus}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-neutral-400">
                          <span>{log.executionTimeMs} ms</span>
                          <span>•</span>
                          <span>{log.affectedRows} row(s)</span>
                        </div>
                      </div>

                      <pre className="text-xs text-[#FFB84D] whitespace-pre-wrap overflow-x-auto leading-relaxed pt-1">
                        <code>{log.sql}</code>
                      </pre>

                      {log.details && (
                        <div className="text-[10px] sm:text-[11px] text-neutral-400 pt-1 border-t border-white/5">
                          {log.details}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'views' && <ViewInspector />}
          {activeTab === 'procedures' && <StoredProcRunner />}
          {activeTab === 'triggers' && <TriggerAuditPanel />}
          {activeTab === 'concurrency' && <ConcurrencySimLab />}
          {activeTab === 'sharding' && <ShardingVisualizer />}
          {activeTab === 'semijoin' && <SemijoinExplainLab />}
          {activeTab === 'console' && <SqlConsole />}
        </div>
      </div>
    </div>
  );
};
