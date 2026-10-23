import React, { useState, useMemo } from 'react';
import {
  calculateDailyBreakdownForRows,
  calculateTagPlacementLeakage,
  calculateClickLeakage,
  getAffiliateInsight,
  getLeakageBadgeStyle,
  extractMetaClicks,
  DailyBreakdownRow,
  TagPlacementDrilldownItem
} from './utils/metaBreakdown';
import {
  Layers,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  ChartNoAxesColumn,
  ChartLine,
  Calendar,
  Info,
  ExternalLink,
  Plus,
  Search,
  Check,
  AlertTriangle,
  ArrowRight,
  Filter,
  Sparkles,
  Cookie
} from 'lucide-react';

interface TagDashboardProps {
  metaRows: any[];
  shopeeClicks: any[];
  shopeeOrders: any[];
  tagMappings: Record<string, string[]>;
  onUpdateTagMapping: (tag: string, links: string[]) => void;
  ppnRate: number;
  dateFilterFn: (dateStr: string) => boolean;
  activeFilterLabel?: string;
  onNavigateToDashboard?: (scopeType: string, selectedKey: string) => void;
}

export function formatIDR(val: number): string {
  if (isNaN(val) || !isFinite(val)) return 'Rp 0';
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

export function formatNum(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  return Math.round(val).toLocaleString('id-ID');
}

function getMetaItemType(linkKey: string): 'campaign' | 'adset' | 'ad' {
  if (!linkKey) return 'campaign';
  if (linkKey.startsWith('adset:')) return 'adset';
  if (linkKey.startsWith('ad:')) return 'ad';
  return 'campaign';
}

function getMetaItemName(linkKey: string): string {
  if (!linkKey) return '';
  if (linkKey.startsWith('adset:')) return linkKey.slice(6);
  if (linkKey.startsWith('ad:')) return linkKey.slice(3);
  if (linkKey.startsWith('campaign:')) return linkKey.slice(9);
  return linkKey;
}

function matchesMetaRow(linkKey: string, row: any): boolean {
  if (!linkKey || !row) return false;
  if (linkKey.startsWith('adset:')) {
    const name = linkKey.slice(6);
    return row['Ad set name'] === name || row['Ad Set Name'] === name;
  }
  if (linkKey.startsWith('ad:')) {
    const name = linkKey.slice(3);
    return row['Ad name'] === name || row['Ad Name'] === name;
  }
  if (linkKey.startsWith('campaign:')) {
    const name = linkKey.slice(9);
    return row['Campaign name'] === name || row['Campaign Name'] === name;
  }
  return (
    row['Campaign name'] === linkKey ||
    row['Campaign Name'] === linkKey ||
    row['Ad set name'] === linkKey ||
    row['Ad Set Name'] === linkKey ||
    row['Ad name'] === linkKey ||
    row['Ad Name'] === linkKey
  );
}

function cleanTagLink(val: any): string {
  if (!val) return '';
  let str = String(val).trim();
  str = str.replace(/-+$/, '');
  return str;
}

export const TagDashboard: React.FC<TagDashboardProps> = ({
  metaRows,
  shopeeClicks,
  shopeeOrders,
  tagMappings,
  onUpdateTagMapping,
  ppnRate = 11,
  dateFilterFn,
  activeFilterLabel = 'Semua Waktu',
  onNavigateToDashboard
}) => {
  // Mode selection: 'by_tag' | 'by_meta' | 'custom_pair'
  const [analysisMode, setAnalysisMode] = useState<'by_tag' | 'by_meta' | 'custom_pair'>('by_tag');

  // Tag selection states
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');
  const [selectedSubMetaKey, setSelectedSubMetaKey] = useState<string>('all_linked');

  // Meta selection states
  const [metaSearchQuery, setMetaSearchQuery] = useState<string>('');
  const [selectedMetaScope, setSelectedMetaScope] = useState<'campaign' | 'adset' | 'ad'>('campaign');
  const [selectedMetaKey, setSelectedMetaKey] = useState<string>('');

  // Custom Pair simulation states
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [customMetaKey, setCustomMetaKey] = useState<string>('');

  // Quick link dropdown state
  const [showAddLinkDropdown, setShowAddLinkDropdown] = useState<boolean>(false);
  const [addLinkSearch, setAddLinkSearch] = useState<string>('');

  // 1. Build list of unique Shopee tags
  const allShopeeTags = useMemo(() => {
    const tagMap = new Map<string, { clicks: number; orders: number; comm: number }>();

    // From clicks
    shopeeClicks.forEach(r => {
      const tag = cleanTagLink(r.Tag_link);
      if (tag) {
        if (!tagMap.has(tag)) tagMap.set(tag, { clicks: 0, orders: 0, comm: 0 });
        tagMap.get(tag)!.clicks += 1;
      }
    });

    // From orders
    shopeeOrders.forEach(r => {
      const tag = cleanTagLink(r.Tag_link1 || r.Tag_link);
      if (tag) {
        if (!tagMap.has(tag)) tagMap.set(tag, { clicks: 0, orders: 0, comm: 0 });
        tagMap.get(tag)!.orders += 1;
        const comm = Number(r['Total Komisi per Produk(Rp)'] ?? r['Total Komisi per Pesanan(Rp)']) || 0;
        tagMap.get(tag)!.comm += comm;
      }
    });

    // Also include tags in tagMappings
    Object.keys(tagMappings).forEach(tag => {
      if (tag && !tagMap.has(tag)) {
        tagMap.set(tag, { clicks: 0, orders: 0, comm: 0 });
      }
    });

    return Array.from(tagMap.entries())
      .map(([tag, data]) => ({
        tag,
        clicks: data.clicks,
        orders: data.orders,
        comm: data.comm,
        linkedCount: (tagMappings[tag] || []).length
      }))
      .sort((a, b) => b.clicks - a.clicks || b.comm - a.comm);
  }, [shopeeClicks, shopeeOrders, tagMappings]);

  // Set default tag if not selected
  React.useEffect(() => {
    if (!selectedTag && allShopeeTags.length > 0) {
      setSelectedTag(allShopeeTags[0].tag);
    }
  }, [allShopeeTags, selectedTag]);

  // 2. Build list of unique Meta options (campaigns, adsets, ads)
  const metaOptionsList = useMemo(() => {
    const campaignsSet = new Set<string>();
    const adsetsSet = new Set<string>();
    const adsSet = new Set<string>();

    metaRows.forEach(r => {
      const camp = r['Campaign name'] || r['Campaign Name'];
      const adset = r['Ad set name'] || r['Ad Set Name'];
      const ad = r['Ad name'] || r['Ad Name'];

      if (camp && camp.toLowerCase() !== 'total' && !camp.toLowerCase().includes('hasil keseluruhan')) {
        campaignsSet.add(camp);
      }
      if (adset && adset.toLowerCase() !== 'total' && !adset.toLowerCase().includes('hasil keseluruhan')) {
        adsetsSet.add(adset);
      }
      if (ad && ad.toLowerCase() !== 'total' && !ad.toLowerCase().includes('hasil keseluruhan')) {
        adsSet.add(ad);
      }
    });

    const campaigns = Array.from(campaignsSet).sort();
    const adsets = Array.from(adsetsSet).sort();
    const ads = Array.from(adsSet).sort();

    return { campaigns, adsets, ads };
  }, [metaRows]);

  // Set default meta selection if not selected
  React.useEffect(() => {
    if (!selectedMetaKey) {
      if (selectedMetaScope === 'campaign' && metaOptionsList.campaigns.length > 0) {
        setSelectedMetaKey(metaOptionsList.campaigns[0]);
      } else if (selectedMetaScope === 'adset' && metaOptionsList.adsets.length > 0) {
        setSelectedMetaKey(metaOptionsList.adsets[0]);
      } else if (selectedMetaScope === 'ad' && metaOptionsList.ads.length > 0) {
        setSelectedMetaKey(metaOptionsList.ads[0]);
      }
    }
  }, [selectedMetaScope, metaOptionsList, selectedMetaKey]);

  // 3. Compute active evaluation target based on mode
  const activeEvaluation = useMemo(() => {
    let effectiveTag = '';
    let effectiveMetaRows: any[] = [];
    let effectiveShopeeClicksRows: any[] = [];
    let effectiveShopeeOrdersRows: any[] = [];
    let targetLabel = '';
    let targetSublabel = '';
    let linkedList: string[] = [];

    if (analysisMode === 'by_tag') {
      effectiveTag = selectedTag;
      linkedList = tagMappings[effectiveTag] || [];

      // Filter Shopee data for this tag
      effectiveShopeeClicksRows = shopeeClicks.filter(r => cleanTagLink(r.Tag_link) === effectiveTag);
      effectiveShopeeOrdersRows = shopeeOrders.filter(r => cleanTagLink(r.Tag_link1 || r.Tag_link) === effectiveTag);

      if (selectedSubMetaKey === 'all_linked' || !selectedSubMetaKey) {
        effectiveMetaRows = metaRows.filter(row => linkedList.some(link => matchesMetaRow(link, row)));
        targetLabel = `Tag Link: ${effectiveTag}`;
        targetSublabel = linkedList.length > 0
          ? `${linkedList.length} Iklan Meta Terkait: ${linkedList.map(getMetaItemName).join(', ')}`
          : '⚠️ Belum ada kampanye / ad set / ad Meta yang dipetakan ke tag ini.';
      } else {
        effectiveMetaRows = metaRows.filter(row => matchesMetaRow(selectedSubMetaKey, row));
        const subType = getMetaItemType(selectedSubMetaKey).toUpperCase();
        const subName = getMetaItemName(selectedSubMetaKey);
        targetLabel = `Tag ${effectiveTag} ➔ [${subType}] ${subName}`;
        targetSublabel = `Inspeksi khusus untuk iklan '${subName}' yang terhubung ke tag '${effectiveTag}'`;
      }
    } else if (analysisMode === 'by_meta') {
      const prefix = selectedMetaScope === 'campaign' ? 'campaign:' : selectedMetaScope === 'adset' ? 'adset:' : 'ad:';
      const fullKey = prefix + selectedMetaKey;

      effectiveMetaRows = metaRows.filter(row => matchesMetaRow(fullKey, row));
      const mappedTags = Object.keys(tagMappings).filter(t => (tagMappings[t] || []).some(l => matchesMetaRow(fullKey, l) || l === fullKey));

      effectiveShopeeClicksRows = shopeeClicks.filter(r => mappedTags.includes(cleanTagLink(r.Tag_link)));
      effectiveShopeeOrdersRows = shopeeOrders.filter(r => mappedTags.includes(cleanTagLink(r.Tag_link1 || r.Tag_link)));

      const typeLabel = selectedMetaScope === 'campaign' ? 'Kampanye' : selectedMetaScope === 'adset' ? 'Ad Set' : 'Iklan (Ad)';
      targetLabel = `${typeLabel}: ${selectedMetaKey}`;
      targetSublabel = mappedTags.length > 0
        ? `Terhubung ke ${mappedTags.length} Tag Shopee: ${mappedTags.join(', ')}`
        : '⚠️ Iklan ini belum dipetakan ke Tag Shopee manapun.';
      linkedList = mappedTags;
      effectiveTag = mappedTags[0] || '';
    } else {
      // custom_pair mode
      effectiveTag = customTagInput.trim() || selectedTag;
      const fullMetaKey = customMetaKey || (metaOptionsList.campaigns[0] ? 'campaign:' + metaOptionsList.campaigns[0] : '');

      effectiveMetaRows = metaRows.filter(row => matchesMetaRow(fullMetaKey, row));
      effectiveShopeeClicksRows = shopeeClicks.filter(r => cleanTagLink(r.Tag_link) === effectiveTag);
      effectiveShopeeOrdersRows = shopeeOrders.filter(r => cleanTagLink(r.Tag_link1 || r.Tag_link) === effectiveTag);

      const subType = getMetaItemType(fullMetaKey).toUpperCase();
      const subName = getMetaItemName(fullMetaKey);
      targetLabel = `Simulasi Pairing: Tag '${effectiveTag}' + [${subType}] ${subName}`;
      targetSublabel = 'Simulasi performa gabungan kustom antara Tag Shopee dan Iklan Meta pilihan.';
      linkedList = [fullMetaKey];
    }

    // Daily breakdown calculation
    const dailyRows = calculateDailyBreakdownForRows(
      effectiveMetaRows,
      effectiveShopeeClicksRows,
      effectiveShopeeOrdersRows,
      ppnRate,
      dateFilterFn
    );

    // Totals
    const totalSpend = dailyRows.reduce((sum, d) => sum + d.spend, 0);
    const totalMetaClicks = dailyRows.reduce((sum, d) => sum + d.metaClicks, 0);
    const totalShopeeClicks = dailyRows.reduce((sum, d) => sum + d.shopeeClicks, 0);
    const totalOrders = dailyRows.reduce((sum, d) => sum + d.orders, 0);
    const totalCommission = dailyRows.reduce((sum, d) => sum + d.commission, 0);
    const profit = totalCommission - totalSpend;
    const roas = totalSpend > 0 ? totalCommission / totalSpend : 0;
    const roi = totalSpend > 0 ? (profit / totalSpend) * 100 : totalCommission > 0 ? 100 : 0;
    const cpr = totalMetaClicks > 0 ? totalSpend / totalMetaClicks : 0;
    const cprc = totalShopeeClicks > 0 ? totalSpend / totalShopeeClicks : 0;
    const epc = totalShopeeClicks > 0 ? totalCommission / totalShopeeClicks : 0;
    const cookieMargin = epc - cprc;

    // Leakage calculation
    const leakageInfo = calculateClickLeakage(totalMetaClicks, totalShopeeClicks);

    // Placement Multi-Breakdown
    const placementDrill = calculateTagPlacementLeakage(
      effectiveMetaRows,
      totalShopeeClicks,
      ppnRate,
      totalCommission
    );

    // Actionable affiliate insight
    const insight = getAffiliateInsight({
      roas,
      cpr,
      cprc,
      epc,
      leakage: Math.round(leakageInfo.persentaseBocor),
      spend: totalSpend,
      clicks: totalMetaClicks,
      shopeeClicks: totalShopeeClicks,
      commission: totalCommission,
      profit
    });

    return {
      targetLabel,
      targetSublabel,
      effectiveTag,
      linkedList,
      dailyRows,
      placementDrill,
      totalSpend,
      totalMetaClicks,
      totalShopeeClicks,
      totalOrders,
      totalCommission,
      profit,
      roas,
      roi,
      cpr,
      cprc,
      epc,
      cookieMargin,
      leakageInfo,
      insight,
      metaRowCount: effectiveMetaRows.length
    };
  }, [
    analysisMode,
    selectedTag,
    selectedSubMetaKey,
    selectedMetaScope,
    selectedMetaKey,
    customTagInput,
    customMetaKey,
    metaRows,
    shopeeClicks,
    shopeeOrders,
    tagMappings,
    ppnRate,
    dateFilterFn,
    metaOptionsList
  ]);

  // Handler to add a new link to the currently selected tag
  const handleAddLinkToTag = (linkKey: string) => {
    if (!selectedTag || !linkKey) return;
    const currentLinks = tagMappings[selectedTag] || [];
    if (!currentLinks.includes(linkKey)) {
      const updated = [...currentLinks, linkKey];
      onUpdateTagMapping(selectedTag, updated);
    }
    setShowAddLinkDropdown(false);
  };

  // Handler to remove a link from the currently selected tag
  const handleRemoveLinkFromTag = (linkKey: string) => {
    if (!selectedTag || !linkKey) return;
    const currentLinks = tagMappings[selectedTag] || [];
    const updated = currentLinks.filter(l => l !== linkKey);
    onUpdateTagMapping(selectedTag, updated);
  };

  // Filtered tags for search
  const filteredTagList = useMemo(() => {
    const q = tagSearchQuery.trim().toLowerCase();
    if (!q) return allShopeeTags;
    return allShopeeTags.filter(t => t.tag.toLowerCase().includes(q));
  }, [allShopeeTags, tagSearchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. TOP CONTROL & SELECTOR PANEL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0 mt-0.5">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Tag Dashboard
                </h1>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Analisis per Iklan & per Tag
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Inspeksi mendalam performa Meta Ads & Shopee Affiliate: kebocoran klik, penempatan iklan, dan optimasi cookie 7 hari.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              <Calendar size={14} className="text-indigo-500" />
              <span>Periode: <b>{activeFilterLabel}</b></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              <span>PPN: <b>{ppnRate}%</b></span>
            </div>
            {onNavigateToDashboard && (
              <button
                type="button"
                onClick={() => onNavigateToDashboard('tag', activeEvaluation.effectiveTag)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                title="Buka filter ini di Ringkasan Utama"
              >
                <ExternalLink size={13} />
                <span>Buka di Ringkasan</span>
              </button>
            )}
          </div>
        </div>

        {/* MODE SWITCHER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Metode Analisis:</span>
          <button
            type="button"
            onClick={() => setAnalysisMode('by_tag')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
              analysisMode === 'by_tag'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🏷️ Analisis per Tag Link</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {allShopeeTags.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAnalysisMode('by_meta')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
              analysisMode === 'by_meta'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🎯 Analisis per Iklan Meta</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {metaOptionsList.campaigns.length + metaOptionsList.adsets.length + metaOptionsList.ads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAnalysisMode('custom_pair')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
              analysisMode === 'custom_pair'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🔗 Pasangkan Kustom (Simulasi Tag + Iklan)</span>
          </button>
        </div>

        {/* INPUTS ROW BASED ON MODE */}
        {analysisMode === 'by_tag' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {/* 1. Pick Tag Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>1. Pilih Tag Link Shopee:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {filteredTagList.length} tag ditemukan
                </span>
              </label>
              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={e => {
                    setSelectedTag(e.target.value);
                    setSelectedSubMetaKey('all_linked');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500/40 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
                >
                  {filteredTagList.map(t => (
                    <option key={t.tag} value={t.tag}>
                      {t.tag} — ({formatNum(t.clicks)} klik, {formatNum(t.orders)} order, {t.linkedCount} iklan terhubung)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Pick Sub-Iklan Terkait */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>2. Pilih Iklan Terkait untuk Dicek:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {(tagMappings[selectedTag] || []).length} iklan terhubung
                </span>
              </label>
              <select
                value={selectedSubMetaKey}
                onChange={e => setSelectedSubMetaKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
              >
                <option value="all_linked">
                  ⭐ Semua Iklan Terkait (Total Tag) — {(tagMappings[selectedTag] || []).length} iklan
                </option>
                {(tagMappings[selectedTag] || []).map(link => {
                  const type = getMetaItemType(link).toUpperCase();
                  const name = getMetaItemName(link);
                  return (
                    <option key={link} value={link}>
                      [{type}] {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 3. Quick Link / Add Meta Ad */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Tambah / Hubungkan Iklan Meta:
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddLinkDropdown(!showAddLinkDropdown)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Plus size={14} />
                    <span>+ Kaitkan Campaign / Adset / Ads</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-80">Pilih</span>
                </button>

                {showAddLinkDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 space-y-2 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <Search size={14} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari kampanye, set, atau ads..."
                        value={addLinkSearch}
                        onChange={e => setAddLinkSearch(e.target.value)}
                        className="bg-transparent text-xs w-full outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                        Kampanye Meta ({metaOptionsList.campaigns.length})
                      </div>
                      {metaOptionsList.campaigns
                        .filter(c => !addLinkSearch || c.toLowerCase().includes(addLinkSearch.toLowerCase()))
                        .slice(0, 10)
                        .map(camp => {
                          const key = 'campaign:' + camp;
                          const isAlready = (tagMappings[selectedTag] || []).includes(key);
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => (isAlready ? handleRemoveLinkFromTag(key) : handleAddLinkToTag(key))}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                isAlready
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="truncate pr-2">📁 {camp}</span>
                              {isAlready ? <Check size={14} /> : <Plus size={14} className="text-slate-400" />}
                            </button>
                          );
                        })}

                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                        Ad Set Meta ({metaOptionsList.adsets.length})
                      </div>
                      {metaOptionsList.adsets
                        .filter(a => !addLinkSearch || a.toLowerCase().includes(addLinkSearch.toLowerCase()))
                        .slice(0, 10)
                        .map(adset => {
                          const key = 'adset:' + adset;
                          const isAlready = (tagMappings[selectedTag] || []).includes(key);
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => (isAlready ? handleRemoveLinkFromTag(key) : handleAddLinkToTag(key))}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                isAlready
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="truncate pr-2">🎯 {adset}</span>
                              {isAlready ? <Check size={14} /> : <Plus size={14} className="text-slate-400" />}
                            </button>
                          );
                        })}

                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                        Iklan / Ads ({metaOptionsList.ads.length})
                      </div>
                      {metaOptionsList.ads
                        .filter(a => !addLinkSearch || a.toLowerCase().includes(addLinkSearch.toLowerCase()))
                        .slice(0, 10)
                        .map(ad => {
                          const key = 'ad:' + ad;
                          const isAlready = (tagMappings[selectedTag] || []).includes(key);
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => (isAlready ? handleRemoveLinkFromTag(key) : handleAddLinkToTag(key))}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                isAlready
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="truncate pr-2">🎬 {ad}</span>
                              {isAlready ? <Check size={14} /> : <Plus size={14} className="text-slate-400" />}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {analysisMode === 'by_meta' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {/* Scope: campaign / adset / ad */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Tingkat Iklan Meta:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMetaScope('campaign');
                    if (metaOptionsList.campaigns.length > 0) setSelectedMetaKey(metaOptionsList.campaigns[0]);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedMetaScope === 'campaign'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📁 Kampanye
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMetaScope('adset');
                    if (metaOptionsList.adsets.length > 0) setSelectedMetaKey(metaOptionsList.adsets[0]);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedMetaScope === 'adset'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🎯 Ad Set
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMetaScope('ad');
                    if (metaOptionsList.ads.length > 0) setSelectedMetaKey(metaOptionsList.ads[0]);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedMetaScope === 'ad'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🎬 Iklan
                </button>
              </div>
            </div>

            {/* Select specific item */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>
                  2. Pilih {selectedMetaScope === 'campaign' ? 'Kampanye' : selectedMetaScope === 'adset' ? 'Ad Set' : 'Iklan'}:
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {selectedMetaScope === 'campaign'
                    ? metaOptionsList.campaigns.length
                    : selectedMetaScope === 'adset'
                    ? metaOptionsList.adsets.length
                    : metaOptionsList.ads.length}{' '}
                  item terdeteksi
                </span>
              </label>
              <select
                value={selectedMetaKey}
                onChange={e => setSelectedMetaKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500/40 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
              >
                {(selectedMetaScope === 'campaign'
                  ? metaOptionsList.campaigns
                  : selectedMetaScope === 'adset'
                  ? metaOptionsList.adsets
                  : metaOptionsList.ads
                ).map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {analysisMode === 'custom_pair' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Simulasi Pasangkan Tag Link dengan Iklan Meta Pilihan:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Ketik / Pilih Tag Link Shopee:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: skincare-promo-fb"
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {allShopeeTags.slice(0, 5).map(t => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => setCustomTagInput(t.tag)}
                      className="text-[9.5px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-600 dark:text-slate-300"
                    >
                      {t.tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Pilih Iklan Meta untuk Disandingkan:
                </label>
                <select
                  value={customMetaKey}
                  onChange={e => setCustomMetaKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <optgroup label="Kampanye">
                    {metaOptionsList.campaigns.map(c => (
                      <option key={'campaign:' + c} value={'campaign:' + c}>
                        📁 {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Ad Set">
                    {metaOptionsList.adsets.map(a => (
                      <option key={'adset:' + a} value={'adset:' + a}>
                        🎯 {a}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Iklan (Ads)">
                    {metaOptionsList.ads.map(ad => (
                      <option key={'ad:' + ad} value={'ad:' + ad}>
                        🎬 {ad}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {customTagInput && customMetaKey && (
                  <button
                    type="button"
                    onClick={() => {
                      handleAddLinkToTag(customMetaKey);
                    }}
                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Simpan kaitan ini permanen ke tag &apos;{customTagInput}&apos;</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. ACTIONABLE AFFILIATE INSIGHT BANNER */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${activeEvaluation.insight.badgeCls}`}
      >
        <div className="flex items-start gap-3.5">
          <div className="text-2xl mt-0.5">{activeEvaluation.insight.label.split(' ')[0]}</div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-sm tracking-wide uppercase">
                Rekomendasi Saran Strategis: {activeEvaluation.insight.label}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-mono font-bold">
                ROAS: {activeEvaluation.roas.toFixed(2)}x
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-mono font-bold">
                Bocor: {Math.round(activeEvaluation.leakageInfo.persentaseBocor)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium opacity-95 leading-relaxed max-w-3xl">
              {activeEvaluation.insight.description}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 self-stretch md:self-auto text-center">
          <div className="text-xs sm:text-sm font-black px-4 py-2 rounded-2xl bg-white/80 dark:bg-black/40 border border-current shadow-xs">
            {activeEvaluation.insight.action}
          </div>
        </div>
      </div>

      {/* 3. TOP KPI STAT CARDS (SAMA PERSIS DENGAN DASHBOARD UTAMA) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Ad Spend */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Ad Spend (+PPN {ppnRate}%)
            </span>
            <DollarSign size={16} className="text-violet-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-violet-600 dark:text-violet-400 font-mono">
            {formatIDR(activeEvaluation.totalSpend)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {activeEvaluation.metaRowCount} baris data Meta
          </div>
        </div>

        {/* Shopee Clicks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Shopee Clicks
            </span>
            <MousePointerClick size={16} className="text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatNum(activeEvaluation.totalShopeeClicks)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Meta: {formatNum(activeEvaluation.totalMetaClicks)} klik
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pesanan
            </span>
            <ShoppingCart size={16} className="text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {formatNum(activeEvaluation.totalOrders)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Pesanan teratribusi
          </div>
        </div>

        {/* Total Komisi */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Total Komisi
            </span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatIDR(activeEvaluation.totalCommission)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Komisi Shopee Affiliate
          </div>
        </div>

        {/* Profit Bersih */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Profit Bersih
            </span>
            {activeEvaluation.profit >= 0 ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-rose-500" />
            )}
          </div>
          <div
            className={`text-lg sm:text-xl font-black font-mono ${
              activeEvaluation.profit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {activeEvaluation.profit < 0 ? '- ' : ''}
            {formatIDR(Math.abs(activeEvaluation.profit))}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            ROI: {activeEvaluation.roi.toFixed(1)}%
          </div>
        </div>

        {/* ROAS & CPRC */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              ROAS & Cookie
            </span>
            <Target size={16} className="text-indigo-500" />
          </div>
          <div
            className={`text-lg sm:text-xl font-black font-mono ${
              activeEvaluation.roas >= 2
                ? 'text-emerald-600 dark:text-emerald-400'
                : activeEvaluation.roas >= 1
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {activeEvaluation.roas.toFixed(2)}x
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            CPRC: {formatIDR(activeEvaluation.cprc)}
          </div>
        </div>
      </div>

      {/* 4. FITUR KEBOCORAN KLIK & KESEHATAN COOKIE 7 HARI (FITUR KHUSUS TAG DASHBOARD) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Cookie size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Analisis Kebocoran Klik & Penanaman Cookie 7 Hari
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Membandingkan klik link Meta Ads dengan klik mendarat di Shopee untuk mengukur efisiensi biaya tanam cookie.
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-black border ${
              activeEvaluation.leakageInfo.persentaseBocor > 70
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                : activeEvaluation.leakageInfo.persentaseBocor >= 50
                ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            Status: {activeEvaluation.leakageInfo.persentaseBocor > 70 ? '⚠️ BAHAYA (>70%)' : activeEvaluation.leakageInfo.persentaseBocor >= 50 ? '🔧 PERINGATAN (50-70%)' : '✓ OPTIMAL (≤50%)'}
          </div>
        </div>

        {/* GAUGE PROGRESS BAR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Tingkat Kebocoran Klik:</span>
            <span className="font-mono text-sm">
              {activeEvaluation.leakageInfo.persentaseBocor.toFixed(1)}% ({formatNum(activeEvaluation.leakageInfo.kebocoran)} klik hilang)
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                activeEvaluation.leakageInfo.persentaseBocor > 70
                  ? 'bg-rose-500'
                  : activeEvaluation.leakageInfo.persentaseBocor >= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, activeEvaluation.leakageInfo.persentaseBocor))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0% (Sempurna)</span>
            <span>50% (Batas Toleransi Normal)</span>
            <span>70% (Batas Kritis / Bocor Parah)</span>
            <span>100%</span>
          </div>
        </div>

        {/* METRICS COMPARISON CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Meta Link Clicks</div>
            <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
              {formatNum(activeEvaluation.totalMetaClicks)}
            </div>
            <div className="text-[9.5px] text-slate-400">Klik keluar dari Meta Ads</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Shopee Landing Clicks</div>
            <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              {formatNum(activeEvaluation.totalShopeeClicks)}
            </div>
            <div className="text-[9.5px] text-slate-400">Cookies berhasil tertanam</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase">CPRC (Cost Per Cookie)</div>
            <div className="text-base font-black text-slate-800 dark:text-slate-200 font-mono mt-0.5">
              {formatIDR(activeEvaluation.cprc)}
            </div>
            <div className="text-[9.5px] text-slate-400">Modal menanam 1 cookie</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase">EPC (Earnings Per Cookie)</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {formatIDR(activeEvaluation.epc)}
            </div>
            <div
              className={`text-[9.5px] font-bold ${
                activeEvaluation.cookieMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              Margin: {activeEvaluation.cookieMargin >= 0 ? '+' : ''}
              {formatIDR(activeEvaluation.cookieMargin)}/cookie
            </div>
          </div>
        </div>
      </div>

      {/* 5. TABEL RINCIAN PENEMPATAN & ESTIMASI KEBOCORAN (MULTI-BREAKDOWN) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <ChartNoAxesColumn size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Tabel Rincian Penempatan & Estimasi Kebocoran (Placement Multi-Breakdown)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown pengeluaran, klik Meta, estimasi klik mendarat Shopee, dan kebocoran per penempatan iklan (Reels, Feed, Stories, dll.).
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {activeEvaluation.placementDrill.placements.length} Penempatan Terdeteksi
          </span>
        </div>

        {activeEvaluation.placementDrill.placements.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Nama Placement</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Spend Placement</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Meta Clicks</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right text-amber-600 dark:text-amber-400">
                    Est. Shopee Clicks
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap text-right text-indigo-600 dark:text-indigo-400">
                    CPRC (Biaya/Cookie)
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Estimasi Kebocoran</th>
                  <th className="px-4 py-3 whitespace-nowrap text-center">Status & Saran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                {activeEvaluation.placementDrill.placements.map((p, idx) => {
                  const isHighLeakage = p.estimatedLeakagePct > 70;
                  const isModerateLeakage = p.estimatedLeakagePct >= 50 && p.estimatedLeakagePct <= 70;

                  return (
                    <tr
                      key={p.placement || idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.placement.toLowerCase().includes('reels')
                                ? 'bg-pink-500'
                                : p.placement.toLowerCase().includes('stories')
                                ? 'bg-purple-500'
                                : p.placement.toLowerCase().includes('feed')
                                ? 'bg-blue-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          <span>{p.placement}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-violet-700 dark:text-violet-400">
                          {formatIDR(p.amountSpentWithPpn)}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.spendSharePct.toFixed(1)}% spend</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                          {formatNum(p.metaClicks)}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.clickSharePct.toFixed(1)}% klik</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-amber-700 dark:text-amber-400">
                          {formatNum(p.estimatedShopeeClicks)}
                        </div>
                        <div className="text-[10px] text-slate-400">mendarat Shopee</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div
                          className={`font-mono font-bold ${
                            p.cprc <= 400
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : p.cprc <= 800
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {p.cprc > 0 ? formatIDR(p.cprc) : '—'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.cprc <= 400 ? '✓ Murah' : p.cprc <= 800 ? 'Sedang' : '⚠️ Mahal'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex flex-col items-end">
                          <span
                            className={`font-mono font-bold ${
                              isHighLeakage
                                ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {formatNum(p.estimatedKebocoran)} klik
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                              isHighLeakage
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                : isModerateLeakage
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            }`}
                          >
                            {p.estimatedLeakagePct.toFixed(1)}% bocor
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {isHighLeakage ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                            🛑 Matikan Placement
                          </span>
                        ) : isModerateLeakage ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                            ⚠️ Pantau Ketat
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                            ✓ Pertahankan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100/90 dark:bg-slate-800/90 font-bold border-t border-slate-200 dark:border-slate-800">
                <tr>
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">TOTAL</td>
                  <td className="px-4 py-3 text-right font-mono text-violet-700 dark:text-violet-400">
                    {formatIDR(activeEvaluation.placementDrill.totalSpentWithPpn)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-indigo-700 dark:text-indigo-400">
                    {formatNum(activeEvaluation.placementDrill.totalMetaClicks)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700 dark:text-amber-400">
                    {formatNum(activeEvaluation.placementDrill.totalShopeeClicks)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-indigo-700 dark:text-indigo-400">
                    {formatIDR(activeEvaluation.placementDrill.cprc)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    {formatNum(activeEvaluation.placementDrill.totalKebocoran)} (
                    {activeEvaluation.placementDrill.overallLeakagePct.toFixed(1)}%)
                  </td>
                  <td className="px-4 py-3 text-center text-[10px] text-slate-500">
                    {activeEvaluation.placementDrill.placements.length} Penempatan
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <AlertTriangle size={32} className="mx-auto text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Belum Ada Data Penempatan Terkait
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Pastikan Anda mengunggah laporan Meta Ads dengan opsi Breakdown By Delivery (Placement), serta memilih iklan yang tepat.
            </p>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
          <Info size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              Metodologi Alokasi Proporsional Penempatan:
            </p>
            <p className="mt-0.5 leading-relaxed">
              Karena laporan Shopee Affiliate tidak mencatat penempatan iklan Meta, estimasi klik mendarat Shopee dihitung proporsional terhadap kontribusi link clicks Meta pada penempatan tersebut: (Meta Clicks Placement / Total Meta Clicks) × Total Shopee Clicks.
            </p>
          </div>
        </div>
      </div>

      {/* 6. TABEL RINCIAN PERFORMA HARIAN (SAMA PERSIS DENGAN RINCIAN PERFORMA HARIAN DASHBOARD) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Tabel Rincian Performa Harian
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rincian transaksi, belanja iklan, kebocoran klik, dan konversi Shopee per hari untuk: {activeEvaluation.targetLabel}.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {activeEvaluation.dailyRows.length} Hari Tercatat
          </span>
        </div>

        {activeEvaluation.dailyRows.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[500px]">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-3.5 py-3 whitespace-nowrap">Tanggal</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right">Meta Clicks</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right text-amber-600 dark:text-amber-400">
                    Shopee Clicks
                  </th>
                  <th className="px-3 py-3 whitespace-nowrap text-right">Kebocoran Klik</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right">Pesanan</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right text-emerald-600 dark:text-emerald-400">
                    Komisi Shopee
                  </th>
                  <th className="px-3 py-3 whitespace-nowrap text-right text-violet-600 dark:text-violet-400">
                    Spend (+PPN)
                  </th>
                  <th className="px-3 py-3 whitespace-nowrap text-right">Laba Bersih</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right">ROAS</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right text-indigo-600 dark:text-indigo-400">
                    CPRC
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">Detail Konversi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                {[...activeEvaluation.dailyRows].reverse().map((dRow, idx) => {
                  const bStyle = getLeakageBadgeStyle(dRow.leakagePct);
                  return (
                    <tr
                      key={dRow.date || idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-3.5 py-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap font-mono">
                        {dRow.date}
                      </td>
                      <td className="px-3 py-3 text-right font-black font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {formatNum(dRow.metaClicks)}
                      </td>
                      <td className="px-3 py-3 text-right font-black font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {formatNum(dRow.shopeeClicks)}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {formatNum(dRow.kebocoran)}
                          </span>
                          <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${bStyle.badgeCls}`}>
                            {dRow.leakagePct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap font-mono">
                        {dRow.orders > 0 ? formatNum(dRow.orders) : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {dRow.commission > 0 ? formatIDR(dRow.commission) : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap">
                        {dRow.spend > 0 ? formatIDR(dRow.spend) : '—'}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono font-bold whitespace-nowrap ${
                          dRow.profit >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatIDR(dRow.profit)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold whitespace-nowrap">
                        {dRow.spend > 0 ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              dRow.roas >= 2
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black'
                                : dRow.roas >= 1
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {dRow.roas.toFixed(2)}x
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {dRow.cprc > 0 ? formatIDR(Math.round(dRow.cprc)) : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                        {dRow.clickDates && dRow.clickDates.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {dRow.clickDates.map((cd, cIdx) => (
                              <span
                                key={cd.date || cIdx}
                                className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[9px]"
                              >
                                {cd.date} ({cd.count} order)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 italic">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100/90 dark:bg-slate-800/90 font-bold border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-10 text-[11px]">
                <tr>
                  <td className="px-3.5 py-3 text-slate-800 dark:text-slate-200 font-black">TOTAL</td>
                  <td className="px-3 py-3 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                    {formatNum(activeEvaluation.totalMetaClicks)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                    {formatNum(activeEvaluation.totalShopeeClicks)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                    {formatNum(activeEvaluation.leakageInfo.kebocoran)} (
                    {activeEvaluation.leakageInfo.persentaseBocor.toFixed(1)}%)
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black">
                    {formatNum(activeEvaluation.totalOrders)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {formatIDR(activeEvaluation.totalCommission)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-violet-600 dark:text-violet-400">
                    {formatIDR(activeEvaluation.totalSpend)}
                  </td>
                  <td
                    className={`px-3 py-3 text-right font-mono font-black ${
                      activeEvaluation.profit >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatIDR(activeEvaluation.profit)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black">
                    {activeEvaluation.roas.toFixed(2)}x
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                    {formatIDR(Math.round(activeEvaluation.cprc))}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Tidak Ada Data Harian pada Rentang Tanggal Ini
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Sesuaikan filter tanggal di bagian atas agar mencakup periode saat iklan Meta atau transaksi Shopee terjadi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
