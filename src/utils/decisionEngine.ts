/**
 * Engine Rekomendasi & Pengambilan Keputusan Iklan vs Komisi
 * Sesuai Standar Evaluasi Terstruktur:
 * - Mode Analisis: TESTING (3 Hari), PROFITABLE (Hijau), DATA INSUFFICIENT
 * - Evaluasi 3 Hari: IMPROVE, STAGNAN, DECLINING, FLUKTUATIF
 * - Aturan Profitabilitas Hijau (Anti-Kill Prematur)
 * - 7 Status Keputusan Baku + Tingkat Keyakinan (TINGGI, SEDANG, RENDAH)
 * - Laporan 13 Poin Baku & Perbandingan Antar-Campaign
 */

export type AnalysisMode = 'TESTING' | 'PROFITABLE' | 'DATA INSUFFICIENT';

export type DecisionStatus =
  | 'LANJUT TESTING'
  | 'OBSERVASI TERBATAS'
  | 'KANDIDAT KILL'
  | 'PERTAHANKAN'
  | 'PERTAHANKAN DENGAN PERINGATAN'
  | 'EVALUASI PROFITABILITAS'
  | 'DATA BELUM MEMADAI';

export type ConfidenceLevel = 'TINGGI' | 'SEDANG' | 'RENDAH';

export type DetectedScenario =
  | 'IMPROVE (Komisi & Efisiensi Tumbuh)'
  | 'STAGNAN (Tidak Ada Peningkatan Berarti)'
  | 'DECLINING (Tren Efisiensi/Komisi Turun)'
  | 'FLUKTUATIF / BELUM KONKLUSIF'
  | 'HIJAU & STABIL'
  | 'HIJAU & STAGNAN'
  | 'HIJAU & FLUKTUATIF'
  | 'HIJAU TETAPI DECLINING'
  | 'PROFITABILITAS TURUN DI BAWAH TARGET'
  | 'DATA BELUM MEMADAI';

export interface DailyPoint {
  date: string;
  spend: number;
  commission: number;
  orders?: number;
  clicks?: number;
  shopeeClicks?: number;
  roas?: number;
}

export interface CampaignDecisionInput {
  campaignName: string;
  spend: number;
  commission: number;
  clicks?: number;
  shopeeClicks?: number;
  orders?: number;
  daysActive?: number;
  dailyBreakdown?: DailyPoint[];
  targetRoas?: number; // Default 1.00 jika belum ditentukan
  maxRiskBudget?: number; // Batas risiko kerugian maksimal testing (default 150000)
  manualMode?: 'auto' | 'testing' | 'profitable';
  dateRangeLabel?: string;
  hasDirectAttribution?: boolean;
}

export interface DecisionReport13 {
  // 13 Poin Baku Sesuai Format Bagian G
  '1_campaignName': string;
  '2_analysisPeriod': string;
  '3_analysisMode': AnalysisMode;
  '4_totalAdSpend': number;
  '5_totalCommission': number;
  '6_dailyAndCumulativeRoas': {
    cumulativeRoas: number;
    daily: { date: string; roas: number; spend: number; commission: number }[];
  };
  '7_roiOnAdSpend': number; // Persentase %
  '8_performanceTrend': string;
  '9_detectedScenario': DetectedScenario;
  '10_decisionStatus': DecisionStatus;
  '11_dataBackedReason': string;
  '12_dataRisksOrLimitations': string;
  '13_recommendedNextAction': string;

  // Metadata Pendukung Tampilan UI
  confidenceLevel: ConfidenceLevel;
  confidenceReason: string;
  netProfit: number;
  badgeCls: string;
  statusIcon: string;
  tone: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray';
  modeSource: 'Otomatis (Durasi Hari)' | 'Manual Pengguna';
}

/**
 * Format mata uang Rupiah
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Analisis tren data harian (komisi, spend, roas)
 */
