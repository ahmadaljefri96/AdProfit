/**
 * Utilitas Analisis Meta Ads Multi-Breakdown & Kebocoran Klik (Click Leakage)
 * Ditambah Engine Khusus Strategi Menanam Cookies 7 Hari (Cookie Planting Hub)
 * AdProfit Dashboard
 */

export interface DailyMetaSummary {
  date: string;
  amountSpent: number;
  linkClicks: number;
  impressions: number;
  results: number;
  rawRowsCount: number;
}

export interface PlacementMetaSummary {
  placement: string;
  amountSpent: number;
  linkClicks: number;
  impressions: number;
  results: number;
  rawRowsCount: number;
}

export interface ClickLeakageResult {
  metaClicks: number;
  shopeeClicks: number;
  kebocoran: number;
  persentaseBocor: number;
  status: 'optimal' | 'warning' | 'danger';
}

export interface DailyBreakdownRow {
  date: string;
  metaClicks: number;
  shopeeClicks: number;
  kebocoran: number;
  leakagePct: number;
  orders: number;
  commission: number;
  spend: number;
  profit: number;
  roi: number;
  roas: number;
  cprc: number;
  epc: number;
  clickDates?: { date: string; count: number }[];
}

export interface TagPlacementDrilldownItem {
  placement: string;
  amountSpent: number;
  amountSpentWithPpn: number;
  spendSharePct: number;
  metaClicks: number;
  clickSharePct: number;
  estimatedShopeeClicks: number;
  estimatedKebocoran: number;
  estimatedLeakagePct: number;
  isHighLeakage: boolean; // > 40% sesuai instruksi
  cpc: number;
  cpsc: number; // Cost Per Shopee Click (estimasi)
  cprc: number; // Cost Per Real Cookie pada placement ini
}

export interface TagPlacementDrilldownResult {
  totalSpent: number;
  totalSpentWithPpn: number;
  totalMetaClicks: number;
  totalShopeeClicks: number;
  totalKebocoran: number;
  overallLeakagePct: number;
  cprc: number; // Overall Cost Per Real Cookie
  epc: number;  // Overall Earnings Per Cookie
  cookieMargin: number; // epc - cprc
  placements: TagPlacementDrilldownItem[];
}

export interface CookiePlantingCohortDay {
  dayOffset: number;
  dayLabel: string;
  sharePct: number;
  cumulativePct: number;
  projectedAmount: number;
  status: 'settled' | 'maturing' | 'projected';
}

export interface IndirectProductHarvest {
  productName: string;
  category: string;
  commission: number;
  orderCount: number;
  isDirect: boolean;
  buyerType?: string;
  orderDate?: string;
}

export interface CategoryCookieHarvest {
  category: string;
  commission: number;
  orders: number;
  directCommission: number;
  indirectCommission: number;
  indirectPct: number;
}

export interface CookiePlantingSummary {
  totalSpendWithPpn: number;
  totalMetaClicks: number;
  totalShopeeClicks: number; // Cookies tertanam aktif di Shopee
  totalCommission: number;
  totalOrders: number;
  overallLeakagePct: number;
  landingRatePct: number;
  cprc: number; // Cost Per Real Cookie = totalSpendWithPpn / (totalShopeeClicks || 1)
  epc: number; // Earnings Per Cookie = totalCommission / (totalShopeeClicks || 1)
  cookieMargin: number; // epc - cprc (keuntungan bersih per 1 cookie)
  cookieRoas: number;
  directCommission: number;
  indirectCommission: number;
  directOrders: number;
  indirectOrders: number;
  directRatioPct: number;
  indirectRatioPct: number;
  projected7DayCommission: number;
  projected7DayRoas: number;
  maturationStage: 'seeding' | 'maturing' | 'harvesting';
  cohortSchedule: CookiePlantingCohortDay[];
  hasExplicitOrderType: boolean;
  topIndirectProducts: IndirectProductHarvest[];
  topDirectProducts: IndirectProductHarvest[];
  categoryHarvest: CategoryCookieHarvest[];
  newBuyerOrders: number;
  newBuyerCommission: number;
  existingBuyerOrders: number;
  existingBuyerCommission: number;
}

/**
 * Parsing angka dari string yang mungkin berisi 'Rp', koma, titik, atau format mata uang
 */
