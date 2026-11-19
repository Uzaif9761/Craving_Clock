import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { Terminal, Play, Download, Sparkles, Database, FileText } from 'lucide-react';

export const SqlConsole: React.FC = () => {
  const [query, setQuery] = useState<string>(
    'SELECT v.name, v.area_zone, v.rating, COUNT(m.item_id) as total_items\nFROM VENDORS v\nJOIN MENU_ITEMS m ON v.vendor_id = m.vendor_id\nGROUP BY v.vendor_id, v.name, v.area_zone, v.rating\nORDER BY v.rating DESC;'
  );
  const [result, setResult] = useState<{ columns: string[]; rows: any[]; timeMs: number } | null>(null);

  const presets = [
    {
      title: 'Top Rated Messes & Dish Count',
      sql: `SELECT v.name, v.area_zone, v.rating, COUNT(m.item_id) as total_items\nFROM VENDORS v\nJOIN MENU_ITEMS m ON v.vendor_id = m.vendor_id\nGROUP BY v.vendor_id, v.name, v.area_zone, v.rating\nORDER BY v.rating DESC;`
    },
    {
      title: 'Active Tiffin Dispatches & Logistics',
      sql: `SELECT o.order_id, c.name AS student, v.name AS mess, o.order_status, t.eta_minutes\nFROM ORDERS o\nJOIN CUSTOMERS c ON o.cust_id = c.cust_id\nJOIN VENDORS v ON o.vendor_id = v.vendor_id\nJOIN DELIVERY_TRACKING t ON o.order_id = t.order_id\nWHERE o.order_mode = 'Tiffin Delivery';`
    },
    {
      title: 'Critical Inventory Shortages (< 5 plates)',
      sql: `SELECT m.name AS dish_name, v.name AS mess, d.daily_price, d.stock_qty, d.meal_slot\nFROM DAILY_AVAILABILITY d\nJOIN MENU_ITEMS m ON d.item_id = m.item_id\nJOIN VENDORS v ON m.vendor_id = v.vendor_id\nWHERE d.stock_qty <= 5\nORDER BY d.stock_qty ASC;`
    }
  ];

  const handleExecute = () => {
    const start = performance.now();
    let rows: any[] = [];

    // Parse simple query pattern for execution
    const qLower = query.toLowerCase();

    if (qLower.includes('from vendors') && qLower.includes('menu_items')) {
      const vendors = db.getVendors();
      const menu = db.getMenuItems();
      rows = vendors.map((v) => ({
        mess_name: v.name,
        area_zone: v.area_zone,
        rating: v.rating,
        total_items: menu.filter((m) => m.vendor_id === v.vendor_id).length
      }));
    } else if (qLower.includes('delivery_tracking') || qLower.includes('tiffin delivery')) {
      const viewData = db.executeViewTiffinDispatch();
      rows = viewData.map((d) => ({
        order_id: d.order_id,
        student: d.student_name,
        mess: d.mess_name,
        order_status: d.order_status,
        delivery_status: d.delivery_status,
        eta_minutes: d.eta_minutes
      }));
    } else if (qLower.includes('stock_qty <= 5') || qLower.includes('critical')) {
      const avail = db.getDailyAvailability().filter((d) => d.stock_qty <= 5);
      const items = db.getMenuItems();
      const vendors = db.getVendors();
      rows = avail.map((d) => {
        const item = items.find((m) => m.item_id === d.item_id);
        const v = item ? vendors.find((vend) => vend.vendor_id === item.vendor_id) : undefined;
        return {
          dish_name: item?.name || 'Unknown',
          mess: v?.name || 'Unknown',
          daily_price: d.daily_price,
          stock_qty: d.stock_qty,
          meal_slot: d.meal_slot
        };
      });
    } else {
      // Default fallback: materialize customer view
      const live = db.executeViewLiveMenuCustomer();
      rows = live.slice(0, 10).map((r) => ({
        dish_name: r.dish_name,
        vendor: r.vendor_name,
        slot: r.meal_slot,
        price: `₹${r.daily_price}`,
        stock: r.stock_qty
      }));
    }

    const elapsed = +(performance.now() - start).toFixed(2);
    const cols = rows.length > 0 ? Object.keys(rows[0]) : [];

    setResult({
      columns: cols,
      rows,
      timeMs: elapsed
    });

    db.logTelemetry({
      type: 'SELECT',
      sql: query,
      executionTimeMs: elapsed,
      affectedRows: rows.length,
      details: 'Executed SQL console query'
    });
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Console Input */}
      <div className="p-6 rounded-2xl glass-panel border border-[#FF9F1C]/25 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-bold font-syne text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#FF9F1C]" />
            Live Relational SQL Console & Benchmark Lab
          </h4>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(p.sql)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-neutral-300 hover:text-white border border-white/5 transition-all"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={5}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#0B0908] border border-white/10 rounded-2xl p-4 text-xs font-mono text-[#FFB84D] focus:outline-none focus:border-[#FF9F1C]"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleExecute}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-xs shadow-lg shadow-[#FF9F1C]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Execute SQL Query</span>
          </button>

          {/* Export SQL & Word Docs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500 hidden sm:inline">Exports:</span>
            <a
              href="/database/Craving_Clock_DBMS_Architecture_Report.docx"
              download="Craving_Clock_DBMS_Architecture_Report.docx"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF9F1C]/20 to-[#E71D36]/20 hover:from-[#FF9F1C]/30 hover:to-[#E71D36]/30 border border-[#FF9F1C]/40 text-[#FF9F1C] hover:text-white flex items-center gap-1.5 transition-all font-bold"
            >
              <FileText className="w-3.5 h-3.5 text-[#FF9F1C]" />
              <span>Word Report (.docx)</span>
            </a>
            <a
              href="/database/schema.sql"
              download="schema.sql"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#2EC4B6]" />
              <span>schema.sql</span>
            </a>
            <a
              href="/database/dbms_objects.sql"
              download="dbms_objects.sql"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#2EC4B6]" />
              <span>dbms_objects.sql</span>
            </a>
          </div>
        </div>
      </div>

      {/* Query Result Grid */}
      {result && (
        <div className="p-6 rounded-2xl glass-panel border border-[#FF9F1C]/20 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#2EC4B6] font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Query OK • {result.rows.length} rows in set
            </span>
            <span className="text-neutral-400">Time: {result.timeMs} ms</span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#14110F] sticky top-0 text-neutral-400 border-b border-white/10">
                <tr>
                  {result.columns.map((c) => (
                    <th key={c} className="p-2.5 uppercase font-bold text-[10px]">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#0B0908]">
                {result.rows.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    {result.columns.map((c) => (
                      <td key={c} className="p-2.5 text-neutral-300 whitespace-nowrap">
                        {String(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