function analyzeDailySeries(series: DailyPoint[]): {
  commTrend: 'naik' | 'turun' | 'stagnan' | 'fluktuatif' | 'insufficient';
  roasTrend: 'naik' | 'turun' | 'stagnan' | 'fluktuatif' | 'insufficient';
  commGrewFasterThanSpend: boolean;
  hasSpikeOneDayOnly: boolean;
  hasConsistentDecline: boolean;
  latestRoas: number;
  earliestRoas: number;
  dailyRoasList: { date: string; roas: number; spend: number; commission: number }[];
} {
  if (!series || series.length < 2) {
    const single = series && series.length === 1 ? series[0] : null;
    const sRoas = single && single.spend > 0 ? single.commission / single.spend : 0;
    return {
      commTrend: 'insufficient',
      roasTrend: 'insufficient',
      commGrewFasterThanSpend: false,
      hasSpikeOneDayOnly: false,
      hasConsistentDecline: false,
      latestRoas: sRoas,
      earliestRoas: sRoas,
      dailyRoasList: single
        ? [{ date: single.date, roas: sRoas, spend: single.spend, commission: single.commission }]
        : [],
    };
  }

  // Urutkan berdasarkan tanggal ascending
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));

  const dailyRoasList = sorted.map((p) => {
    const r = p.spend > 0 ? p.commission / p.spend : p.commission > 0 ? 99 : 0;
    return {
      date: p.date,
      roas: r,
      spend: p.spend,
      commission: p.commission,
    };
  });

  const comms = sorted.map((p) => p.commission);
  const spends = sorted.map((p) => p.spend);
  const roases = dailyRoasList.map((p) => p.roas);

  const firstComm = comms[0];
  const lastComm = comms[comms.length - 1];
  const firstSpend = spends[0];
  const lastSpend = spends[spends.length - 1];

  const commGrowth = firstComm > 0 ? (lastComm - firstComm) / firstComm : lastComm > 0 ? 1 : 0;
  const spendGrowth = firstSpend > 0 ? (lastSpend - firstSpend) / firstSpend : lastSpend > 0 ? 1 : 0;
  const commGrewFasterThanSpend = commGrowth > spendGrowth && lastComm >= firstComm;

  // Cek konsistensi tren komisi
  let commUps = 0;
  let commDowns = 0;
  for (let i = 1; i < comms.length; i++) {
    if (comms[i] > comms[i - 1]) commUps++;
    else if (comms[i] < comms[i - 1]) commDowns++;
  }

  let commTrend: 'naik' | 'turun' | 'stagnan' | 'fluktuatif' = 'stagnan';
  if (commUps > 0 && commDowns === 0) commTrend = 'naik';
  else if (commDowns > 0 && commUps === 0) commTrend = 'turun';
  else if (commUps > 0 && commDowns > 0) commTrend = 'fluktuatif';
  else commTrend = 'stagnan';

  // Cek konsistensi tren ROAS
  let roasUps = 0;
  let roasDowns = 0;
  for (let i = 1; i < roases.length; i++) {
    if (roases[i] > roases[i - 1] * 1.05) roasUps++;
    else if (roases[i] < roases[i - 1] * 0.95) roasDowns++;
  }

  let roasTrend: 'naik' | 'turun' | 'stagnan' | 'fluktuatif' = 'stagnan';
  if (roasUps > 0 && roasDowns === 0) roasTrend = 'naik';
  else if (roasDowns > 0 && roasUps === 0) roasTrend = 'turun';
  else if (roasUps > 0 && roasDowns > 0) roasTrend = 'fluktuatif';
  else roasTrend = 'stagnan';

  // Spike one day check (misal satu hari sangat tinggi, sisanya nol/rendah)
  const maxComm = Math.max(...comms);
  const totalComm = comms.reduce((a, b) => a + b, 0);
  const hasSpikeOneDayOnly = comms.length >= 3 && totalComm > 0 && maxComm / totalComm >= 0.75;

  // Consistent decline check
  const hasConsistentDecline = commDowns >= 2 && lastComm < firstComm;

  return {
    commTrend,
    roasTrend,
    commGrewFasterThanSpend,
    hasSpikeOneDayOnly,
    hasConsistentDecline,
    latestRoas: roases[roases.length - 1],
    earliestRoas: roases[0],
    dailyRoasList,
  };
}

/**
 * Evaluasi Rekomendasi Utama berdasarkan Aturan A s/d G
 */
