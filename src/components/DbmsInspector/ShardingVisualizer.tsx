import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { Layers, Network, Server, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export const ShardingVisualizer: React.FC = () => {
  const [selectedShard, setSelectedShard] = useState<'All' | 'Bibwewadi' | 'Upper Indira Nagar' | 'Kondhwa' | 'Katraj'>('Bibwewadi');

  const shards = [
    {
      id: 'p_bibwewadi',
      zone: 'Bibwewadi',
      node: 'Shard Node A (VIT Main Campus)',
      messes: ['Annapurna Mess Bibwewadi', 'Sai Krupa Dining Hall'],
      rows: 2,
      latency: '1.2 ms',
      pruned: selectedShard !== 'All' && selectedShard !== 'Bibwewadi'
    },
    {
      id: 'p_indira_nagar',
      zone: 'Upper Indira Nagar',
      node: 'Shard Node B (Student Hostels)',
      messes: ['Maharaja Special Thali Kitchen', 'Indira Nagar Home Mess'],
      rows: 2,
      latency: '1.4 ms',
      pruned: selectedShard !== 'All' && selectedShard !== 'Upper Indira Nagar'
    },
    {
      id: 'p_kondhwa',
      zone: 'Kondhwa',
      node: 'Shard Node C (VIT Upper Campus)',
      messes: ['Kondhwa Campus Rasoi'],
      rows: 1,
      latency: '1.1 ms',
      pruned: selectedShard !== 'All' && selectedShard !== 'Kondhwa'
    },
    {
      id: 'p_katraj',
      zone: 'Katraj',
      node: 'Shard Node D (Transit Corridor)',
      messes: ['Katraj Lake Student Bhojanalaya'],
      rows: 1,
      latency: '1.6 ms',
      pruned: selectedShard !== 'All' && selectedShard !== 'Katraj'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Horizontal Partitioning Section */}
      <div className="p-6 rounded-2xl glass-panel border border-[#FF9F1C]/25 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold font-syne text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF9F1C]" />
              Campus Zone Horizontal Sharding & Partition Pruning Engine
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5 font-sans">
              Range/List partitioned on <code>VENDORS.area_zone</code> to isolate local mess traffic per campus cluster.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-neutral-400 mr-1">Query Route:</span>
            {(['All', 'Bibwewadi', 'Upper Indira Nagar', 'Kondhwa', 'Katraj'] as const).map((z) => (
              <button
                key={z}
                onClick={() => setSelectedShard(z)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  selectedShard === z
                    ? 'bg-[#FF9F1C] text-black font-bold border-[#FF9F1C]'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Shard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {shards.map((shard) => (
            <div
              key={shard.id}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                shard.pruned
                  ? 'bg-neutral-900/30 border-white/5 opacity-35'
                  : 'bg-[#0B0908] border-[#FF9F1C]/40 shadow-lg shadow-[#FF9F1C]/10 scale-[1.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#FF9F1C] font-bold uppercase">
                  {shard.id}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    shard.pruned ? 'bg-red-500/10 text-red-400' : 'bg-[#2EC4B6]/15 text-[#2EC4B6]'
                  }`}
                >
                  {shard.pruned ? 'PRUNED' : 'ROUTED'}
                </span>
              </div>

              <div className="text-xs font-bold text-white font-mono flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-[#2EC4B6]" />
                <span>{shard.node}</span>
              </div>

              <div className="mt-3 space-y-1 text-[11px] font-mono text-neutral-300">
                <div className="text-neutral-500 text-[10px]">HOSTED MESSES:</div>
                {shard.messes.map((m) => (
                  <div key={m} className="truncate text-white font-medium">• {m}</div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] font-mono text-neutral-400">
                <span>Latency: {shard.latency}</span>
                <span>Rows: {shard.rows}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Shard Pruning Telemetry Explainer */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 text-xs font-mono text-neutral-300 flex items-center justify-between">
          <span>
            Query Optimization Result:{' '}
            <strong className="text-[#2EC4B6]">
              {selectedShard === 'All' ? 'Scanning all 4 shards' : `Partition Pruning Active — 3 of 4 shards pruned from execution tree!`}
            </strong>
          </span>
          <span className="text-neutral-500 text-[11px]">I/O Reduced by 75%</span>
        </div>
      </div>

      {/* Vertical Sharding Decomposition Section */}
      <div className="p-6 rounded-2xl glass-panel border border-[#2EC4B6]/25 space-y-4">
        <div>
          <h4 className="text-sm font-bold font-syne text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-[#2EC4B6]" />
            Vertical Sharding & 3NF Normalization Decomposition
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Splits wide entity <code>CUSTOMERS</code> into Hot Identity and Cold Extended storage for high-frequency token generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0B0908] border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-[#FF9F1C]">Customer_Core_Identity (Hot Cache)</span>
              <span className="text-[10px] text-neutral-400">In-Memory / Redis</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Fast lookup during biometric/ID token order submission:
            </p>
            <div className="p-3 rounded-lg bg-black/50 text-[#2EC4B6] space-y-1">
              <div>• cust_id (PK, INT)</div>
              <div>• regd_no (UNIQUE, VARCHAR) [e.g. VIT-AIML-D-13]</div>
              <div>• phone (UNIQUE, VARCHAR)</div>
              <div>• state (ENUM 'active', 'inactive')</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0908] border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-[#2EC4B6]">Customer_Profile_Extended (Cold Storage)</span>
              <span className="text-[10px] text-neutral-400">NVMe Relational Disk</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Infrequently accessed delivery coordinates & academic program info:
            </p>
            <div className="p-3 rounded-lg bg-black/50 text-neutral-300 space-y-1">
              <div>• cust_id (FK to Core)</div>
              <div>• name (VARCHAR)</div>
              <div>• course (VARCHAR) [e.g. B.Tech AI & Data Science]</div>
              <div>• address (TEXT) [Hostel B, Room 204]</div>
              <div>• loyalty_points (INT)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
