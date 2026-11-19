import React from 'react';
import { UserRole, CampusZone } from '../types';
import { Clock, Database, Utensils, Sparkles, MapPin, Award, Menu } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedZone: CampusZone;
  onZoneChange: (zone: CampusZone) => void;
  onOpenInspector: () => void;
  onOpenProfile: () => void;
  loyaltyPoints: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  selectedZone,
  onZoneChange,
  onOpenInspector,
  onOpenProfile,
  loyaltyPoints
}) => {
  const zones: CampusZone[] = ['All Zones', 'Bibwewadi', 'Upper Indira Nagar', 'Kondhwa', 'Katraj'];

  return (
    <header className="sticky top-2 sm:top-4 z-40 px-2 sm:px-6 lg:px-8 mb-4 sm:mb-6">
      <div className="max-w-7xl mx-auto glass-panel-elevated rounded-2xl p-2.5 sm:p-3.5 flex flex-col gap-2.5 sm:gap-3 border border-[#FF9F1C]/25 shadow-2xl">
        {/* Row 1: Brand & Role Switcher & Inspector Quick Button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF9F1C] to-[#E71D36] flex items-center justify-center text-white shadow-lg shadow-[#FF9F1C]/30 flex-shrink-0">
              <Clock className="w-5 h-5 animate-pulse-subtle" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#2EC4B6] rounded-full border-2 border-[#0B0908]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold font-syne tracking-tight text-white">
                  Craving<span className="text-[#FF9F1C]">Clock</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30 hidden xs:inline">
                  VIT PUNE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono hidden md:block">
                Campus Daily Mess Menus & Live Inventory
              </p>
            </div>
          </div>

          {/* Right Action Controls: Role Switcher + Telemetry Drawer Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-[#0B0908]/90 border border-[#FF9F1C]/20">
              <button
                onClick={() => onRoleChange('student')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'student'
                    ? 'bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Student Explorer View"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student</span>
              </button>

              <button
                onClick={() => onRoleChange('vendor')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'vendor'
                    ? 'bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Mess Owner Command Center"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mess Owner</span>
              </button>

              <button
                onClick={() => onRoleChange('dbms_evaluator')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'dbms_evaluator'
                    ? 'bg-gradient-to-r from-[#2EC4B6] to-[#0D9488] text-black font-bold shadow-md shadow-[#2EC4B6]/20'
                    : 'text-neutral-400 hover:text-[#2EC4B6]'
                }`}
                title="DBMS Lab Architecture Inspector"
              >
                <Database className="w-3.5 h-3.5 text-[#2EC4B6]" />
                <span className="hidden md:inline">DBMS Lab</span>
                <span className="md:hidden hidden sm:inline">DBMS</span>
              </button>
            </div>

            {/* Student Profile & Loyalty Pill */}
            {currentRole === 'student' && (
              <button
                onClick={onOpenProfile}
                title="View Student Smart Card & Loyalty Tier"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FF9F1C]/10 border border-[#FF9F1C]/30 text-[#FF9F1C] hover:bg-[#FF9F1C]/20 transition-all text-xs font-mono"
              >
                <Award className="w-3.5 h-3.5 text-[#FF9F1C]" />
                <span className="font-bold">{loyaltyPoints} <span className="hidden xs:inline">pts</span></span>
              </button>
            )}

            {/* Live SQL Telemetry Fast Button */}
            <button
              onClick={onOpenInspector}
              title="Open Live SQL Telemetry Drawer"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white transition-all flex-shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-[#2EC4B6]" />
              <span className="hidden lg:inline">SQL Logs</span>
            </button>
          </div>
        </div>

        {/* Row 2: Campus Zone Sharding Horizontal Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none text-xs font-mono border-t border-white/5">
          <div className="flex items-center gap-1 text-neutral-400 pl-1 pr-1 flex-shrink-0 text-[11px]">
            <MapPin className="w-3 h-3 text-[#FF9F1C]" />
            <span className="hidden sm:inline">ZONE:</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => onZoneChange(zone)}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap text-[11px] sm:text-xs ${
                  selectedZone === zone
                    ? 'bg-[#FF9F1C] text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