export function evaluateCampaignDecision(input: CampaignDecisionInput): DecisionReport13 {
  const campaignName = input.campaignName || 'Campaign';
  const totalSpend = Math.max(0, Number(input.spend) || 0);
  const totalCommission = Math.max(0, Number(input.commission) || 0);
  const totalClicks = Math.max(0, Number(input.clicks) || 0);
  const totalShopeeClicks = Math.max(0, Number(input.shopeeClicks) || 0);
  const totalOrders = Math.max(0, Number(input.orders) || 0);
  const daysActive = input.daysActive !== undefined && input.daysActive !== null
    ? Math.max(1, Number(input.daysActive))
    : (input.dailyBreakdown && input.dailyBreakdown.length > 0 ? input.dailyBreakdown.length : 1);

  // Target ROAS pengguna (Default 1.00 jika belum ditentukan pengguna)
  const targetRoas = typeof input.targetRoas === 'number' && input.targetRoas > 0 ? input.targetRoas : 1.00;
  // Batas kerugian maksimal testing pengguna (Default Rp 150.000)
  const maxRiskBudget = typeof input.maxRiskBudget === 'number' && input.maxRiskBudget > 0 ? input.maxRiskBudget : 150000;

  // Periode Analisis Label
  const analysisPeriod = input.dateRangeLabel || `${daysActive} hari aktif`;

  // Perhitungan Utama Sesuai Aturan D:
  // ROAS Kumulatif = Total komisi periode / Total biaya iklan periode (JANGAN dirata-ratakan harian!)
  const cumulativeRoas = totalSpend > 0 ? totalCommission / totalSpend : (totalCommission > 0 ? 99 : 0);
  const netProfit = totalCommission - totalSpend;
  const roiOnAdSpend = totalSpend > 0 ? ((totalCommission - totalSpend) / totalSpend) * 100 : (totalCommission > 0 ? 9999 : 0);
  const cumulativeLoss = netProfit < 0 ? Math.abs(netProfit) : 0;

  // Analisis Tren Harian
  const dailyAnalysis = analyzeDailySeries(input.dailyBreakdown || []);
  const dailyRoasList = dailyAnalysis.dailyRoasList;

  // Penentuan Mode Analisis (Aturan A & Clarification: Otomatis dari durasi tanggal + opsi ganti manual)
  let analysisMode: AnalysisMode;
  let modeSource: 'Otomatis (Durasi Hari)' | 'Manual Pengguna';

  if (input.manualMode === 'testing') {
    analysisMode = 'TESTING';
    modeSource = 'Manual Pengguna';
  } else if (input.manualMode === 'profitable') {
    analysisMode = 'PROFITABLE';
    modeSource = 'Manual Pengguna';
  } else {
    modeSource = 'Otomatis (Durasi Hari)';
    if (totalSpend === 0 && totalClicks === 0) {
      analysisMode = 'DATA INSUFFICIENT';
    } else if (totalSpend < 10000 || totalClicks < 5) {
      analysisMode = 'DATA INSUFFICIENT';
    } else if (daysActive <= 3) {
      // Sesuai aturan: campaign masih dalam tahap pengujian, umumnya dievaluasi setelah 3 hari
      analysisMode = 'TESTING';
    } else {
      // Lebih dari 3 hari: jika ROAS kumulatif >= targetRoas maka Profitable
      if (cumulativeRoas >= targetRoas) {
        analysisMode = 'PROFITABLE';
      } else {
        // Evaluasi testing lanjut atau jika sudah lewat testing tapi di bawah target
        analysisMode = 'TESTING';
      }
    }
  }

  // Tingkat Keyakinan Default
  let confidenceLevel: ConfidenceLevel = 'SEDANG';
  let confidenceReason = '';

  if (totalSpend < 20000 || totalClicks < 10 || totalOrders === 0) {
    confidenceLevel = 'RENDAH';
    confidenceReason = 'Jumlah transaksi atau data klik masih minim sehingga reliabilitas tren terbatas.';
  } else if (daysActive >= 3 && totalOrders >= 5 && totalClicks >= 50) {
    confidenceLevel = 'TINGGI';
    confidenceReason = 'Data 3+ hari lengkap dengan volume transaksi dan klik memadai untuk kesimpulan kokoh.';
  } else {
    confidenceLevel = 'SEDANG';
    confidenceReason = 'Data cukup untuk arah keputusan, namun disarankan verifikasi berkala pada siklus berikutnya.';
  }

  let decisionStatus: DecisionStatus = 'DATA BELUM MEMADAI';
  let detectedScenario: DetectedScenario = 'DATA BELUM MEMADAI';
  let dataBackedReason = '';
  let dataRisksOrLimitations = '';
  let recommendedNextAction = '';
  let badgeCls = 'bg-slate-100 text-slate-700 border-slate-300';
  let statusIcon = '⏳';
  let tone: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray' = 'gray';

  // Deskripsi Tren Performa Ringkas (Poin 8)
  const performanceTrend = dailyAnalysis.commTrend !== 'insufficient'
    ? `Komisi ${dailyAnalysis.commTrend}, ROAS harian ${dailyAnalysis.roasTrend}`
    : `Data tren harian terbatas (${daysActive} hari aktif)`;

  // ==========================================
  // 1. EVALUASI MODE DATA INSUFFICIENT
  // ==========================================
  if (analysisMode === 'DATA INSUFFICIENT') {
    decisionStatus = 'DATA BELUM MEMADAI';
    detectedScenario = 'DATA BELUM MEMADAI';
    confidenceLevel = 'RENDAH';
    confidenceReason = 'Data belum cukup atau belum stabil untuk menghasilkan kesimpulan yang dapat dipercaya.';
    dataBackedReason = `Total biaya iklan ${formatRupiah(totalSpend)} dan ${totalClicks} klik Meta belum memenuhi ambang batas analisis (minimal Rp 10.000 spend dan 5 klik).`;
    dataRisksOrLimitations = 'Belum ada bukti yang cukup untuk memastikan konversi Shopee atau efisiensi penempatan iklan.';
    recommendedNextAction = 'Biarkan iklan berjalan hingga mencapai ambang batas data minimal sebelum mengambil tindakan perubahan anggaran.';
    badgeCls = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold';
    statusIcon = '⏳';
    tone = 'gray';
  }

  // ==========================================
  // 2. EVALUASI MODE TESTING (EVALUASI 3 HARI)
  // ==========================================
  else if (analysisMode === 'TESTING') {
    const isLossWithinRisk = cumulativeLoss <= maxRiskBudget;
    const isLossExceededRisk = cumulativeLoss > maxRiskBudget;

    // SKENARIO 1: IMPROVE
    // Komisi dan/atau ROAS menunjukkan perbaikan yang didukung data.
    // Syarat: jika komisi naik, pastikan bukan semata-mata biaya yang naik tanpa efisiensi (komisi tumbuh lebih cepat dari biaya).
    const isImprove =
      (dailyAnalysis.commTrend === 'naik' && dailyAnalysis.commGrewFasterThanSpend) ||
      (dailyAnalysis.roasTrend === 'naik' && dailyAnalysis.latestRoas > dailyAnalysis.earliestRoas) ||
      (cumulativeRoas >= targetRoas * 0.9 && totalCommission > 0);

    // SKENARIO 3: DECLINING
    // Komisi atau ROAS menunjukkan penurunan yang konsisten, sementara biaya terus bertambah atau efisiensi memburuk.
    // Catatan: Jangan menunggu 3 hari jika batas kerugian maksimum telah tercapai lebih awal!
    const isDeclining =
      dailyAnalysis.hasConsistentDecline ||
      (dailyAnalysis.commTrend === 'turun' && totalSpend > 30000) ||
      (isLossExceededRisk && cumulativeRoas < 0.5);

    // SKENARIO 2: STAGNAN
    // Komisi dan ROAS tidak menunjukkan perbaikan berarti selama periode pengamatan.
    const isStagnant =
      (dailyAnalysis.commTrend === 'stagnan' || totalCommission === 0) &&
      daysActive >= 2 &&
      !isImprove;

    // SKENARIO 4: FLUKTUATIF / BELUM KONKLUSIF
    // Performa naik-turun, jumlah transaksi rendah, atau kemungkinan delay komisi.
    const isFluctuating =
      dailyAnalysis.commTrend === 'fluktuatif' ||
      dailyAnalysis.hasSpikeOneDayOnly ||
      totalOrders <= 2;

    if (isDeclining) {
      detectedScenario = 'DECLINING (Tren Efisiensi/Komisi Turun)';
      if (isLossExceededRisk || daysActive >= 3) {
        decisionStatus = 'KANDIDAT KILL';
        dataBackedReason = `Komisi/ROAS mengalami penurunan konsisten dan kerugian kumulatif (${formatRupiah(cumulativeLoss)}) telah melampaui batas risiko ${formatRupiah(maxRiskBudget)} atau periode testing telah mencapai ${daysActive} hari.`;
        dataRisksOrLimitations = 'Potensi pembengkakan biaya jika iklan dibiarkan tanpa perbaikan materi kreatif atau audiens.';
        recommendedNextAction = 'Hentikan (kill) atau nonaktifkan ad set / materi iklan ini untuk melindungi anggaran risiko.';
        badgeCls = 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-black';
        statusIcon = '🛑';
        tone = 'red';
      } else {
        decisionStatus = 'OBSERVASI TERBATAS';
        dataBackedReason = `Performa terindikasi menurun namun kerugian kumulatif (${formatRupiah(cumulativeLoss)}) masih dalam batas toleransi risiko ${formatRupiah(maxRiskBudget)} pada hari ke-${daysActive}.`;
        dataRisksOrLimitations = 'Tren penurunan dapat berlanjut jika CPR Meta terus meningkat tanpa konversi Shopee.';
        recommendedNextAction = 'Lakukan observasi ketat hingga akhir hari ke-3 atau matikan segera jika batas rugi Rp ' + formatRupiah(maxRiskBudget) + ' tercapai.';
        badgeCls = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold';
        statusIcon = '👀';
        tone = 'yellow';
      }
    } else if (isImprove) {
      detectedScenario = 'IMPROVE (Komisi & Efisiensi Tumbuh)';
      if (isLossWithinRisk) {
        decisionStatus = 'LANJUT TESTING';
        dataBackedReason = `Komisi dan efisiensi ROAS menunjukkan perbaikan yang didukung data riil (komisi tumbuh lebih cepat daripada biaya iklan), dengan sisa batas risiko anggaran masih aman.`;
        dataRisksOrLimitations = 'Tidak ada jaminan otomatis bahwa campaign yang improve pasti langsung hijau di hari berikutnya.';
        recommendedNextAction = 'Lanjutkan testing dan amati apakah tren komisi mampu melewati target ROAS ' + targetRoas.toFixed(2) + 'x pada evaluasi penuh 3 hari.';
        badgeCls = 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700 font-black';
        statusIcon = '🚀';
        tone = 'blue';
      } else {
        decisionStatus = 'OBSERVASI TERBATAS';
        dataBackedReason = `Ada sinyal perbaikan komisi, namun total biaya telah mendekati/melebihi batas risiko testing (${formatRupiah(maxRiskBudget)}).`;
        dataRisksOrLimitations = 'Peningkatan komisi belum cukup menutup akumulasi kerugian secara cepat.';
        recommendedNextAction = 'Batasi penambahan anggaran dan pantau konversi keranjang belanja dalam 24 jam ke depan.';
        badgeCls = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold';
        statusIcon = '👀';
        tone = 'yellow';
      }
    } else if (isStagnant) {
      detectedScenario = 'STAGNAN (Tidak Ada Peningkatan Berarti)';
      if (daysActive >= 3 || isLossExceededRisk) {
        decisionStatus = 'KANDIDAT KILL';
        dataBackedReason = `Tidak ada perbaikan berarti pada komisi maupun ROAS selama ${daysActive} hari testing, dan biaya telah mencapai batas evaluasi.`;
        dataRisksOrLimitations = 'Materi kreatif atau audiens tidak merespons penawaran produk affiliate ini.';
        recommendedNextAction = 'Hentikan campaign ini dan alihkan anggaran testing ke tag atau produk alternatif yang lebih prospektif.';
        badgeCls = 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-black';
        statusIcon = '🛑';
        tone = 'red';
      } else {
        decisionStatus = 'OBSERVASI TERBATAS';
        dataBackedReason = `Komisi masih stagnan pada evaluasi awal (${daysActive} hari), namun data belum mencapai masa evaluasi penuh 3 hari dan anggaran masih dalam batas risiko.`;
        dataRisksOrLimitations = 'Kemungkinan jeda waktu (attribution delay) antara klik iklan dengan checkout pesanan Shopee.';
        recommendedNextAction = 'Lanjutkan observasi hingga genap 3 hari tanpa menaikkan anggaran harian.';
        badgeCls = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold';
        statusIcon = '👀';
        tone = 'yellow';
      }
    } else {
      // Default Fluktuatif / Belum Konklusif
      detectedScenario = 'FLUKTUATIF / BELUM KONKLUSIF';
      decisionStatus = 'OBSERVASI TERBATAS';
      dataBackedReason = dailyAnalysis.hasSpikeOneDayOnly
        ? `Performa fluktuatif karena satu hari spike tidak dapat dijadikan bukti keberhasilan tunggal tanpa konsistensi.`
        : `Performa harian naik-turun dan volume pesanan (${totalOrders} pesanan) masih belum konklusif.`;
      dataRisksOrLimitations = 'Volatilitas hasil harian tinggi; hindari keputusan impulsif sebelum data stabil.';
      recommendedNextAction = 'Pertahankan pengamatan terbatas selama anggaran risiko aman dan tunggu konfirmasi data 1-2 hari lagi.';
      badgeCls = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold';
      statusIcon = '👀';
      tone = 'yellow';
    }
  }

  // ==========================================
  // 3. EVALUASI MODE PROFITABLE (CAMPAIGN SUDAH HIJAU)
  // ==========================================
  else {
    // Prinsip Utama: JANGAN melakukan kill hanya karena komisi stagnan, fluktuatif, atau menurun
    // selama campaign masih memenuhi kriteria profitabilitas yang berlaku (ROAS Kumulatif >= targetRoas).
    const isStillProfitable = cumulativeRoas >= targetRoas;

    if (!isStillProfitable) {
      // Jika ROAS kumulatif atau indikator profitabilitas utama tidak lagi memenuhi batas pengguna
      detectedScenario = 'PROFITABILITAS TURUN DI BAWAH TARGET';
      decisionStatus = 'EVALUASI PROFITABILITAS';
      dataBackedReason = `ROAS kumulatif saat ini (${cumulativeRoas.toFixed(2)}x) telah turun di bawah target batas hijau pengguna (${targetRoas.toFixed(2)}x). Campaign tidak boleh dipertahankan tanpa batas hanya karena sebelumnya pernah hijau.`;
      dataRisksOrLimitations = 'Penurunan efisiensi yang berlanjut akan menggerus keuntungan bersih yang telah diperoleh sebelumnya.';
      recommendedNextAction = 'Lakukan evaluasi ad fatigue (kejenuhan audiens), audit placement dengan kebocoran tinggi, atau sesuaikan kembali bid/budget.';
      badgeCls = 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 font-black';
      statusIcon = '🔍';
      tone = 'orange';
    } else {
      // Campaign Masih Memenuhi Kriteria Profitabilitas (Hijau)
      if (dailyAnalysis.hasConsistentDecline || dailyAnalysis.commTrend === 'turun') {
        // Hijau tetapi declining
        detectedScenario = 'HIJAU TETAPI DECLINING';
        decisionStatus = 'PERTAHANKAN DENGAN PERINGATAN';
        dataBackedReason = `Meskipun komisi harian terindikasi menurun, ROAS kumulatif (${cumulativeRoas.toFixed(2)}x) masih di atas target hijau pengguna (${targetRoas.toFixed(2)}x) dengan laba bersih +${formatRupiah(netProfit)}. Jangan kill campaign yang masih untung!`;
        dataRisksOrLimitations = 'Jika tren penurunan berlanjut, ROAS kumulatif dapat tergelincir ke bawah target.';
        recommendedNextAction = 'Pertahankan campaign sambil memberikan perhatian ekstra pada tren ROAS harian dan siapkan materi iklan penyegar (ad refresh).';
        badgeCls = 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 font-bold';
        statusIcon = '⚠️';
        tone = 'yellow';
      } else if (dailyAnalysis.commTrend === 'fluktuatif' || dailyAnalysis.roasTrend === 'fluktuatif') {
        // Hijau dan fluktuatif
        detectedScenario = 'HIJAU & FLUKTUATIF';
        decisionStatus = 'PERTAHANKAN';
        dataBackedReason = `Performa harian mengalami fluktuasi wajar, namun ROAS kumulatif tetap kuat di ${cumulativeRoas.toFixed(2)}x (> target ${targetRoas.toFixed(2)}x). Jangan mengambil keputusan berdasarkan satu hari buruk.`;
        dataRisksOrLimitations = 'Fluktuasi siklus belanja mingguan pengguna Shopee (payday vs tanggal tua).';
        recommendedNextAction = 'Pertahankan campaign dan evaluasi tren kumulatif mingguan secara berkala.';
        badgeCls = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold';
        statusIcon = '✅';
        tone = 'green';
      } else if (dailyAnalysis.commTrend === 'stagnan') {
        // Hijau dan stagnan
        detectedScenario = 'HIJAU & STAGNAN';
        decisionStatus = 'PERTAHANKAN';
        dataBackedReason = `Komisi berjalan stabil/stagnan, tetapi unit economics sangat menguntungkan (ROAS ${cumulativeRoas.toFixed(2)}x vs target ${targetRoas.toFixed(2)}x). Stagnasi bukan alasan otomatis untuk menghentikan campaign yang profitabel.`;
        dataRisksOrLimitations = 'Potensi kejenuhan audiens dalam jangka panjang jika frekuensi iklan naik.';
        recommendedNextAction = 'Pertahankan campaign ini dan pertimbangkan ekspansi bertahap ke audiens lookalike / penempatan baru.';
        badgeCls = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold';
        statusIcon = '✅';
        tone = 'green';
      } else {
        // Hijau dan stabil / bertumbuh
        detectedScenario = 'HIJAU & STABIL';
        decisionStatus = 'PERTAHANKAN';
        dataBackedReason = `Performa sangat sehat dengan ROAS kumulatif ${cumulativeRoas.toFixed(2)}x di atas target hijau ${targetRoas.toFixed(2)}x, profit bersih +${formatRupiah(netProfit)}, dan stabilitas konversi yang terbukti.`;
        dataRisksOrLimitations = 'Perubahan algoritma iklan atau lonjakan biaya CPM kompetitor.';
        recommendedNextAction = 'Pertahankan campaign sebagai mesin profit utama dan jaga anggaran tetap konsisten.';
        badgeCls = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-black';
        statusIcon = '✅';
        tone = 'green';
      }
    }
  }

  return {
    '1_campaignName': campaignName,
    '2_analysisPeriod': analysisPeriod,
    '3_analysisMode': analysisMode,
    '4_totalAdSpend': totalSpend,
    '5_totalCommission': totalCommission,
    '6_dailyAndCumulativeRoas': {
      cumulativeRoas,
      daily: dailyRoasList,
    },
    '7_roiOnAdSpend': roiOnAdSpend,
    '8_performanceTrend': performanceTrend,
    '9_detectedScenario': detectedScenario,
    '10_decisionStatus': decisionStatus,
    '11_dataBackedReason': dataBackedReason,
    '12_dataRisksOrLimitations': dataRisksOrLimitations,
    '13_recommendedNextAction': recommendedNextAction,
    confidenceLevel,
    confidenceReason,
    netProfit,
    badgeCls,
    statusIcon,
    tone,
    modeSource,
  };
}

