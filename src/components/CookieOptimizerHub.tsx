import React, { useState, useMemo } from 'react';
import {
  Cookie,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sliders,
  Calculator,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { getAffiliateInsight } from '../utils/metaBreakdown';

export function formatIDR(val: number): string {
  if (isNaN(val) || !isFinite(val)) return 'Rp 0';
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

export function formatNum(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  return Math.round(val).toLocaleString('id-ID');
}

export interface OptimizerItem {
  id: string;
  name: string;
  type: 'tag' | 'campaign' | 'adset' | 'ad';
  tag?: string;
  spend: number;
  metaClicks: number;
  shopeeClicks: number;
  commission: number;
  orders: number;
  cprc: number;
  epc: number;
  margin: number;
  roas: number;
  leakagePct: number;
  daysActive?: number;
  insight: ReturnType<typeof getAffiliateInsight>;
}

interface CookieOptimizerHubProps {
  tagsData: any[];
  allMetaRows?: any[];
  overallLeakagePct: number;
  defaultCprc?: number;
  defaultEpc?: number;
  defaultAvgComm?: number;
  onSelectInspection: (scopeType: string, selectedKey: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const CookieOptimizerHub: React.FC<CookieOptimizerHubProps> = ({
  tagsData = [],
  overallLeakagePct = 0,
  defaultCprc = 450,
  defaultEpc = 600,
  defaultAvgComm = 8000,
  onSelectInspection,
  onNavigateToTab
}) => {
  // Tabs: 'recommendations' | 'simulator' | 'playbook'
  const [activeTab, setActiveTab] = useState<'recommendations' | 'simulator' | 'playbook'>('recommendations');
  const [actionFilter, setActionFilter] = useState<'all' | 'kill' | 'scale' | 'maturing' | 'fix_leakage'>('all');

  // Simulator state
  const [simDailyBudget, setSimDailyBudget] = useState<number>(100000);
  const [simCprc, setSimCprc] = useState<number>(defaultCprc > 0 ? Math.round(defaultCprc) : 400);
  const [simCvr, setSimCvr] = useState<number>(4.5);
  const [simAvgComm, setSimAvgComm] = useState<number>(defaultAvgComm > 0 ? Math.round(defaultAvgComm) : 7500);
  const [simIndirectPct, setSimIndirectPct] = useState<number>(60);

  // 1. Compile all evaluated items across tags
  const evaluatedItems: OptimizerItem[] = useMemo(() => {
    if (!Array.isArray(tagsData) || tagsData.length === 0) return [];

    return tagsData.map((t, idx) => {
      const spend = Number(t.totalSpentWithPpn || t.amountSpent || 0);
      const metaClicks = Number(t.metaClicks || 0);
      const shopeeClicks = Number(t.shopeeClicks || 0);
      const commission = Number(t.shopeeCommission || 0);
      const orders = Number(t.shopeeOrders || 0);
      const roas = spend > 0 ? commission / spend : (commission > 0 ? 99 : 0);
      const cprc = shopeeClicks > 0 ? spend / shopeeClicks : (metaClicks > 0 ? spend / metaClicks : 0);
      const epc = shopeeClicks > 0 ? commission / shopeeClicks : 0;
      const margin = epc - cprc;
      const leakagePct = t.leakagePct !== undefined ? t.leakagePct : (metaClicks > 0 ? Math.max(0, (metaClicks - shopeeClicks) / metaClicks * 100) : 0);
      const daysActive = Array.isArray(t.clickDates) ? t.clickDates.length : undefined;

      const insight = getAffiliateInsight({
        roas,
        cprc,
        epc,
        leakage: leakagePct,
        spend,
        clicks: metaClicks,
        shopeeClicks,
        commission,
        profit: commission - spend,
        daysActive
      });

      return {
        id: t.tag || `tag-${idx}`,
        name: t.tag || '<Tanpa Tag>',
        type: 'tag',
        tag: t.tag,
        spend,
        metaClicks,
        shopeeClicks,
        commission,
        orders,
        cprc,
        epc,
        margin,
        roas,
        leakagePct,
        daysActive,
        insight
      };
    });
  }, [tagsData]);

  // Categorize
  const killItems = useMemo(() => evaluatedItems.filter(i => i.insight.tone === 'crimson' || i.insight.tone === 'red'), [evaluatedItems]);
  const scaleItems = useMemo(() => evaluatedItems.filter(i => i.insight.tone === 'green'), [evaluatedItems]);
  const maturingItems = useMemo(() => evaluatedItems.filter(i => i.insight.tone === 'blue' && (i.daysActive === undefined || i.daysActive <= 2)), [evaluatedItems]);
  const leakageWarningItems = useMemo(() => evaluatedItems.filter(i => i.insight.tone === 'orange' || i.leakagePct >= 50), [evaluatedItems]);

  const filteredItems = useMemo(() => {
    if (actionFilter === 'kill') return killItems;
    if (actionFilter === 'scale') return scaleItems;
    if (actionFilter === 'maturing') return maturingItems;
    if (actionFilter === 'fix_leakage') return leakageWarningItems;
    return evaluatedItems;
  }, [actionFilter, evaluatedItems, killItems, scaleItems, maturingItems, leakageWarningItems]);

  // 2. Simulator Calculations
  const simResults = useMemo(() => {
    const dailySpend = Math.max(0, simDailyBudget);
    const costPerCookie = Math.max(50, simCprc);
    const dailyCookies = dailySpend / costPerCookie;
    const weeklyCookies = dailyCookies * 7;
    const monthlyCookies = dailyCookies * 30;

    const convRate = Math.max(0.1, simCvr) / 100;
    const dailyOrders = dailyCookies * convRate;
    const weeklyOrders = weeklyCookies * convRate;
    const monthlyOrders = monthlyCookies * convRate;

    const indirectRatio = Math.min(100, Math.max(0, simIndirectPct)) / 100;
    const directRatio = 1 - indirectRatio;

    const weeklyDirectOrders = weeklyOrders * directRatio;
    const weeklyIndirectOrders = weeklyOrders * indirectRatio;

    const weeklyGrossCommission = weeklyOrders * simAvgComm;
    const weeklySpend = dailySpend * 7;
    const weeklyNetProfit = weeklyGrossCommission - weeklySpend;
    const weeklyRoas = weeklySpend > 0 ? weeklyGrossCommission / weeklySpend : 0;

    const monthlyGrossCommission = monthlyOrders * simAvgComm;
    const monthlySpend = dailySpend * 30;
    const monthlyNetProfit = monthlyGrossCommission - monthlySpend;

    // Breakeven CPRC: Maksimum CPRC agar tidak boncos = CVR * AvgComm
    const breakevenCprc = convRate * simAvgComm;
    const cookieSafetyBuffer = breakevenCprc - costPerCookie;

    return {
      dailyCookies: Math.round(dailyCookies),
      weeklyCookies: Math.round(weeklyCookies),
      monthlyCookies: Math.round(monthlyCookies),
      weeklyOrders: Math.round(weeklyOrders),
      weeklyDirectOrders: Math.round(weeklyDirectOrders),
      weeklyIndirectOrders: Math.round(weeklyIndirectOrders),
      weeklyGrossCommission,
      weeklySpend,
      weeklyNetProfit,
      weeklyRoas,
      monthlyGrossCommission,
      monthlySpend,
      monthlyNetProfit,
      breakevenCprc: Math.round(breakevenCprc),
      cookieSafetyBuffer: Math.round(cookieSafetyBuffer),
      isProfitable: weeklyNetProfit >= 0
    };
  }, [simDailyBudget, simCprc, simCvr, simAvgComm, simIndirectPct]);

  // Handler to load real metrics into simulator
  const handleApplyRealMetrics = () => {
    if (defaultCprc > 0) setSimCprc(Math.round(defaultCprc));
    if (defaultAvgComm > 0) setSimAvgComm(Math.round(defaultAvgComm));
  };

  return (
    <div className="mb-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Pusat Rekomendasi & Optimasi Iklan (Strategi Tanam Cookies)
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                Shopee Affiliate Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Analisis cerdas terarah untuk memaksimalkan penanaman cookies 7 hari, memangkas biaya per cookie (CPRC), dan memanen komisi keranjang belanja secara optimal.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Target size={14} className="text-indigo-500" />
            <span>Saran Tindakan Iklan ({evaluatedItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calculator size={14} className="text-emerald-500" />
            <span>Kalkulator & Simulator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('playbook')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'playbook'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} className="text-amber-500" />
            <span>Blueprint 7 Hari</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SARAN TINDAKAN IKLAN (RECOMMENDATION ENGINE) */}
      {activeTab === 'recommendations' && (
        <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
          {/* Quick Filter Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActionFilter('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  actionFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                Semua Tag & Iklan ({evaluatedItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActionFilter('kill')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  actionFilter === 'kill'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle size={13} />
                <span>🛑 Matikan / Kill ({killItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActionFilter('scale')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  actionFilter === 'scale'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100'
                }`}
              >
                <Flame size={13} />
                <span>🔥 Scale Up ({scaleItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActionFilter('maturing')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  actionFilter === 'maturing'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-900/60 hover:bg-sky-100'
                }`}
              >
                <Clock size={13} />
                <span>🌱 Cookie Maturing ({maturingItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActionFilter('fix_leakage')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  actionFilter === 'fix_leakage'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100'
                }`}
              >
                <span>🔧 Perbaiki Bocor ({leakageWarningItems.length})</span>
              </button>
            </div>

            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('cookie_hub')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Buka Cookie Hub Lengkap</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* Cards List */}
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
              <Cookie size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tidak Ada Iklan di Kategori Ini
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Semua kampanye atau tag pada kategori ini berjalan normal sesuai parameter kesehatan cookie.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => {
                const ins = item.insight;
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                  >
                    <div>
                      {/* Badge & Tag Title */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Tag Shopee Affiliate
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate" title={item.name}>
                            🏷️ {item.name}
                          </h4>
                        </div>
                        <span
                          className={`inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-full border shadow-2xs flex-shrink-0 ${ins.badgeCls}`}
                        >
                          {ins.label}
                        </span>
                      </div>

                      {/* Explanation & Action Box */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 mb-3 space-y-1.5">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {ins.description}
                        </p>
                        <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <Zap size={13} className="text-amber-500 flex-shrink-0" />
                          <span>Tindakan: {ins.action}</span>
                        </div>
                      </div>

                      {/* Unit Economics Numbers */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">CPRC</div>
                          <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                            {formatIDR(item.cprc)}
                          </div>
                          <div className="text-[8px] text-slate-400">/cookie</div>
                        </div>

                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">EPC</div>
                          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                            {formatIDR(item.epc)}
                          </div>
                          <div className="text-[8px] text-slate-400">hasil/cookie</div>
                        </div>

                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Bocor</div>
                          <div
                            className={`text-xs font-black font-mono mt-0.5 ${
                              item.leakagePct > 70 ? 'text-rose-600' : item.leakagePct >= 50 ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {item.leakagePct.toFixed(0)}%
                          </div>
                          <div className="text-[8px] text-slate-400">drop-off</div>
                        </div>

                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">ROAS</div>
                          <div className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                            {item.roas.toFixed(2)}x
                          </div>
                          <div className="text-[8px] text-slate-400">pengembalian</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        Spend: <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{formatIDR(item.spend)}</span> • Komisi: <span className="font-bold text-emerald-600 font-mono">{formatIDR(item.commission)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectInspection('tag', item.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 hover:bg-indigo-200/80 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                      >
                        <span>Inspeksi Harian & Placement</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KALKULATOR & SIMULATOR PROFIT TANAM COOKIES */}
      {activeTab === 'simulator' && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator size={18} className="text-emerald-500" />
                <span>Simulasi Anggaran & Potensi Panen Komisi</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hitung proyeksi jumlah cookies tertanam dan komisi keranjang belanja berdasarkan target pengeluaran iklan harian.
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyRealMetrics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 cursor-pointer shadow-2xs transition-colors"
            >
              <RefreshCw size={13} />
              <span>Gunakan Metrik Riil dari Data Anda</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Sliders */}
            <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              {/* Slider 1: Budget Harian */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Target Budget Iklan Harian:</span>
                  <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400">
                    {formatIDR(simDailyBudget)} / hari
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="1000000"
                  step="25000"
                  value={simDailyBudget}
                  onChange={e => setSimDailyBudget(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Rp 25.000</span>
                  <span>Rp 500.000</span>
                  <span>Rp 1.000.000</span>
                </div>
              </div>

              {/* Slider 2: CPRC (Biaya Riil per Cookie) */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Estimasi CPRC (Biaya Riil per 1 Cookie Tertanam):</span>
                  <span className="font-mono text-sm text-amber-600 dark:text-amber-400">
                    {formatIDR(simCprc)} / cookie
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="2000"
                  step="25"
                  value={simCprc}
                  onChange={e => setSimCprc(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-500 font-bold">Rp 150 (Sangat Murah)</span>
                  <span>Rp 800 (Sedang)</span>
                  <span className="text-rose-500 font-bold">Rp 2.000 (Mahal)</span>
                </div>
              </div>

              {/* Slider 3: CVR Keranjang Belanja */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Tingkat Checkout Keranjang (Shopee CVR):</span>
                  <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
                    {simCvr.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="15.0"
                  step="0.5"
                  value={simCvr}
                  onChange={e => setSimCvr(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1.0% (Konservatif)</span>
                  <span>5.0% (Rata-rata Normal)</span>
                  <span>15.0% (Viral Promo)</span>
                </div>
              </div>

              {/* Slider 4: Rata-rata Komisi per Pesanan */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Rata-rata Komisi per Pesanan:</span>
                  <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                    {formatIDR(simAvgComm)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="500"
                  value={simAvgComm}
                  onChange={e => setSimAvgComm(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Rp 2.000</span>
                  <span>Rp 15.000</span>
                  <span>Rp 30.000</span>
                </div>
              </div>

              {/* Slider 5: Porsi Keranjang Silang (Indirect) */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Porsi Keranjang Silang (Pesanan Produk Lain / Halo Effect):</span>
                  <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                    {simIndirectPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={simIndirectPct}
                  onChange={e => setSimIndirectPct(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10% (Kebanyakan Direct)</span>
                  <span>50% (Seimbang)</span>
                  <span>90% (Dominan Keranjang Lain)</span>
                </div>
              </div>
            </div>

            {/* Projected Outputs Panel */}
            <div className="lg:col-span-6 space-y-4">
              {/* Highlight Result Card */}
              <div
                className={`p-5 rounded-2xl border text-white shadow-lg relative overflow-hidden ${
                  simResults.isProfitable
                    ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 border-emerald-500/40'
                    : 'bg-gradient-to-br from-rose-950 via-slate-900 to-amber-950 border-rose-500/40'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      Proyeksi Profit Bersih (7 Hari)
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight mt-0.5">
                      {simResults.weeklyNetProfit >= 0 ? '+' : ''}
                      {formatIDR(simResults.weeklyNetProfit)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      Est. ROAS
                    </span>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {simResults.weeklyRoas.toFixed(2)}x
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-300">Total Komisi 7 Hari:</div>
                    <div className="font-bold font-mono text-emerald-400">
                      {formatIDR(simResults.weeklyGrossCommission)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300">Total Ad Spend 7 Hari:</div>
                    <div className="font-bold font-mono text-rose-300">
                      {formatIDR(simResults.weeklySpend)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Cookie Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Cookies Tertanam / Hari
                  </div>
                  <div className="text-xl font-black text-amber-500 font-mono mt-0.5">
                    {formatNum(simResults.dailyCookies)} <span className="text-xs font-normal text-slate-400">cookies</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {formatNum(simResults.weeklyCookies)} cookies / minggu
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Estimasi Pesanan 7 Hari
                  </div>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {formatNum(simResults.weeklyOrders)} <span className="text-xs font-normal text-slate-400">orders</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    🛒 {formatNum(simResults.weeklyIndirectOrders)} dari produk lain
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Batas Aman CPRC (Breakeven)
                  </div>
                  <div className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                    {formatIDR(simResults.breakevenCprc)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Batas maks per cookie agar tidak boncos
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Safety Buffer per Cookie
                  </div>
                  <div
                    className={`text-xl font-black font-mono mt-0.5 ${
                      simResults.cookieSafetyBuffer >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {simResults.cookieSafetyBuffer >= 0 ? '+' : ''}
                    {formatIDR(simResults.cookieSafetyBuffer)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {simResults.cookieSafetyBuffer >= 0 ? 'Surplus laba per cookie' : 'Boncos per cookie'}
                  </div>
                </div>
              </div>

              {/* Monthly Potential Projection Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <div>
                  <div className="font-bold">Proyeksi Laba Bersih Bulanan (30 Hari):</div>
                  <div className="text-lg font-black font-mono mt-0.5 text-indigo-700 dark:text-indigo-300">
                    {simResults.monthlyNetProfit >= 0 ? '+' : ''}
                    {formatIDR(simResults.monthlyNetProfit)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                  Dari total {formatNum(simResults.monthlyCookies)} cookies tertanam
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BLUEPRINT & PANDUAN TAKTIS 7 HARI (PLAYBOOK) */}
      {activeTab === 'playbook' && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={18} className="text-amber-500" />
              <span>Blueprint Taktis: Cara Memaksimalkan Komisi Tanam Cookies 7 Hari</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Panduan lengkap cara mengoptimalkan iklan Meta Ads agar pembeli mengklik tautan affiliate Anda dan menghasilkan komisi keranjang belanja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rule 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Pilih Produk "Umpan" (Hook Product) yang Menarik Klik Massal
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tujuan utama bukan pembeli harus order produk yang Anda iklankan, melainkan <b>membuat orang tergiur untuk mengklik</b>. Pilih produk umpan dengan harga murah (&lt; Rp 50.000), diskon heboh, atau review viral, sehingga CPR (Cost Per Link Click) di Meta Ads menjadi super murah (&lt; Rp 200).
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Wajib Exclude "Audience Network" di Ads Manager
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Audience Network di Meta Ads seringkali menyumbang kebocoran &gt; 70% akibat klik tidak disengaja di game atau aplikasi luar. Buka Meta Ads Manager &rarr; Ad Set &rarr; Pilih <b>Manual Placements</b> &rarr; Hapus centang pada <b>Audience Network</b>. Fokuskan ke Instagram Reels, Stories, dan Feeds.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Aturan 3 Hari: Jangan Matikan Iklan di Hari Pertama!
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pada hari D+0 s.d D+2, calon pembeli yang mengklik biasanya sedang memasukkan barang ke keranjang (cart hoarding) dan menunggu gratis ongkir atau gajian. Selama CPRC murah (&lt; Rp 500) dan kebocoran wajar, berikan waktu minimal 3 s.d 7 hari sebelum memutuskan untuk mematikan iklan.
              </p>
            </div>
          </div>

          {/* Golden Metrics Table */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-500/30">
            <h5 className="font-bold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>Standar Metrik Emas (Golden Benchmark) Strategi Tanam Cookies:</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Target CPRC Riil</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">&lt; Rp 500 / cookie</div>
                <div className="text-[9px] text-slate-400 mt-1">Biaya asli per cookie di Shopee</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Target Kebocoran</div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">&lt; 45% Bocor</div>
                <div className="text-[9px] text-slate-400 mt-1">Landing rate &gt; 55% ke Shopee</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Target Net Cookie Margin</div>
                <div className="text-base font-black text-indigo-400 font-mono mt-0.5">+Rp 150 s/d +Rp 500</div>
                <div className="text-[9px] text-slate-400 mt-1">EPC harus lebih besar dari CPRC</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Rasio Keranjang Silang</div>
                <div className="text-base font-black text-purple-400 font-mono mt-0.5">&gt; 55% Indirect</div>
                <div className="text-[9px] text-slate-400 mt-1">Tanda efek halo panen keranjang sukses</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