export function parseMetaNumber(val: any): number {
  if (val === null || val === undefined || val === '' || val === '--' || val === '-') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  let str = String(val).replace(/Rp|IDR|\s|"/gi, '').trim();
  if (str.includes(',') && str.includes('.')) {
    str.lastIndexOf(',') > str.lastIndexOf('.')
      ? (str = str.replace(/\./g, '').replace(',', '.'))
      : (str = str.replace(/,/g, ''));
  } else if (str.includes(',')) {
    const parts = str.split(',');
    parts.length > 2 || parts[parts.length - 1].length === 3
      ? (str = str.replace(/,/g, ''))
      : (str = str.replace(/,/g, '.'));
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Parsing Link Clicks / Outbound Clicks dari baris Meta Ads
 */
export function extractMetaClicks(row: any): number {
  if (!row) return 0;
  const outbound = parseMetaNumber(row['Outbound clicks'] ?? row['Outbound Clicks'] ?? row['Klik keluar']);
  if (outbound > 0) return outbound;

  const linkClicks = parseMetaNumber(row['Link clicks'] ?? row['Link Clicks'] ?? row['Klik tautan']);
  if (linkClicks > 0) return linkClicks;

  const resultIndicator = String(row['Result indicator'] || '').toLowerCase();
  if (resultIndicator.includes('link_click') || resultIndicator.includes('klik_tautan')) {
    const results = parseMetaNumber(row['Results'] ?? row['Hasil']);
    if (results > 0) return results;
  }

  return parseMetaNumber(row['Clicks (all)'] ?? row['Semua klik'] ?? 0);
}

/**
 * 1. Logika Agregasi Data Harian Meta Ads
 */
export function aggregateDailyMeta(metaRows: any[]): Record<string, DailyMetaSummary> {
  if (!Array.isArray(metaRows)) return {};

  return metaRows.reduce((acc: Record<string, DailyMetaSummary>, row: any) => {
    const date = row['Reporting starts'];
    if (!date || date === '--' || isNaN(new Date(date).getTime())) {
      return acc;
    }

    if (!acc[date]) {
      acc[date] = {
        date,
        amountSpent: 0,
        linkClicks: 0,
        impressions: 0,
        results: 0,
        rawRowsCount: 0,
      };
    }

    const spent = parseMetaNumber(row['Amount spent (IDR)']);
    const clicks = extractMetaClicks(row);
    const impressions = parseMetaNumber(row['Impressions']);
    const results = parseMetaNumber(row['Results']);

    acc[date].amountSpent += spent;
    acc[date].linkClicks += clicks;
    acc[date].impressions += impressions;
    acc[date].results += results;
    acc[date].rawRowsCount += 1;

    return acc;
  }, {});
}

/**
 * 2. Logika Agregasi Data Placement Meta Ads
 */
export function aggregatePlacementMeta(metaRows: any[]): PlacementMetaSummary[] {
  if (!Array.isArray(metaRows)) return [];

  const grouped = metaRows.reduce((acc: Record<string, PlacementMetaSummary>, row: any) => {
    let placement =
      row['Placement'] ||
      row['Penempatan'] ||
      row['Impression Device & Placement'] ||
      row['Platform & Placement'] ||
      row['Publisher Platform, Platform Position'] ||
      row['Platform and position'] ||
      row['Position'] ||
      '';

    placement = String(placement).trim();
    if (!placement || placement.toLowerCase() === 'total' || placement.includes('keseluruhan')) {
      placement = 'All Placements / Unknown';
    }

    if (!acc[placement]) {
      acc[placement] = {
        placement,
        amountSpent: 0,
        linkClicks: 0,
        impressions: 0,
        results: 0,
        rawRowsCount: 0,
      };
    }

    acc[placement].amountSpent += parseMetaNumber(row['Amount spent (IDR)']);
    acc[placement].linkClicks += extractMetaClicks(row);
    acc[placement].impressions += parseMetaNumber(row['Impressions']);
    acc[placement].results += parseMetaNumber(row['Results']);
    acc[placement].rawRowsCount += 1;

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => b.amountSpent - a.amountSpent);
}

/**
 * 3. Fitur Perhitungan Kebocoran Klik (Click Leakage)
 */
export function calculateClickLeakage(metaClicks: number, shopeeClicks: number): ClickLeakageResult {
  const mClicks = Math.max(0, Number(metaClicks) || 0);
  const sClicks = Math.max(0, Number(shopeeClicks) || 0);

  const kebocoran = mClicks > sClicks ? mClicks - sClicks : 0;
  const persentaseBocor = mClicks > 0 ? (kebocoran / mClicks) * 100 : 0;

  let status: 'optimal' | 'warning' | 'danger' = 'optimal';
  if (persentaseBocor > 70) {
    status = 'danger';
  } else if (persentaseBocor >= 50) {
    status = 'warning';
  } else {
    status = 'optimal';
  }

  return {
    metaClicks: mClicks,
    shopeeClicks: sClicks,
    kebocoran,
    persentaseBocor,
    status,
  };
}

/**
 * 3b. Agregasi Rincian Performa Harian untuk Baris Terfilter (Individual Campaign/Adset/Ad/Tag)
 */
export function calculateDailyBreakdownForRows(
  metaRows: any[],
  shopeeClicks: any[],
  shopeeOrders: any[],
  ppnRate: number = 11,
  dateFilterFn?: (dateStr: string) => boolean
): DailyBreakdownRow[] {
  const map: Record<
    string,
    {
      date: string;
      metaClicks: number;
      shopeeClicks: number;
      spend: number;
      commission: number;
      orderIdsSet: Set<string>;
      addedOrdersComm: Record<string, boolean>;
      clickDatesMap: Record<string, Set<string>>;
    }
  > = {};

  const ensureDate = (dateStr: string) => {
    if (!map[dateStr]) {
      map[dateStr] = {
        date: dateStr,
        metaClicks: 0,
        shopeeClicks: 0,
        spend: 0,
        commission: 0,
        orderIdsSet: new Set(),
        addedOrdersComm: {},
        clickDatesMap: {},
      };
    }
    return map[dateStr];
  };

  const ppnMultiplier = 1 + (Number(ppnRate) || 11) / 100;

  // 1. Process Meta Rows
  if (Array.isArray(metaRows)) {
    metaRows.forEach((row) => {
      const d = row['Reporting starts'];
      if (!d || d === '--' || isNaN(new Date(d).getTime())) return;
      if (dateFilterFn && !dateFilterFn(d)) return;
      const entry = ensureDate(d);
      entry.spend += parseMetaNumber(row['Amount spent (IDR)']) * ppnMultiplier;
      entry.metaClicks += extractMetaClicks(row);
    });
  }

  // 2. Process Shopee Clicks
  if (Array.isArray(shopeeClicks)) {
    shopeeClicks.forEach((row) => {
      const w = row['Waktu Klik'];
      const d = w ? String(w).split(' ')[0] : '';
      if (!d || d === '--' || isNaN(new Date(d).getTime())) return;
      if (dateFilterFn && !dateFilterFn(d)) return;
      const entry = ensureDate(d);
      entry.shopeeClicks += 1;
    });
  }

  // 3. Process Shopee Orders
  if (Array.isArray(shopeeOrders)) {
    shopeeOrders.forEach((row) => {
      const w = row['Waktu Pemesanan'] || row['Waktu Klik'];
      const d = w ? String(w).split(' ')[0] : '';
      if (!d || d === '--' || isNaN(new Date(d).getTime())) return;
      if (dateFilterFn && !dateFilterFn(d)) return;
      const entry = ensureDate(d);

      const orderId = row['ID Pemesanan'];
      if (orderId) {
        entry.orderIdsSet.add(orderId);
        const clickDate = row['Waktu Klik'] ? String(row['Waktu Klik']).split(' ')[0] : '';
        if (clickDate && clickDate !== '--' && !isNaN(new Date(clickDate).getTime())) {
          if (!entry.clickDatesMap[clickDate]) entry.clickDatesMap[clickDate] = new Set();
          entry.clickDatesMap[clickDate].add(orderId);
        }
      }

      const prodComm = parseMetaNumber(row['Total Komisi per Produk(Rp)']);
      if (row['Total Komisi per Produk(Rp)'] !== undefined) {
        entry.commission += prodComm;
      } else if (orderId && !entry.addedOrdersComm[orderId]) {
        entry.addedOrdersComm[orderId] = true;
        entry.commission += parseMetaNumber(row['Total Komisi per Pesanan(Rp)']);
      }
    });
  }

  return Object.values(map)
    .map((entry) => {
      const kebocoran = Math.max(0, entry.metaClicks - entry.shopeeClicks);
      const leakagePct = entry.metaClicks > 0 ? (kebocoran / entry.metaClicks) * 100 : 0;
      const profit = entry.commission - entry.spend;
      const roi = entry.spend > 0 ? (profit / entry.spend) * 100 : entry.commission > 0 ? 1 / 0 : 0;
      const roas = entry.spend > 0 ? entry.commission / entry.spend : 0;
      const cprc = entry.shopeeClicks > 0 ? entry.spend / entry.shopeeClicks : 0;
      const epc = entry.shopeeClicks > 0 ? entry.commission / entry.shopeeClicks : 0;
      const clickDates = Object.entries(entry.clickDatesMap)
        .map(([dt, s]) => ({
          date: dt,
          count: s.size,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        date: entry.date,
        metaClicks: entry.metaClicks,
        shopeeClicks: entry.shopeeClicks,
        kebocoran,
        leakagePct,
        orders: entry.orderIdsSet.size,
        commission: entry.commission,
        spend: entry.spend,
        profit,
        roi,
        roas,
        cprc,
        epc,
        clickDates,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * 4. Analisis Penempatan & Kebocoran Klik per Tag
 */
export function calculateTagPlacementLeakage(
  tagMetaRows: any[],
  shopeeClicks: number,
  ppnRate: number = 11,
  totalCommission: number = 0
): TagPlacementDrilldownResult {
  const rawPlacements = aggregatePlacementMeta(tagMetaRows);
  const totalSpent = rawPlacements.reduce((sum, p) => sum + p.amountSpent, 0);
  const totalSpentWithPpn = totalSpent * (1 + ppnRate / 100);
  const totalMetaClicks = rawPlacements.reduce((sum, p) => sum + p.linkClicks, 0);
  const totalShopeeClicks = Math.max(0, Number(shopeeClicks) || 0);

  const totalKebocoran = Math.max(0, totalMetaClicks - totalShopeeClicks);
  const overallLeakagePct = totalMetaClicks > 0 ? (totalKebocoran / totalMetaClicks) * 100 : 0;

  const cprc = totalShopeeClicks > 0 ? totalSpentWithPpn / totalShopeeClicks : 0;
  const epc = totalShopeeClicks > 0 ? totalCommission / totalShopeeClicks : 0;
  const cookieMargin = epc - cprc;

  const placements: TagPlacementDrilldownItem[] = rawPlacements.map(p => {
    const pSpentWithPpn = p.amountSpent * (1 + ppnRate / 100);
    const spendSharePct = totalSpent > 0 ? (p.amountSpent / totalSpent) * 100 : 0;
    const clickSharePct = totalMetaClicks > 0 ? (p.linkClicks / totalMetaClicks) * 100 : 0;
    const proportion = totalMetaClicks > 0 ? p.linkClicks / totalMetaClicks : 0;

    const estimatedShopeeClicks = Math.round(totalShopeeClicks * proportion);
    const estimatedKebocoran = Math.max(0, p.linkClicks - estimatedShopeeClicks);
    const estimatedLeakagePct = p.linkClicks > 0 ? (estimatedKebocoran / p.linkClicks) * 100 : 0;

    const isHighLeakage = estimatedLeakagePct > 40;
    const cpc = p.linkClicks > 0 ? pSpentWithPpn / p.linkClicks : 0;
    const cpsc = estimatedShopeeClicks > 0 ? pSpentWithPpn / estimatedShopeeClicks : 0;
    const placementCprc = estimatedShopeeClicks > 0 ? pSpentWithPpn / estimatedShopeeClicks : 0;

    return {
      placement: p.placement,
      amountSpent: p.amountSpent,
      amountSpentWithPpn: pSpentWithPpn,
      spendSharePct,
      metaClicks: p.linkClicks,
      clickSharePct,
      estimatedShopeeClicks,
      estimatedKebocoran,
      estimatedLeakagePct,
      isHighLeakage,
      cpc,
      cpsc,
      cprc: placementCprc,
    };
  });

  return {
    totalSpent,
    totalSpentWithPpn,
    totalMetaClicks,
    totalShopeeClicks,
    totalKebocoran,
    overallLeakagePct,
    cprc,
    epc,
    cookieMargin,
    placements,
  };
}

/**
 * 5. Utilitas Khusus Strategi Tanam Cookies 7 Hari
 */
export function calculateCookiePlantingSummary(
  spendWithPpn: number,
  metaClicks: number,
  shopeeClicks: number,
  commission: number,
  ordersCount: number = 0,
  rawShopeeOrders: any[] = []
): CookiePlantingSummary {
  const numSpend = Math.max(0, Number(spendWithPpn) || 0);
  const numMetaClicks = Math.max(0, Number(metaClicks) || 0);
  const numShopeeClicks = Math.max(0, Number(shopeeClicks) || 0);
  const numCommission = Math.max(0, Number(commission) || 0);
  const numOrders = Math.max(0, Number(ordersCount) || 0);

  const kebocoran = numMetaClicks > numShopeeClicks ? numMetaClicks - numShopeeClicks : 0;
  const overallLeakagePct = numMetaClicks > 0 ? (kebocoran / numMetaClicks) * 100 : 0;
  const landingRatePct = numMetaClicks > 0 ? (numShopeeClicks / numMetaClicks) * 100 : 0;

  const cprc = numShopeeClicks > 0 ? numSpend / numShopeeClicks : (numMetaClicks > 0 ? numSpend / numMetaClicks : 0);
  const epc = numShopeeClicks > 0 ? numCommission / numShopeeClicks : 0;
  const cookieMargin = epc - cprc;
  const cookieRoas = numSpend > 0 ? numCommission / numSpend : 0;

  let directCommission = 0;
  let indirectCommission = 0;
  let directOrders = 0;
  let indirectOrders = 0;
  let hasExplicitOrderType = false;
  let newBuyerOrders = 0;
  let newBuyerCommission = 0;
  let existingBuyerOrders = 0;
  let existingBuyerCommission = 0;

  const indirectProdMap: Record<string, IndirectProductHarvest> = {};
  const directProdMap: Record<string, IndirectProductHarvest> = {};
  const categoryHarvestMap: Record<string, CategoryCookieHarvest> = {};

  if (Array.isArray(rawShopeeOrders) && rawShopeeOrders.length > 0) {
    rawShopeeOrders.forEach(row => {
      const typeField = row['Jenis Pesanan'] || row['Order Type'] || row['Tipe Pesanan'] || '';
      const typeStr = String(typeField).toLowerCase();
      if (typeField) hasExplicitOrderType = true;

      const comm = parseMetaNumber(
        row['Total Komisi per Produk(Rp)'] ?? row['Total Komisi per Pesanan(Rp)'] ?? row['Komisi'] ?? 0
      );
      const prodName = String(row['Nama Produk'] || row['Product Name'] || 'Produk Shopee').trim();
      const catName = String(row['Kategori L1'] || row['Kategori'] || row['Category'] || 'Lainnya').trim();
      const buyerStr = String(row['Tipe Pembeli'] || row['Buyer Type'] || '').toLowerCase();

      if (buyerStr.includes('baru') || buyerStr.includes('new')) {
        newBuyerOrders += 1;
        newBuyerCommission += comm;
      } else {
        existingBuyerOrders += 1;
        existingBuyerCommission += comm;
      }

      const isDirect = typeStr.includes('langsung') || typeStr.includes('direct');
      const isIndirect = typeStr.includes('tidak langsung') || typeStr.includes('indirect') || typeStr.includes('lain');

      if (isDirect) {
        directCommission += comm;
        directOrders += 1;
        if (!directProdMap[prodName]) {
          directProdMap[prodName] = { productName: prodName, category: catName, commission: 0, orderCount: 0, isDirect: true };
        }
        directProdMap[prodName].commission += comm;
        directProdMap[prodName].orderCount += 1;
      } else if (isIndirect) {
        indirectCommission += comm;
        indirectOrders += 1;
        if (!indirectProdMap[prodName]) {
          indirectProdMap[prodName] = { productName: prodName, category: catName, commission: 0, orderCount: 0, isDirect: false };
        }
        indirectProdMap[prodName].commission += comm;
        indirectProdMap[prodName].orderCount += 1;
      } else {
        directCommission += comm * 0.45;
        indirectCommission += comm * 0.55;
        directOrders += 0.45;
        indirectOrders += 0.55;
      }

      if (!categoryHarvestMap[catName]) {
        categoryHarvestMap[catName] = { category: catName, commission: 0, orders: 0, directCommission: 0, indirectCommission: 0, indirectPct: 0 };
      }
      categoryHarvestMap[catName].commission += comm;
      categoryHarvestMap[catName].orders += 1;
      if (isDirect) categoryHarvestMap[catName].directCommission += comm;
      else categoryHarvestMap[catName].indirectCommission += comm;
    });

    Object.values(categoryHarvestMap).forEach(cat => {
      cat.indirectPct = cat.commission > 0 ? (cat.indirectCommission / cat.commission) * 100 : 55;
    });
  } else {
    directCommission = numCommission * 0.45;
    indirectCommission = numCommission * 0.55;
    directOrders = Math.round(numOrders * 0.45);
    indirectOrders = Math.max(0, numOrders - directOrders);
  }

  const directRatioPct = numCommission > 0 ? (directCommission / numCommission) * 100 : 45;
  const indirectRatioPct = numCommission > 0 ? (indirectCommission / numCommission) * 100 : 55;

  const topDirectProducts = Object.values(directProdMap).sort((a, b) => b.commission - a.commission).slice(0, 10);
  const topIndirectProducts = Object.values(indirectProdMap).sort((a, b) => b.commission - a.commission).slice(0, 10);
  const categoryHarvest = Object.values(categoryHarvestMap).sort((a, b) => b.commission - a.commission).slice(0, 8);

  const cohortSchedule: CookiePlantingCohortDay[] = [
    { dayOffset: 0, dayLabel: 'D+0 (Hari H)', sharePct: 35, cumulativePct: 35, projectedAmount: numCommission * 0.35, status: 'settled' },
    { dayOffset: 1, dayLabel: 'D+1', sharePct: 20, cumulativePct: 55, projectedAmount: numCommission * 0.55, status: 'maturing' },
    { dayOffset: 2, dayLabel: 'D+2', sharePct: 15, cumulativePct: 70, projectedAmount: numCommission * 0.70, status: 'maturing' },
    { dayOffset: 3, dayLabel: 'D+3', sharePct: 10, cumulativePct: 80, projectedAmount: numCommission * 0.80, status: 'projected' },
    { dayOffset: 4, dayLabel: 'D+4', sharePct: 8, cumulativePct: 88, projectedAmount: numCommission * 0.88, status: 'projected' },
    { dayOffset: 5, dayLabel: 'D+5', sharePct: 5, cumulativePct: 93, projectedAmount: numCommission * 0.93, status: 'projected' },
    { dayOffset: 6, dayLabel: 'D+6', sharePct: 4, cumulativePct: 97, projectedAmount: numCommission * 0.97, status: 'projected' },
    { dayOffset: 7, dayLabel: 'D+7 (Penuh)', sharePct: 3, cumulativePct: 100, projectedAmount: numCommission, status: 'projected' },
  ];

  const projected7DayCommission = numCommission > 0 ? (numCommission / 0.55) : (numShopeeClicks * 250);
  const projected7DayRoas = numSpend > 0 ? projected7DayCommission / numSpend : 0;

  let maturationStage: 'seeding' | 'maturing' | 'harvesting' = 'seeding';
  if (numShopeeClicks >= 50 && numCommission > 0) {
    maturationStage = 'harvesting';
  } else if (numShopeeClicks >= 10) {
    maturationStage = 'maturing';
  }

  return {
    totalSpendWithPpn: numSpend,
    totalMetaClicks: numMetaClicks,
    totalShopeeClicks: numShopeeClicks,
    totalCommission: numCommission,
    totalOrders: numOrders,
    overallLeakagePct,
    landingRatePct,
    cprc,
    epc,
    cookieMargin,
    cookieRoas,
    directCommission,
    indirectCommission,
    directOrders,
    indirectOrders,
    directRatioPct,
    indirectRatioPct,
    projected7DayCommission,
    projected7DayRoas,
    maturationStage,
    cohortSchedule,
    hasExplicitOrderType,
    topIndirectProducts,
    topDirectProducts,
    categoryHarvest,
    newBuyerOrders,
    newBuyerCommission,
    existingBuyerOrders,
    existingBuyerCommission,
  };
}

export function getLeakageBadgeStyle(persentaseBocor: number): {
  badgeCls: string;
  pillCls: string;
  label: string;
} {
  if (persentaseBocor > 70) {
    return {
      badgeCls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      pillCls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
      label: 'Tinggi (>70%)',
    };
  }
  if (persentaseBocor >= 50) {
    return {
      badgeCls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      pillCls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
      label: 'Sedang (50-70%)',
    };
  }
  return {
    badgeCls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    pillCls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    label: 'Optimal (<50%)',
  };
}

export interface AffiliateMetricsInput {
  roas?: number | null;
  cpr?: number | null;
  cprc?: number | null;
  epc?: number | null;
  leakage?: number | null;
  spend?: number | null;
  clicks?: number | null;
  shopeeClicks?: number | null;
  commission?: number | null;
  profit?: number | null;
  daysActive?: number | null;
}

export interface AffiliateInsightResult {
  label: string;
  tone: 'gray' | 'green' | 'blue' | 'red' | 'yellow' | 'orange' | 'crimson';
  badgeCls: string;
  description: string;
  action: string;
  cprcText?: string;
  epcText?: string;
  marginText?: string;
}

/**
 * 6. Logika Penentuan Rekomendasi (Actionable Logic) - KHUSUS STRATEGI TANAM COOKIES 7 HARI
 */
export function getAffiliateInsight(metrics: AffiliateMetricsInput): AffiliateInsightResult {
  const m = metrics || {};

  const rawSpend = Number(m.spend);
  const numSpend = isNaN(rawSpend) || !isFinite(rawSpend) ? 0 : Math.max(0, rawSpend);

  const rawClicks = Number(m.clicks);
  const numClicks = isNaN(rawClicks) || !isFinite(rawClicks) ? 0 : Math.max(0, rawClicks);

  const rawShopeeClicks = Number(m.shopeeClicks);
  const numShopeeClicks = isNaN(rawShopeeClicks) || !isFinite(rawShopeeClicks) ? 0 : Math.max(0, rawShopeeClicks);

  const rawComm = Number(m.commission);
  const numComm = isNaN(rawComm) || !isFinite(rawComm) ? 0 : Math.max(0, rawComm);

  let numRoas: number;
  const rawRoas = Number(m.roas);
  if (!isNaN(rawRoas) && isFinite(rawRoas)) {
    numRoas = rawRoas;
  } else if (numSpend > 0) {
    numRoas = numComm / numSpend;
  } else {
    numRoas = numComm > 0 ? 99 : 0;
  }

  const numCprc = numShopeeClicks > 0 ? numSpend / numShopeeClicks : (numClicks > 0 ? numSpend / numClicks : 0);
  const numEpc = numShopeeClicks > 0 ? numComm / numShopeeClicks : 0;
  const cookieMargin = numEpc - numCprc;

  let numLeakage: number;
  const rawLeakage = Number(m.leakage);
  if (!isNaN(rawLeakage) && isFinite(rawLeakage)) {
    numLeakage = Math.round(rawLeakage);
  } else if (numClicks > 0) {
    numLeakage = Math.round(Math.max(0, (numClicks - numShopeeClicks) / numClicks * 100));
  } else {
    numLeakage = 0;
  }

  const daysActive = m.daysActive !== undefined && m.daysActive !== null ? Number(m.daysActive) : undefined;
  const rawProfit = m.profit !== undefined && m.profit !== null ? Number(m.profit) : (numComm - numSpend);

  // KONDISI GUARDRAIL: Data Belum Valid
  if (numSpend < 10000 || numClicks === 0) {
    if (numSpend === 0 && numClicks === 0) {
      return {
        label: '⏳ BELUM ADA SPEND',
        tone: 'gray',
        badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold',
        description: 'Belum ada pengeluaran iklan Meta terdata pada periode atau kaitan ini.',
        action: 'Kaitkan campaign/ad set aktif atau mulai jalankan iklan untuk menanam cookie.',
      };
    }
    return {
      label: '⏳ DATA BELUM CUKUP',
      tone: 'gray',
      badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold',
      description: 'Belanja iklan baru Rp ' + Math.round(numSpend).toLocaleString('id-ID') + ' (< Rp 10.000) atau baru ' + numClicks + ' klik.',
      action: 'Biarkan iklan berjalan sampai minimal Rp 10.000 spend untuk pengumpulan data awal.',
    };
  }

  // PRIORITAS 1: EVALUASI KEBOCORAN KRITIS (> 70%)
  if (numLeakage > 70) {
    return {
      label: '⚠️ BOCOR PARAH (>70%)',
      tone: 'crimson',
      badgeCls: 'bg-red-200 dark:bg-red-950/80 text-red-900 dark:text-red-200 border-red-400 dark:border-red-800 font-black',
      description: 'Kebocoran ' + numLeakage + '%. Lebih dari 70% klik Meta hilang sebelum membuka Shopee (CPRC bengkak ke Rp ' + Math.round(numCprc) + '/cookie).',
      action: 'Matikan penempatan Audience Network, cek kestabilan direct link Shopee, atau gunakan universal deep-link.',
      cprcText: 'CPRC: Rp ' + Math.round(numCprc),
      epcText: 'EPC: Rp ' + Math.round(numEpc),
    };
  }

  // PRIORITAS 2: FASE TANAM COOKIE (Cookie Maturing D+0 s.d D+2)
  if (daysActive !== undefined && daysActive <= 2 && numShopeeClicks >= 5 && numLeakage <= 70) {
    return {
      label: '🌱 COOKIE MATURING (D+0 s.d D+2)',
      tone: 'blue',
      badgeCls: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700 font-bold',
      description: 'Sebanyak ' + numShopeeClicks + ' cookie berhasil ditanam (CPRC Rp ' + Math.round(numCprc) + '). Pembeli masih dalam proses menimbun keranjang belanja.',
      action: 'Jangan di-kill! Beri waktu 3-7 hari untuk memanen komisi checkout dari keranjang pembeli.',
      cprcText: 'CPRC: Rp ' + Math.round(numCprc),
      epcText: 'EPC: Rp ' + Math.round(numEpc),
    };
  }

  // PRIORITAS 3: SCALE UP (Unit Economics Sangat Menguntungkan)
  if (numRoas > 2.0 || (numShopeeClicks >= 15 && numEpc > 1.3 * numCprc)) {
    return {
      label: '🔥 SCALE UP (Unit Economics Super)',
      tone: 'green',
      badgeCls: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-black',
      description: 'ROAS tinggi (' + numRoas.toFixed(2) + 'x) dan setiap 1 cookie menghasilkan Rp ' + Math.round(numEpc) + ' vs modal Rp ' + Math.round(numCprc) + ' (Margin +Rp ' + Math.round(cookieMargin) + ').',
      action: 'Naikkan budget harian 15-20% atau duplikasi ke target audiens baru untuk menanam lebih banyak cookies.',
      cprcText: 'CPRC: Rp ' + Math.round(numCprc),
      epcText: 'EPC: Rp ' + Math.round(numEpc),
      marginText: '+Rp ' + Math.round(cookieMargin) + '/cookie',
    };
  }

  // PRIORITAS 4: PERTAHANKAN (Unit Economics Sehat & Stabil)
  if ((numRoas >= 1.0 && numRoas <= 2.0) || (numShopeeClicks >= 10 && numEpc >= numCprc)) {
    return {
      label: '⚖️ PERTAHANKAN (Cookie Stabil)',
      tone: 'blue',
      badgeCls: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-bold',
      description: 'ROAS stabil (' + numRoas.toFixed(2) + 'x) dengan margin cookie impas/untung (EPC Rp ' + Math.round(numEpc) + ' vs CPRC Rp ' + Math.round(numCprc) + ').',
      action: 'Pertahankan kampanye dan pantau panen keranjang belanja harian.',
      cprcText: 'CPRC: Rp ' + Math.round(numCprc),
      epcText: 'EPC: Rp ' + Math.round(numEpc),
    };
  }

  // PRIORITAS 5: PERBAIKI BOCOR (Kebocoran Sedang 50% - 70%)
  if (numLeakage >= 50 && numLeakage <= 70) {
    return {
      label: '🔧 PERBAIKI BOCOR (50-70%)',
      tone: 'orange',
      badgeCls: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700 font-black',
      description: 'Kebocoran ' + numLeakage + '% menyebabkan biaya tanam cookie naik menjadi Rp ' + Math.round(numCprc) + '/cookie.',
      action: 'Fokuskan penempatan pada Instagram Feed & Reels, hindari link landing page yang berat.',
      cprcText: 'CPRC: Rp ' + Math.round(numCprc),
    };
  }

  // PRIORITAS 6: FASE KILL (Hanya jika data sudah matang dan CPRC boncos parah)
  if (numRoas < 0.7 && (daysActive === undefined || daysActive >= 3) && (numCprc > 1500 || (numShopeeClicks >= 25 && numEpc < 0.35 * numCprc))) {
    return {
      label: '🛑 KILL (Biaya Tanam Boncos)',
      tone: 'red',
      badgeCls: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-black',
      description: 'Biaya per cookie (CPRC Rp ' + Math.round(numCprc) + ') terlalu mahal dan hasil konversi (EPC Rp ' + Math.round(numEpc) + ') tidak memadai setelah masa maturing.',
      action: 'Matikan campaign/ad set ini sekarang untuk menghentikan pemborosan budget. Ganti materi kreatif iklan.',
      cprcText: 'CPRC: Rp ' + Math.round(numCprc),
      epcText: 'EPC: Rp ' + Math.round(numEpc),
    };
  }

  // PRIORITAS 7: WAIT & SEE (Kebocoran Rendah, Menunggu Siklus 7 Hari)
  if (numRoas < 1.0 && numLeakage < 50) {
    return {
      label: '👀 WAIT & SEE (Pantau Siklus 7H)',
      tone: 'yellow',
      badgeCls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold',
      description: 'Kebocoran rendah (' + numLeakage + '%) dan biaya per cookie murah (CPRC Rp ' + Math.round(numCprc) + '). Pembeli masih dalam jendela 7 hari belanja.',
      action: 'Pantau 1-3 hari ke depan untuk melihat akumulasi komisi dari keranjang belanja.',
      cprcText: 'CPRC: Rp ' + Math.round(numCprc),
    };
  }

  // DEFAULT SMART INSIGHT (Pengganti N/A): Sesuai Sinyal Data
  if (rawProfit > 0) {
    return {
      label: '🔥 PROFITABLE (Net Positif)',
      tone: 'green',
      badgeCls: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold',
      description: 'Menghasilkan profit bersih positif (+Rp ' + Math.round(rawProfit).toLocaleString('id-ID') + ').',
      action: 'Pertahankan kampanye dan pantau akumulasi omset mingguan.',
    };
  }

  return {
    label: '📊 PANTAU TREN (Siklus 7 Hari)',
    tone: 'blue',
    badgeCls: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700 font-bold',
    description: 'Iklan aktif dengan ' + numShopeeClicks + ' cookies tertanam (CPRC Rp ' + Math.round(numCprc) + ').',
    action: 'Amati konversi delayed attribution selama 7 hari sebelum mengubah struktur iklan.',
  };
}