/**
 * Buat Ringkasan Perbandingan Antar-Campaign Sesuai Panduan Bagian G
 */
export function generateComparisonSummary(reports: DecisionReport13[]): {
  total: number;
  lanjutTesting: DecisionReport13[];
  observasiTerbatas: DecisionReport13[];
  kandidatKill: DecisionReport13[];
  pertahankan: DecisionReport13[];
  pertahankanPeringatan: DecisionReport13[];
  evaluasiProfitabilitas: DecisionReport13[];
  dataBelumMemadai: DecisionReport13[];
} {
  const lanjutTesting: DecisionReport13[] = [];
  const observasiTerbatas: DecisionReport13[] = [];
  const kandidatKill: DecisionReport13[] = [];
  const pertahankan: DecisionReport13[] = [];
  const pertahankanPeringatan: DecisionReport13[] = [];
  const evaluasiProfitabilitas: DecisionReport13[] = [];
  const dataBelumMemadai: DecisionReport13[] = [];

  reports.forEach((rep) => {
    switch (rep['10_decisionStatus']) {
      case 'LANJUT TESTING':
        lanjutTesting.push(rep);
        break;
      case 'OBSERVASI TERBATAS':
        observasiTerbatas.push(rep);
        break;
      case 'KANDIDAT KILL':
        kandidatKill.push(rep);
        break;
      case 'PERTAHANKAN':
        pertahankan.push(rep);
        break;
      case 'PERTAHANKAN DENGAN PERINGATAN':
        pertahankanPeringatan.push(rep);
        break;
      case 'EVALUASI PROFITABILITAS':
        evaluasiProfitabilitas.push(rep);
        break;
      case 'DATA BELUM MEMADAI':
      default:
        dataBelumMemadai.push(rep);
        break;
    }
  });

  return {
    total: reports.length,
    lanjutTesting,
    observasiTerbatas,
    kandidatKill,
    pertahankan,
    pertahankanPeringatan,
    evaluasiProfitabilitas,
    dataBelumMemadai,
  };
}
