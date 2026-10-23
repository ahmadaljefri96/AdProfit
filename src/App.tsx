// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom';
import * as jsxRuntime from 'react/jsx-runtime';
import {
  aggregateDailyMeta,
  aggregatePlacementMeta,
  calculateClickLeakage,
  calculateTagPlacementLeakage,
  calculateCookiePlantingSummary,
  calculateDailyBreakdownForRows,
  DailyBreakdownRow,
  getLeakageBadgeStyle,
  getAffiliateInsight,
  extractMetaClicks
} from './utils/metaBreakdown.ts';
import { CookieOptimizerHub } from './components/CookieOptimizerHub.tsx';
import { TagDashboard } from './TagDashboard.tsx';

import {
  Cookie as CookieIcon,
  Activity as or,
  Award as ym,
  CalendarRange as Yi,
  Calendar as ma,
  ChartColumn as Xi,
  ChartLine as bu,
  ChartNoAxesColumn as cr,
  ChartPie as wu,
  Check as km,
  ChevronDown as bm,
  CircleCheck as al,
  CircleHelp as ju,
  CirclePlus as Nu,
  CloudUpload as Su,
  DollarSign as il,
  Download as qi,
  ExternalLink as wm,
  Gift as Cu,
  Heart as jm,
  Import as Nm,
  Info as Zi,
  Layers as Pu,
  LayoutList as pa,
  Lightbulb as Tu,
  Moon as Sm,
  MousePointerClick as ol,
  Printer as Cm,
  Search as Lu,
  Share2 as Du,
  ShoppingCart as fa,
  Sun as Pm,
  Target as Tm,
  ToggleLeft as Dm,
  ToggleRight as Em,
  Trash2 as Rm,
  TrendingDown as Mm,
  TrendingUp as ha,
  TriangleAlert as Ji,
  Trophy as Eu,
  X as It
} from 'lucide-react';

const I = React;
const r = jsxRuntime;
const zm = ReactDOM;

function getMetaItemType(linkKey) {
    if (!linkKey) return "campaign";
    if (linkKey.startsWith("adset:")) return "adset";
    if (linkKey.startsWith("ad:")) return "ad";
    if (linkKey.startsWith("campaign:")) return "campaign";
    return "campaign";
}

function getMetaItemName(linkKey) {
    if (!linkKey) return "";
    if (linkKey.startsWith("adset:")) return linkKey.slice(6);
    if (linkKey.startsWith("ad:")) return linkKey.slice(3);
    if (linkKey.startsWith("campaign:")) return linkKey.slice(9);
    return linkKey;
}

function matchesMetaRow(linkKey, row) {
    if (!linkKey || !row) return false;
    if (linkKey.startsWith("adset:")) {
        const name = linkKey.slice(6);
        return row["Ad set name"] === name || row["Ad Set Name"] === name;
    }
    if (linkKey.startsWith("ad:")) {
        const name = linkKey.slice(3);
        return row["Ad name"] === name || row["Ad Name"] === name;
    }
    if (linkKey.startsWith("campaign:")) {
        const name = linkKey.slice(9);
        return row["Campaign name"] === name;
    }
    return row["Campaign name"] === linkKey || row["Ad set name"] === linkKey || row["Ad Set Name"] === linkKey || row["Ad name"] === linkKey || row["Ad Name"] === linkKey;
}


const Ru = {
        xs: {
            trigger: "text-[9px] max-sm:text-[10px] px-2 py-1 max-sm:py-1.5 rounded-lg gap-1",
            chevron: 10
        },
        sm: {
            trigger: "text-xs px-3 py-2 max-sm:py-2.5 rounded-xl gap-2",
            chevron: 14
        },
        md: {
            trigger: "text-sm px-3 py-2 max-sm:py-2.5 rounded-xl gap-2",
            chevron: 15
        },
        lg: {
            trigger: "text-base px-4 py-3 rounded-xl gap-2",
            chevron: 18
        }
    },
    Mu = {
        default: "bg-white border-slate-200 text-slate-700 font-medium shadow-sm hover:border-indigo-300",
        indigo: "bg-indigo-50 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-100",
        amber: "bg-amber-50 border-amber-200 text-amber-700 font-semibold hover:bg-amber-100"
    },
    zu = 640;

function Wt({
    value: _ = null,
    onChange: se,
    options: j = [],
    placeholder: Re = "Pilih...",
    searchable: Q = j.length > 7,
    searchPlaceholder: pe = "Cari...",
    emptyText: ve = "Tidak ada pilihan",
    disabled: De = !1,
    size: ce = "sm",
    tone: Ke = "default",
    menuMinWidth: Me = 220,
    className: Le = "",
    id: fe
}) {
    const [ze, Ye] = I.useState(!1), [ye, ue] = I.useState(""), [st, Xe] = I.useState(-1), [$e, Ne] = I.useState(null), [filterLevel, setFilterLevel] = I.useState("all"), ct = I.useRef(null), qe = I.useRef(null), ut = I.useRef(null), We = I.useRef(null), Ue = _ == null ? null : j.find(C => !C.heading && C.value === _), Ve = I.useMemo(() => {
        const C = ye.trim().toLowerCase();
        let list = j;
        if (filterLevel !== "all") {
            list = list.filter(z => z.heading || z.type === filterLevel);
        }
        return C ? list.filter(z => !z.heading && `${z.label} ${z.hint||""} ${z.type||""}`.toLowerCase().includes(C)) : list
    }, [j, ye, filterLevel]), kt = I.useMemo(() => Ve.map((C, z) => C.heading ? -1 : z).filter(C => C >= 0), [Ve]), Ie = () => {
        if (!ct.current) return;
        if (window.innerWidth < zu) {
            const ae = window.visualViewport,
                ne = ae ? ae.height : window.innerHeight;
            Ne({
                mobile: !0,
                bottom: ae ? Math.max(0, window.innerHeight - ae.height - ae.offsetTop) : 0,
                maxHeight: Math.round(ne * .82)
            });
            return
        }
        const C = ct.current.getBoundingClientRect(),
            z = Math.min(Math.max(C.width, Me), window.innerWidth - 16),
            x = Math.min(Math.max(8, C.left), window.innerWidth - z - 8),
            P = window.innerHeight - C.bottom - 12,
            te = C.top - 12,
            ee = P < 220 && te > P;
        Ne({
            left: x,
            width: z,
            maxHeight: Math.max(140, Math.min(340, ee ? te : P)),
            ...ee ? {
                bottom: window.innerHeight - C.top + 6
            } : {
                top: C.bottom + 6
            }
        })
    }, Ee = (C = !1) => {
        var z;
        Ye(!1), ue(""), C && ((z = ct.current) == null || z.focus())
    }, lt = C => {
        se == null || se(C.value), Ee(!0)
    };
    I.useLayoutEffect(() => {
        ze && (Ie(), Xe(Ve.findIndex(C => !C.heading && C.value === _)))
    }, [ze]), I.useEffect(() => {
        var te, ee, ae;
        if (!ze) return;
        const C = window.innerWidth < zu;
        (te = Q && !C ? ut.current : qe.current) == null || te.focus();
        const z = ne => {
                var ge, de;
                (ge = ct.current) != null && ge.contains(ne.target) || (de = qe.current) != null && de.contains(ne.target) || Ee()
            },
            x = ne => {
                var ge;
                (ge = qe.current) != null && ge.contains(ne.target) || Ie()
            },
            P = document.body.style.overflow;
        return C && (document.body.style.overflow = "hidden"), document.addEventListener("mousedown", z, !0), window.addEventListener("scroll", x, !0), window.addEventListener("resize", Ie), (ee = window.visualViewport) == null || ee.addEventListener("resize", Ie), (ae = window.visualViewport) == null || ae.addEventListener("scroll", Ie), () => {
            var ne, ge;
            C && (document.body.style.overflow = P), document.removeEventListener("mousedown", z, !0), window.removeEventListener("scroll", x, !0), window.removeEventListener("resize", Ie), (ne = window.visualViewport) == null || ne.removeEventListener("resize", Ie), (ge = window.visualViewport) == null || ge.removeEventListener("scroll", Ie)
        }
    }, [ze]), I.useEffect(() => {
        var C, z;
        ze && ((z = (C = We.current) == null ? void 0 : C.querySelector('[data-active="true"]')) == null || z.scrollIntoView({
            block: "nearest"
        }))
    }, [st, ze]);
    const at = C => {
            if (C.key === "Escape") {
                C.preventDefault(), C.stopPropagation(), Ee(!0);
                return
            }
            if (C.key === "Tab") {
                Ee();
                return
            }
            if (C.key === "ArrowDown" || C.key === "ArrowUp") {
                if (C.preventDefault(), kt.length === 0) return;
                const z = kt.indexOf(st),
                    x = C.key === "ArrowDown" ? 1 : -1,
                    P = z === -1 ? x === 1 ? 0 : kt.length - 1 : (z + x + kt.length) % kt.length;
                Xe(kt[P]);
                return
            }
            C.key === "Enter" && (C.preventDefault(), Ve[st] && !Ve[st].heading && lt(Ve[st]))
        },
        Oe = Ru[ce] || Ru.sm,
        Z = !!($e != null && $e.mobile),
        A = ze && $e && r.jsxs("div", {
            ref: Z ? void 0 : qe,
            tabIndex: -1,
            onKeyDown: at,
            onMouseDown: C => C.stopPropagation(),
            style: Z ? {
                position: "fixed",
                left: 0,
                right: 0,
                bottom: $e.bottom,
                maxHeight: $e.maxHeight,
                animationDuration: "0.22s"
            } : {
                position: "fixed",
                left: $e.left,
                top: $e.top,
                bottom: $e.bottom,
                width: $e.width,
                maxHeight: $e.maxHeight,
                animationDuration: "0.16s"
            },
            className: `flex flex-col bg-white border border-slate-200 shadow-2xl overflow-hidden outline-none animate-in fade-in ${Z?"rounded-t-3xl slide-in-from-bottom-2 pb-[env(safe-area-inset-bottom)]":"z-[9000] rounded-xl zoom-in-95"}`,
            children: [Z && r.jsxs("div", {
                className: "flex-shrink-0 pt-2.5 px-4",
                children: [r.jsx("div", {
                    className: "mx-auto w-10 h-1 rounded-full bg-slate-200"
                }), r.jsxs("div", {
                    className: "flex items-center justify-between gap-3 py-3",
                    children: [r.jsx("span", {
                        className: "text-sm font-black text-slate-800 truncate",
                        children: Re
                    }), r.jsx("button", {
                        type: "button",
                        onClick: () => Ee(),
                        className: "w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-slate-400 bg-slate-100 active:bg-slate-200 flex-shrink-0",
                        "aria-label": "Tutup",
                        children: r.jsx(It, {
                            size: 16
                        })
                    })]
                })]
            }), Q && r.jsxs("div", {
                className: `relative flex-shrink-0 ${Z?"px-4 pb-3":"p-2 border-b border-slate-100"}`,
                children: [r.jsx(Lu, {
                    size: Z ? 16 : 13,
                    className: `absolute top-1/2 text-slate-400 pointer-events-none ${Z?"left-7 -translate-y-[calc(50%+6px)]":"left-4 -translate-y-1/2"}`
                }), r.jsx("input", {
                    ref: ut,
                    type: "text",
                    inputMode: "search",
                    enterKeyHint: "search",
                    value: ye,
                    onChange: C => {
                        ue(C.target.value), Xe(-1)
                    },
                    placeholder: pe,
                    className: `w-full border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50 text-slate-700 ${Z?"text-base rounded-xl pl-10 pr-10 py-2.5":"text-xs rounded-lg pl-7 pr-7 py-1.5"}`
                }), ye && r.jsx("button", {
                    type: "button",
                    onClick: () => {
                        var C;
                        ue(""), (C = ut.current) == null || C.focus()
                    },
                    className: `absolute top-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors ${Z?"right-5 w-8 h-8 -translate-y-[calc(50%+6px)]":"right-3.5 w-4 h-4 -translate-y-1/2"}`,
                    title: "Hapus pencarian",
                    children: r.jsx(It, {
                        size: Z ? 15 : 11
                    })
                })]
            }), j.some(z => z.type) && r.jsxs("div", {
                className: "flex items-center gap-1 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[10px] overflow-x-auto no-scrollbar flex-shrink-0",
                children: [
                    r.jsx("button", {
                        type: "button",
                        onClick: () => setFilterLevel("all"),
                        className: `px-2 py-0.5 rounded-full font-bold transition-all ${filterLevel === "all" ? "bg-indigo-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"}`,
                        children: "Semua"
                    }),
                    j.some(z => z.type === "campaign") && r.jsx("button", {
                        type: "button",
                        onClick: () => setFilterLevel("campaign"),
                        className: `px-2 py-0.5 rounded-full font-bold transition-all ${filterLevel === "campaign" ? "bg-violet-600 text-white shadow-sm" : "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 border border-violet-200 dark:border-violet-800"}`,
                        children: "📁 Campaign"
                    }),
                    j.some(z => z.type === "adset") && r.jsx("button", {
                        type: "button",
                        onClick: () => setFilterLevel("adset"),
                        className: `px-2 py-0.5 rounded-full font-bold transition-all ${filterLevel === "adset" ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"}`,
                        children: "📑 Ad Set (1-5-1)"
                    }),
                    j.some(z => z.type === "ad") && r.jsx("button", {
                        type: "button",
                        onClick: () => setFilterLevel("ad"),
                        className: `px-2 py-0.5 rounded-full font-bold transition-all ${filterLevel === "ad" ? "bg-amber-600 text-white shadow-sm" : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800"}`,
                        children: "🎯 Ads (1-1-5)"
                    })
                ]
            }), r.jsx("div", {
                ref: We,
                role: "listbox",
                className: `flex-1 min-h-0 overflow-y-auto overscroll-contain ${Z?"px-2 pb-3":"p-1"}`,
                children: Ve.length === 0 ? r.jsx("div", {
                    className: `px-3 text-center text-slate-400 font-medium ${Z?"py-10 text-sm":"py-5 text-[11px]"}`,
                    children: ye.trim() ? r.jsxs(r.Fragment, {
                        children: ['Tidak ada hasil untuk "', r.jsx("b", {
                            children: ye.trim()
                        }), '"']
                    }) : ve
                }) : Ve.map((C, z) => {
                    if (C.heading) return r.jsx("div", {
                        className: `font-bold uppercase tracking-wider text-slate-400 ${Z?"px-3 pt-4 pb-1.5 text-[10px]":"px-2.5 pt-2.5 pb-1 text-[9px]"}`,
                        children: C.heading
                    }, z);
                    const x = Ue && C.value === Ue.value;
                    return r.jsxs("button", {
                        type: "button",
                        role: "option",
                        "aria-selected": !!x,
                        "data-active": z === st,
                        onMouseEnter: () => Xe(z),
                        onClick: () => lt(C),
                        title: C.label,
                        className: `w-full flex items-center gap-2 text-left transition-colors ${Z?"px-3 py-3 min-h-[48px] rounded-xl text-sm active:bg-indigo-50":"px-2.5 py-1.5 rounded-lg text-xs"} ${z===st?"bg-indigo-50":""} ${x?"text-indigo-600 font-bold":"text-slate-700 font-medium"}`,
                        children: [C.type && r.jsx("span", {
                            className: `text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ${
                                C.type === "adset"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                    : C.type === "ad"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                                    : "bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300"
                            }`,
                            children: C.type === "adset" ? "SET" : C.type === "ad" ? "ADS" : "CAMP"
                        }), r.jsx("span", {
                            className: `flex-1 min-w-0 ${Z?"break-words":"truncate"}`,
                            children: C.label
                        }), C.hint && r.jsx("span", {
                            className: `flex-shrink-0 font-semibold text-slate-400 bg-slate-100 rounded-full ${Z?"text-[11px] px-2 py-0.5":"text-[10px] px-1.5 py-0.5"}`,
                            children: C.hint
                        }), x && r.jsx(km, {
                            size: Z ? 16 : 13,
                            className: "flex-shrink-0 text-indigo-500"
                        })]
                    }, z)
                })
            })]
        });
    return r.jsxs(r.Fragment, {
        children: [r.jsxs("button", {
            type: "button",
            id: fe,
            ref: ct,
            disabled: De,
            "aria-haspopup": "listbox",
            "aria-expanded": ze,
            title: Ue ? Ue.label : void 0,
            onClick: () => ze ? Ee() : Ye(!0),
            onKeyDown: C => {
                !ze && (C.key === "ArrowDown" || C.key === "ArrowUp") && (C.preventDefault(), Ye(!0))
            },
            className: `inline-flex items-center justify-between min-w-0 border outline-none cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed ${Oe.trigger} ${Mu[Ke]||Mu.default} ${ze?"ring-2 ring-indigo-200 border-indigo-400":""} ${Le}`,
            children: [r.jsx("span", {
                className: `truncate text-left ${Ue||Ke!=="default"?"":"text-slate-400"}`,
                children: Ue ? Ue.label : Re
            }), r.jsx(bm, {
                size: Oe.chevron,
                className: `flex-shrink-0 opacity-60 transition-transform duration-200 ${ze?"rotate-180":""}`
            })]
        }), A && zm.createPortal(Z ? r.jsxs("div", {
            ref: qe,
            className: "fixed inset-0 z-[9000]",
            onMouseDown: C => C.stopPropagation(),
            children: [r.jsx("div", {
                className: "absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in",
                style: {
                    animationDuration: "0.2s"
                },
                onClick: () => Ee()
            }), A]
        }) : A, document.body)]
    })
}

function Im() {
    const [_, se] = I.useState([]), [j, Re] = I.useState([]), [Q, pe] = I.useState([]), [ve, De] = I.useState("import"), [ce, Ke] = I.useState({}), [Me, Le] = I.useState(!0), [fe, ze] = I.useState("all"), [Ye, ye] = I.useState(""), [ue, st] = I.useState({
        start: "",
        end: ""
    }), [Xe, $e] = I.useState("all"), [Ne, ct] = I.useState(11), [qe, ut] = I.useState(!1), [We, Ue] = I.useState([]), [Ve, kt] = I.useState(""), [Ie, Ee] = I.useState(null), [placementDrilldownTag, setPlacementDrilldownTag] = I.useState(null), [breakdownScopeType, setBreakdownScopeType] = I.useState("all"), [breakdownSelectedKey, setBreakdownSelectedKey] = I.useState(""), [modalDrilldownTab, setModalDrilldownTab] = I.useState("placement"), [modalSubItemFilter, setModalSubItemFilter] = I.useState("all"), [lt, at] = I.useState(null), [Oe, Z] = I.useState(null), [A, C] = I.useState(""), [z, x] = I.useState(""), [P, te] = I.useState("all"), [ee, ae] = I.useState("all"), [ne, ge] = I.useState("all"), [de, Fe] = I.useState("all"), [we, ur] = I.useState(""), [ht, An] = I.useState({
        summary: !0,
        table: !1,
        analytics: !1
    }), [dr, Ar] = I.useState(!1), [Kr, $r] = I.useState(!1), [Tt, Kn] = I.useState(0), [mr, fn] = I.useState({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    }), [Sn, Wr] = I.useState({
        opacity: 0
    }), [cl, bs] = I.useState(!1), [ul, pr] = I.useState(!1), [Br, fr] = I.useState(!1), [Xt, hr] = I.useState(() => (localStorage.getItem("adprofit_theme") || localStorage.getItem("shomet_theme")) === "light" ? "light" : "dark");
    I.useEffect(() => {
        document.documentElement.classList.toggle("dark", Xt === "dark"), localStorage.setItem("adprofit_theme", Xt)
    }, [Xt]);
    const [xa, ws] = I.useState(() => !localStorage.getItem("adprofit_welcomed") && !localStorage.getItem("shomet_welcomed")), [Dt, xr] = I.useState({
        show: !1,
        title: "",
        message: "",
        suggestion: "",
        uploadType: ""
    }), [sn, js] = I.useState({
        col: null,
        dir: "desc"
    }), [ln, Hr] = I.useState(""), Ur = I.useRef(null), Cn = I.useRef(null), $n = I.useRef(null), Ns = I.useRef(null), dl = [{
        "Waktu Klik": "2025-03-01 09:12:00",
        Tag_link: "beauty-skincare"
    }, {
        "Waktu Klik": "2025-03-01 10:05:00",
        Tag_link: "beauty-skincare"
    }, {
        "Waktu Klik": "2025-03-02 11:30:00",
        Tag_link: "fashion-hits"
    }, {
        "Waktu Klik": "2025-03-03 14:00:00",
        Tag_link: "beauty-skincare"
    }, {
        "Waktu Klik": "2025-03-04 08:45:00",
        Tag_link: "fashion-hits"
    }, {
        "Waktu Klik": "2025-03-05 13:20:00",
        Tag_link: "gadget-promo"
    }, {
        "Waktu Klik": "2025-03-06 15:10:00",
        Tag_link: "beauty-skincare"
    }, {
        "Waktu Klik": "2025-03-07 09:55:00",
        Tag_link: "gadget-promo"
    }], ml = [{
        "Waktu Pemesanan": "2025-03-01 09:20:00",
        "ID Pemesanan": "ORD001",
        Tag_link1: "beauty-skincare",
        "Total Komisi per Produk(Rp)": "42000",
        "Kategori L1": "Kecantikan",
        Platform: "Facebook"
    }, {
        "Waktu Pemesanan": "2025-03-01 10:15:00",
        "ID Pemesanan": "ORD002",
        Tag_link1: "beauty-skincare",
        "Total Komisi per Produk(Rp)": "35000",
        "Kategori L1": "Kecantikan",
        Platform: "Instagram"
    }, {
        "Waktu Pemesanan": "2025-03-02 11:45:00",
        "ID Pemesanan": "ORD003",
        Tag_link1: "fashion-hits",
        "Total Komisi per Produk(Rp)": "58000",
        "Kategori L1": "Fashion",
        Platform: "Facebook"
    }, {
        "Waktu Pemesanan": "2025-03-03 14:10:00",
        "ID Pemesanan": "ORD004",
        Tag_link1: "beauty-skincare",
        "Total Komisi per Produk(Rp)": "27000",
        "Kategori L1": "Perawatan Diri",
        Platform: "TikTok"
    }, {
        "Waktu Pemesanan": "2025-03-04 09:00:00",
        "ID Pemesanan": "ORD005",
        Tag_link1: "fashion-hits",
        "Total Komisi per Produk(Rp)": "73000",
        "Kategori L1": "Fashion",
        Platform: "Facebook"
    }, {
        "Waktu Pemesanan": "2025-03-05 13:30:00",
        "ID Pemesanan": "ORD006",
        Tag_link1: "gadget-promo",
        "Total Komisi per Produk(Rp)": "120000",
        "Kategori L1": "Elektronik",
        Platform: "Instagram"
    }, {
        "Waktu Pemesanan": "2025-03-06 15:20:00",
        "ID Pemesanan": "ORD007",
        Tag_link1: "beauty-skincare",
        "Total Komisi per Produk(Rp)": "31000",
        "Kategori L1": "Kecantikan",
        Platform: "Facebook"
    }, {
        "Waktu Pemesanan": "2025-03-07 10:05:00",
        "ID Pemesanan": "ORD008",
        Tag_link1: "gadget-promo",
        "Total Komisi per Produk(Rp)": "95000",
        "Kategori L1": "Elektronik",
        Platform: "TikTok"
    }], pl = [{
        "Reporting starts": "2025-03-01",
        "Reporting ends": "2025-03-01",
        "Campaign name": "Beauty Campaign",
        "Ad set name": "Set 1 - Skincare Glowing (18-24)",
        "Ad name": "Ad 1A - Video Review UGC Serum",
        "Amount spent (IDR)": "25000",
        "Clicks (all)": "80",
        "Link clicks": "80",
        Impressions: "3200",
        Placement: "Instagram Reels"
    }, {
        "Reporting starts": "2025-03-01",
        "Reporting ends": "2025-03-01",
        "Campaign name": "Beauty Campaign",
        "Ad set name": "Set 1 - Skincare Glowing (18-24)",
        "Ad name": "Ad 1A - Video Review UGC Serum",
        Placement: "Instagram Feed",
        "Amount spent (IDR)": "12000",
        "Clicks (all)": "35",
        "Link clicks": "35",
        Impressions: "1500"
    }, {
        "Reporting starts": "2025-03-02",
        "Reporting ends": "2025-03-02",
        "Campaign name": "Fashion Campaign",
        "Ad set name": "Set 1 - Outfit Kasual Hijab",
        "Ad name": "Ad 1 - Reels Try On OOTD",
        Placement: "Facebook Feed",
        "Amount spent (IDR)": "18000",
        "Clicks (all)": "55",
        "Link clicks": "55",
        Impressions: "2100"
    }, {
        "Reporting starts": "2025-03-03",
        "Reporting ends": "2025-03-03",
        "Campaign name": "Beauty Campaign",
        "Ad set name": "Set 2 - Anti Aging Moisturizer",
        "Ad name": "Ad 2B - Carousel Manfaat & Promo",
        Placement: "Instagram Stories",
        "Amount spent (IDR)": "22000",
        "Clicks (all)": "70",
        "Link clicks": "70",
        Impressions: "2900"
    }, {
        "Reporting starts": "2025-03-04",
        "Reporting ends": "2025-03-04",
        "Campaign name": "Fashion Campaign",
        "Ad set name": "Set 2 - Outer & Jaket Pria",
        "Ad name": "Ad 2 - Single Image Diskon 50%",
        Placement: "Facebook Reels",
        "Amount spent (IDR)": "30000",
        "Clicks (all)": "90",
        "Link clicks": "90",
        Impressions: "4000"
    }, {
        "Reporting starts": "2025-03-05",
        "Reporting ends": "2025-03-05",
        "Campaign name": "Gadget Campaign",
        "Ad set name": "Set 1 - Charger GaN 65W Cepat",
        "Ad name": "Ad 1 - Uji Speed Charge & Drop Test",
        Placement: "Instagram Reels",
        "Amount spent (IDR)": "45000",
        "Clicks (all)": "110",
        "Link clicks": "110",
        Impressions: "5500"
    }, {
        "Reporting starts": "2025-03-06",
        "Reporting ends": "2025-03-06",
        "Campaign name": "Beauty Campaign",
        "Ad set name": "Set 1 - Skincare Glowing (18-24)",
        "Ad name": "Ad 1B - Testimoni Before After",
        Placement: "Instagram Feed",
        "Amount spent (IDR)": "20000",
        "Clicks (all)": "65",
        "Link clicks": "65",
        Impressions: "2700"
    }, {
        "Reporting starts": "2025-03-07",
        "Reporting ends": "2025-03-07",
        "Campaign name": "Gadget Campaign",
        "Ad set name": "Set 2 - Kabel Type-C Braided",
        "Ad name": "Ad 2 - Video Unboxing & Flex Test",
        Placement: "Facebook Feed",
        "Amount spent (IDR)": "38000",
        "Clicks (all)": "95",
        "Link clicks": "95",
        Impressions: "4800"
    }], fl = {
        "beauty-skincare": ["adset:Set 1 - Skincare Glowing (18-24)", "adset:Set 2 - Anti Aging Moisturizer"],
        "fashion-hits": ["campaign:Fashion Campaign"],
        "gadget-promo": ["ad:Ad 1 - Uji Speed Charge & Drop Test"]
    }, Vr = () => {
        _.length === 0 && j.length === 0 && Q.length === 0 && (se(dl), Re(ml), pe(pl), Ke(fl), Ue(["beauty-skincare", "fashion-hits", "gadget-promo"]), bs(!0)), ze("all"), Kn(0), $r(!0)
    }, Qr = () => {
        $r(!1), Ee(null), cl && (se([]), Re([]), pe([]), Ke({}), Ue([]), bs(!1))
    }, Bt = [{
        targetId: null,
        tab: null,
        category: "Selamat Datang",
        accent: "#6366f1",
        badgeCls: "bg-indigo-100 text-indigo-700",
        headerCls: "from-indigo-50/70 to-white",
        title: "Selamat Datang di AdProfit!",
        desc: "Dashboard pintar yang menggabungkan performa Iklan Meta dengan komisi Shopee Affiliate-mu dalam satu tampilan terpadu. Panduan ini akan menunjukkan semua fitur satu per satu — sekitar 2 menit.",
        tip: null,
        icon: r.jsx(Tu, {
            size: 26,
            className: "text-amber-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-upload",
        tab: "import",
        category: "Import Data",
        accent: "#3b82f6",
        badgeCls: "bg-blue-100 text-blue-700",
        headerCls: "from-blue-50/70 to-white",
        title: "Upload File CSV / Excel",
        desc: "Upload 3 file data sekaligus: ① File Meta Ads dari Ads Manager, ② Laporan Klik Shopee, dan ③ Laporan Pesanan Affiliate. Format CSV maupun Excel (.xlsx) keduanya didukung.",
        tip: "Untuk Meta Ads, wajib aktifkan Breakdown → By Time → Day di Ads Manager sebelum export, agar data per-hari tersedia.",
        icon: r.jsx(Su, {
            size: 26,
            className: "text-blue-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-summary",
        tab: "dashboard",
        category: "Dashboard",
        accent: "#10b981",
        badgeCls: "bg-emerald-100 text-emerald-700",
        headerCls: "from-emerald-50/70 to-white",
        title: "Ringkasan Performa Keseluruhan",
        desc: "Kartu ini menampilkan total Profit Bersih, ROI, ROAS, Ad Spend+PPN, Komisi Shopee, dan Pesanan. Gunakan filter di kanan atas untuk melihat per-bulan, per-hari, atau rentang tanggal custom.",
        tip: "Atur persentase PPN Meta (default 11%) agar kalkulasi Ad Spend dan Profit lebih akurat sesuai kondisi akun iklanmu.",
        icon: r.jsx(Xi, {
            size: 26,
            className: "text-emerald-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-trend-chart",
        tab: "dashboard",
        category: "Dashboard",
        accent: "#10b981",
        badgeCls: "bg-emerald-100 text-emerald-700",
        headerCls: "from-emerald-50/70 to-white",
        title: "Grafik Tren Komisi vs Ad Spend",
        desc: "Grafik batang interaktif membandingkan Komisi Shopee (hijau) dengan Ad Spend (ungu) setiap harinya. Hari yang boncos otomatis ditampilkan dengan warna merah.",
        tip: "Hover ke setiap batang untuk melihat angka detail Komisi, Ad Spend, dan Profit/Boncos hari tersebut.",
        icon: r.jsx(ha, {
            size: 26,
            className: "text-indigo-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-add-tag",
        tab: "table",
        category: "Tag Performa",
        accent: "#f43f5e",
        badgeCls: "bg-rose-100 text-rose-700",
        headerCls: "from-rose-50/70 to-white",
        title: "Tambah Tag ke Tabel",
        desc: 'Pilih tag link Shopee dari dropdown lalu klik "Tambah Tag" untuk menampilkannya di tabel. Tag diambil otomatis dari kolom Tag_link di file Klik Shopee yang kamu upload.',
        tip: "Setiap tag mewakili satu link affiliasi Shopee-mu. Pastikan kamu menyertakan parameter ?tag= di setiap link agar ter-tracking.",
        icon: r.jsx(Nu, {
            size: 26,
            className: "text-rose-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-tag-filter",
        tab: "table",
        category: "Tag Performa",
        accent: "#f43f5e",
        badgeCls: "bg-rose-100 text-rose-700",
        headerCls: "from-rose-50/70 to-white",
        title: "Filter Tag Aktif: 7 / 30 / 60 Hari",
        desc: 'Gunakan dropdown "Tampilkan Banyak..." untuk memunculkan semua tag yang aktif dalam periode tertentu sekaligus — 7 hari terakhir, 30 hari, 60 hari, atau semua tag.',
        tip: 'Fitur ini sangat berguna saat review bulanan. Pilih "Aktif 30 Hari Terakhir" untuk langsung melihat semua tag bulan ini tanpa tambah satu per satu.',
        icon: r.jsx(ma, {
            size: 26,
            className: "text-rose-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-tag-col-header",
        tab: "table",
        category: "Tag Performa",
        accent: "#f43f5e",
        badgeCls: "bg-rose-100 text-rose-700",
        headerCls: "from-rose-50/70 to-white",
        title: "Kaitkan Campaign Meta ke Tag",
        desc: 'Di setiap baris tag, klik dropdown "+ Kaitkan Campaign Ads..." untuk menghubungkan Campaign Meta-mu ke tag Shopee tersebut. Satu tag bisa dikaitkan ke banyak campaign sekaligus.',
        tip: "Tanpa kaitan campaign, kolom Ad Spend, Klik Meta, CPR, CTR, dan Profit tidak akan terisi — karena AdProfit tidak tahu campaign mana yang mendrive tag ini.",
        icon: r.jsx(Du, {
            size: 26,
            className: "text-violet-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-kpi",
        tab: "table",
        category: "Tag Performa",
        accent: "#f43f5e",
        badgeCls: "bg-rose-100 text-rose-700",
        headerCls: "from-rose-50/70 to-white",
        title: "Target KPI Otomatis",
        desc: "Aktifkan KPI Target untuk metrik pilihanmu (CPR, CTR, ROI, Pesanan, Komisi, dll), isi batas Min & Max, dan setiap sel tabel akan otomatis berwarna sesuai pencapaiannya.",
        tip: "🟢 Hijau = di atas Max (sangat bagus)  ·  🔵 Biru = dalam range Min–Max (target tercapai)  ·  🔴 Merah = di bawah Min (perlu perhatian).",
        icon: r.jsx(Eu, {
            size: 26,
            className: "text-amber-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-table",
        tab: "table",
        category: "Tag Performa",
        accent: "#f43f5e",
        badgeCls: "bg-rose-100 text-rose-700",
        headerCls: "from-rose-50/70 to-white",
        title: "Tabel Performa Lengkap",
        desc: "Tabel menampilkan semua metrik per tag: Ad Spend, PPN, Klik Meta, CPR, CTR, Klik Shopee, Pesanan, Komisi, Rate Link→Shopee, Rate Shopee→Order, Profit Bersih, ROI, hingga statistik tren.",
        tip: "Klik tombol nama tag (biru) di kolom pertama untuk membuka popup breakdown performa harian tag tersebut secara detail lengkap dengan grafik.",
        icon: r.jsx(pa, {
            size: 26,
            className: "text-slate-600 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-tag-modal",
        tab: "table",
        openModal: "beauty-skincare",
        category: "Tag Performa",
        accent: "#f43f5e",
        badgeCls: "bg-rose-100 text-rose-700",
        headerCls: "from-rose-50/70 to-white",
        title: "Detail Harian per Tag",
        desc: "Klik nama tag (tombol biru) di tabel untuk membuka popup ini. Berisi breakdown performa per hari: Ad Spent, Klik Meta, CPR, Klik Shopee, Pesanan, Komisi, dan Profit — dalam satu tabel lengkap.",
        tip: "Cocok untuk menganalisis hari mana yang paling cuan dan hari mana yang boncos, lalu optimasi jadwal penayangan iklan.",
        icon: r.jsx(cr, {
            size: 26,
            className: "text-indigo-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-analytics",
        tab: "analytics",
        category: "Analitik Lanjutan",
        accent: "#f59e0b",
        badgeCls: "bg-amber-100 text-amber-700",
        headerCls: "from-amber-50/70 to-white",
        title: "Analitik Mendalam",
        desc: "Gali data lebih dalam: kategori produk terlaris berdasarkan pesanan & komisi, sumber platform pembeli (Facebook, TikTok, Instagram, dll), dan grafik tren komisi & pesanan per tag.",
        tip: "Filter setiap grafik berdasarkan tag spesifik untuk analisis terfokus per link affiliasi tertentu.",
        icon: r.jsx(or, {
            size: 26,
            className: "text-amber-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: "step-export",
        tab: "export",
        category: "Export PDF",
        accent: "#475569",
        badgeCls: "bg-slate-100 text-slate-600",
        headerCls: "from-slate-50/80 to-white",
        title: "Export Laporan PDF Profesional",
        desc: "Generate laporan PDF dan langsung terdownload ke perangkat. Pilih periode bulan & konten: Ringkasan Eksekutif, Tabel Tag, dan/atau Analitik. Teks di dalam PDF bisa diseleksi & dicopy.",
        tip: "Library PDF dimuat otomatis dari CDN saat pertama kali klik export. Pastikan koneksi internet aktif.",
        icon: r.jsx(qi, {
            size: 26,
            className: "text-slate-500 flex-shrink-0 mt-0.5"
        })
    }, {
        targetId: null,
        tab: null,
        category: "Selesai!",
        accent: "#10b981",
        badgeCls: "bg-emerald-100 text-emerald-700",
        headerCls: "from-emerald-50/70 to-white",
        title: "Kamu Sudah Siap! 🎉",
        desc: "Semua fitur AdProfit sudah kamu kenali. Sekarang upload file CSV-mu, tambahkan tag, kaitkan campaign Meta, dan mulai analisis performa iklan vs komisi Shopee Affiliate-mu.",
        tip: "Klik tombol Panduan di header kapan saja untuk membuka kembali tur ini.",
        icon: r.jsx(al, {
            size: 26,
            className: "text-emerald-500 flex-shrink-0 mt-0.5"
        })
    }];
    I.useEffect(() => {
        if (!Kr) return;
        const i = Bt[Tt];
        i.tab && De(i.tab), "openModal" in i ? Ee(i.openModal || null) : Ee(null);
        const u = () => {
            if (!i.targetId) {
                fn({
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }), Wr({
                    opacity: 0
                });
                return
            }
            const d = document.getElementById(i.targetId);
            if (!d) return;
            const p = d.getBoundingClientRect(),
                g = 8,
                k = 420,
                D = 300;
            let R = p.bottom + g + 12,
                O = p.left + p.width / 2 - k / 2;
            R + D > window.innerHeight - 16 && (R = p.top - D - g - 12), R < 16 && (R = 16), O < 12 && (O = 12), O + k > window.innerWidth - 12 && (O = window.innerWidth - k - 12), Wr({
                top: p.top - g,
                left: p.left - g,
                width: p.width + g * 2,
                height: p.height + g * 2,
                opacity: 1
            }), fn({
                top: R,
                left: O,
                transform: "none"
            })
        };
        if (i.targetId && setTimeout(() => {
                const d = document.getElementById(i.targetId);
                d && d.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                })
            }, 100), i.openModal) {
            Wr({
                opacity: 0
            }), fn({
                top: "50%",
                right: 32,
                left: "auto",
                transform: "translateY(-50%)"
            });
            return
        }
        const o = setTimeout(u, 450);
        return window.addEventListener("resize", u), window.addEventListener("scroll", u, !0), () => {
            clearTimeout(o), window.removeEventListener("resize", u), window.removeEventListener("scroll", u, !0)
        }
    }, [Tt, Kr]);
    const Ss = () => {
            Tt < Bt.length - 1 ? Kn(i => i + 1) : Qr()
        },
        gr = () => {
            Tt > 0 && Kn(i => i - 1)
        },
        hl = (i, u) => {
            const o = i.replace(/^\uFEFF/, "").split(`
`);
            if (o.length < 2) {
                u([]);
                return
            }
            let d = -1,
                p = ",";
            for (let O = 0; O < Math.min(15, o.length); O++) {
                const v = o[O].toLowerCase();
                if (v.includes("click id") || v.includes("klik id") || v.includes("order id") || v.includes("id pesanan") || v.includes("id pemesanan") || v.includes("campaign name") || v.includes("nama kampanye") || v.includes("ad set name") || v.includes("nama set iklan") || v.includes("ad name") || v.includes("nama iklan") || v.includes("awal pelaporan") || v.includes("reporting starts") || v.includes("waktu klik") || v.includes("click time")) {
                    d = O;
                    const V = (o[O].match(/,/g) || []).length,
                        W = (o[O].match(/;/g) || []).length,
                        le = (o[O].match(/\t/g) || []).length;
                    W > V && W > le ? p = ";" : le > V && le > W ? p = "	" : p = ",";
                    break
                }
            }
            if (d === -1) {
                u([]);
                return
            }
            const g = p === "	" ? /\t/ : new RegExp(`${p}(?=(?:(?:[^"]*"){2})*[^"]*$)`),
                k = O => {
                    const v = O.toLowerCase().replace(/[\u200B-\u200D\uFEFF"]/g, "").trim();
                    return v === "campaign name" || v === "nama kampanye" ? "Campaign name" :
       v === "placement" || v === "penempatan" || v.includes("placement") || v.includes("penempatan") || v.includes("publisher platform") || v.includes("posisi platform") ? "Placement" :
       v === "outbound clicks" || v === "klik keluar" || v === "outbound click" ? "Outbound clicks" :
       v === "ad set name" || v === "nama set iklan" || v === "adset name" || v === "nama ad set" || v === "nama adset" || v === "ad set" || v === "adset" || v.includes("ad set name") || v.includes("nama set iklan") ? "Ad set name" :
       v === "ad set id" || v === "id set iklan" || v === "adset id" ? "Ad set ID" :
       v === "ad name" || v === "nama iklan" || v === "nama ad" || v === "nama ads" || v === "ads name" || v === "nama materi iklan" || v.includes("ad name") || v.includes("nama iklan") ? "Ad name" :
       v === "ad id" || v === "id iklan" || v === "ads id" ? "Ad ID" : v === "reporting starts" || v === "awal pelaporan" ? "Reporting starts" : v === "reporting ends" || v === "akhir pelaporan" ? "Reporting ends" : v === "account id" || v === "id akun" ? "Account ID" : v === "account name" || v === "nama akun" ? "Account name" : v === "campaign delivery" || v === "penayangan kampanye" || v === "status" ? "Campaign delivery" : v.includes("amount spent") || v.includes("jumlah yang dibelanjakan") ? "Amount spent (IDR)" : v === "link clicks" || v === "klik tautan" ? "Link clicks" : v === "results" || v === "hasil" ? "Results" : v === "result indicator" || v === "indikator hasil" ? "Result indicator" : v === "impressions" || v === "impresi" ? "Impressions" : v === "waktu pemesanan" || v === "order time" ? "Waktu Pemesanan" : v === "waktu klik" || v === "click time" ? "Waktu Klik" : v === "tag_link1" || v === "tag link 1" ? "Tag_link1" : v === "tag_link" || v === "tag link" || v === "tag" ? "Tag_link" : v.includes("total komisi per produk") || v.includes("komisi barang shopee") ? "Total Komisi per Produk(Rp)" : v.includes("total komisi per pesanan") || v.includes("estimasi komisi") || v.includes("estimated commission") ? "Total Komisi per Pesanan(Rp)" : v.includes("l1 kategori") || v.includes("kategori tingkat 1") || v.includes("kategori l1") || v === "kategori" ? "Kategori L1" : v === "platform" || v === "media sosial" ? "Platform" : v === "klik id" || v === "click id" ? "Klik ID" : v === "id pemesanan" || v === "order id" || v === "no. pesanan" ? "ID Pemesanan" : v === "status pesanan" || v === "order status" ? "Status Pesanan" : v.includes("tipe pembeli") || v.includes("jenis pembeli") || v.includes("buyer type") || v.includes("tipe_pembeli") ? "Tipe Pembeli" : v.includes("nama produk") || v === "product name" || v.includes("nama barang") || v.includes("nama barange") ? "Nama Produk" : v.includes("harga produk") || v === "product price" || v.includes("harga satuan") || v.includes("harga jual") || v === "harga(rp)" ? "Harga Produk" : O.replace(/^"|"$/g, "").trim()
                },
                D = o[d].split(g).map(k),
                R = [];
            for (let O = d + 1; O < o.length; O++) {
                const v = o[O].trim();
                if (!v) continue;
                const V = v.split(g).map(le => le.replace(/^"|"$/g, "").trim()),
                    W = {};
                D.forEach((le, je) => {
                    W[le] = V[je] || ""
                }), !W["Link clicks"] && W.Results && W["Result indicator"] && W["Result indicator"].includes("link_click") && (W["Link clicks"] = W.Results), R.push(W)
            }
            u(R)
        },
        vr = async (i, u) => {
            if (!i) return;
            if (i.name.toLowerCase().endsWith(".xlsx")) try {
                window.XLSX || await new Promise((p, g) => {
                    const k = document.createElement("script");
                    k.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", k.onload = p, k.onerror = g, document.head.appendChild(k)
                });
                const d = new FileReader;
                d.onload = p => {
                    const g = new Uint8Array(p.target.result),
                        k = window.XLSX.read(g, {
                            type: "array",
                            cellDates: !0,
                            dateNF: "yyyy-mm-dd"
                        }),
                        D = k.SheetNames[0],
                        R = k.Sheets[D],
                        O = window.XLSX.utils.sheet_to_csv(R, {
                            dateNF: "yyyy-mm-dd"
                        });
                    hl(O, u)
                }, d.readAsArrayBuffer(i)
            } catch (d) {
                console.error("Gagal memproses file Excel:", d)
            } else {
                const d = new FileReader;
                d.onload = p => {
                    hl(p.target.result, u)
                }, d.readAsText(i)
            }
        }, Wn = (i, u, o, d) => {
            const p = Array.from(i.target.files);
            p.length && (p.forEach(g => {
                vr(g, k => {
                    if (!k || k.length === 0) {
                        xr({
                            show: !0,
                            title: "Format File Tidak Dikenali",
                            message: `File "${g.name}" sepertinya kosong, formatnya salah, atau Anda salah memasukkan kotak.`,
                            suggestion: "Pastikan Anda mengekstrak file yang diunduh dan memasukkannya ke kotak yang sesuai.",
                            uploadType: d
                        });
                        return
                    }
                    const D = Object.keys(k[0]);
                    let R = !0,
                        O = "",
                        v = "",
                        V = "";
                    if (d === "meta") {
                        const W = D.includes("Campaign name") || D.includes("Ad set name") || D.includes("Ad name"),
                            le = D.includes("Amount spent (IDR)") || D.includes("Reporting starts");
                        if (!W || !le) R = !1, O = "Salah Memasukkan File? (Meta Ads)", v = `File "${g.name}" tidak memuat kolom penting seperti "Nama Kampanye", "Nama Set Iklan", atau "Nama Iklan".`, V = "Harap unduh data langsung dari Facebook Ads Manager (Level Campaign, Ad Set, atau Ad).";
                        else {
                            let je = !1;
                            for (let Y of k) {
                                const Se = (Y["Campaign name"] || "").toLowerCase();
                                if (!Se || Se === "total" || Se.includes("hasil keseluruhan")) continue;
                                const tt = Y["Reporting starts"],
                                    S = Y["Reporting ends"];
                                if (tt && S && tt !== "--" && S !== "--" && tt !== S) {
                                    je = !0;
                                    break
                                }
                            }
                            je && (R = !1, O = "Oops! Format Meta Ads Keliru", v = `File "${g.name}" merangkum beberapa hari sekaligus.`, V = "Silakan export ulang dari FB Ads Manager. Aktifkan opsi: Breakdown ➔ By Time ➔ Day.")
                        }
                    } else if (d === "click") {
                        const W = D.includes("Klik ID") || D.includes("Click ID"),
                            le = D.includes("Waktu Klik") || D.includes("Click Time");
                        !W && !le && (R = !1, O = "Salah Memasukkan File? (Shopee Clicks)", v = `File "${g.name}" tidak memuat data Klik. Sistem tidak menemukan kolom Klik ID.`, V = "Pastikan Anda mengunggah file Laporan Klik (WebsiteClickReport) dari Dashboard Shopee.")
                    } else if (d === "commission") {
                        const W = D.includes("ID Pemesanan"),
                            le = D.includes("Total Komisi per Pesanan(Rp)") || D.includes("Total Komisi per Produk(Rp)");
                        (!W || !le) && (R = !1, O = "Salah Memasukkan File? (Laporan Pesanan Affiliate)", v = `File "${g.name}" sepertinya bukan Laporan Pesanan Affiliate. Sistem tidak menemukan kolom ID Pemesanan.`, V = "Pastikan Anda mengunggah file AffiliateCommissionReport dari menu Laporan → Laporan Pesanan Affiliate.")
                    }
                    if (!R) {
                        xr({
                            show: !0,
                            title: O,
                            message: v,
                            suggestion: V,
                            uploadType: d
                        });
                        return
                    }
                    u(W => {
                        const le = k.filter(o),
                            je = d === "meta",
                            Y = je ? (({
                                __file: S,
                                ...N
                            }) => JSON.stringify(N)) : (S => JSON.stringify(S)),
                            Se = new Set(W.map(Y)),
                            tt = le.filter(S => {
                                const N = Y(S);
                                return Se.has(N) ? !1 : (Se.add(N), !0)
                            });
                        return [...W, ...je ? tt.map(S => ({
                            ...S,
                            __file: g.name
                        })) : tt]
                    })
                })
            }), i.target.value = null)
        }, J = i => new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(i || 0), ke = i => new Intl.NumberFormat("id-ID").format(i || 0), Pn = i => {
            if (!i) return "-";
            const [u, o] = i.split("-"), d = new Date(u, o - 1);
            return new Intl.DateTimeFormat("id-ID", {
                month: "long",
                year: "numeric"
            }).format(d)
        }, G = i => {
            if (!i || i === "--" || i === "-") return 0;
            let u = String(i).replace(/Rp|IDR|\s|"/gi, "").trim();
            if (u.includes(",") && u.includes(".")) u.lastIndexOf(",") > u.lastIndexOf(".") ? u = u.replace(/\./g, "").replace(",", ".") : u = u.replace(/,/g, "");
            else if (u.includes(",")) {
                const d = u.split(",");
                d.length > 2 || d[d.length - 1].length === 3 ? u = u.replace(/,/g, "") : u = u.replace(/,/g, ".")
            }
            const o = parseFloat(u);
            return isNaN(o) ? 0 : o
        }, qt = i => {
            if (!i) return "-";
            const u = new Date(i);
            return isNaN(u.getTime()) ? "-" : new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric"
            }).format(u)
        }, xt = i => {
            if (!i) return "-";
            const u = new Date(i);
            return isNaN(u.getTime()) ? "-" : new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short"
            }).format(u)
        }, Cs = i => {
            if (i == null || isNaN(i)) return "-";
            if (i < 0) return "< 1m";
            const u = Math.floor(i / 1e3),
                o = Math.floor(u / 60),
                d = Math.floor(o / 60),
                p = Math.floor(d / 24);
            return p > 0 ? `${p} hari ${d%24} jam` : d > 0 ? `${d} jam ${o%60} mnt` : o > 0 ? `${o} mnt ${u%60} dtk` : `${u} detik`
        }, Ht = I.useMemo(() => {
            if (!_.length) return null;
            let i = new Date("2099-01-01"),
                u = new Date("2000-01-01");
            if (_.forEach(p => {
                    var D;
                    const g = (D = p["Waktu Klik"]) == null ? void 0 : D.replace(" ", "T");
                    if (!g) return;
                    const k = new Date(g);
                    isNaN(k) || (k < i && (i = k), k > u && (u = k))
                }), i > u) return null;
            const o = new Date(i);
            o.setHours(0, 0, 0, 0);
            const d = new Date(u);
            return d.setHours(23, 59, 59, 999), {
                min: o,
                max: d
            }
        }, [_]), be = I.useMemo(() => !Me || !Ht ? j : j.filter(i => {
            var d;
            const u = (d = i["Waktu Pemesanan"] || i["Waktu Klik"]) == null ? void 0 : d.replace(" ", "T");
            if (!u) return !0;
            const o = new Date(u);
            return isNaN(o.getTime()) ? !0 : o >= Ht.min
        }), [j, Me, Ht]), Qe = I.useMemo(() => {
            let i = Q;
            Me && Ht && (i = i.filter(p => {
                const g = p["Reporting starts"],
                    k = p["Reporting ends"];
                if (!g || g === "--") return !0;
                const D = new Date(g);
                if (isNaN(D.getTime())) return !0;
                const R = k && k !== "--" ? new Date(k) : new Date(g);
                return D.setHours(0, 0, 0, 0), R.setHours(23, 59, 59, 999), D <= Ht.max && R >= Ht.min
            })), i = i.filter(p => {
                const g = p["Campaign name"];
                return g && g.toLowerCase() !== "total" && !g.toLowerCase().includes("hasil keseluruhan")
            });
            const u = {};
            i.forEach(p => {
                if (p["Account ID"] || p["Account name"]) return;
                const g = p.__file || "";
                u[g] || (u[g] = new Set), u[g].add(`${p["Reporting starts"]||"nodate"}_${p["Campaign name"]}`)
            });
            const o = {};
            Object.keys(u).forEach(p => {
                const g = Object.keys(o).find(k => {
                    let D = 0;
                    return u[p].forEach(R => {
                        u[k].has(R) && D++
                    }), D > Math.max(u[p].size, u[k].size) / 2
                });
                o[p] = g !== void 0 ? o[g] : p
            });
            const d = {};
            return i.forEach(p => {
                const g = p["Campaign name"] || "",
                    asName = p["Ad set name"] || "",
                    adName = p["Ad name"] || "",
                    placement = p["Placement"] || "",
                    k = p["Reporting starts"] || "nodate",
                    R = `${p["Account ID"]||p["Account name"]||`file:${o[p.__file||""]}`}_${k}_${g}_${asName}_${adName}_${placement}`;
                if (!d[R]) d[R] = p;
                else {
                    const O = G(d[R]["Amount spent (IDR)"]);
                    G(p["Amount spent (IDR)"]) > O && (d[R] = p)
                }
            }), Object.values(d)
        }, [Q, Me, Ht]), Bn = I.useMemo(() => {
            const i = {},
                u = o => {
                    const d = o.__file || "";
                    return i[d] || (i[d] = {
                        file: d,
                        rows: 0,
                        spend: 0,
                        countedSpend: 0,
                        minDate: "",
                        maxDate: ""
                    }), i[d]
                };
            return Q.forEach(o => {
                const d = u(o);
                d.rows += 1, d.spend += G(o["Amount spent (IDR)"]);
                const p = o["Reporting starts"];
                p && p !== "--" && ((!d.minDate || p < d.minDate) && (d.minDate = p), (!d.maxDate || p > d.maxDate) && (d.maxDate = p))
            }), Qe.forEach(o => {
                u(o).countedSpend += G(o["Amount spent (IDR)"])
            }), Object.values(i)
        }, [Q, Qe]), metaLinkOptions = I.useMemo(() => {
            const campMap = new Map();
            const adsetMap = new Map();
            const adMap = new Map();

            Qe.forEach(u => {
                const camp = u["Campaign name"];
                const adset = u["Ad set name"];
                const ad = u["Ad name"];

                if (camp && camp.toLowerCase() !== "total" && !camp.toLowerCase().includes("hasil keseluruhan")) {
                    campMap.set(camp, (campMap.get(camp) || 0) + 1);
                }
                if (adset && adset.toLowerCase() !== "total" && !adset.toLowerCase().includes("hasil keseluruhan")) {
                    if (!adsetMap.has(adset)) {
                        adsetMap.set(adset, { campaign: camp || "", count: 1 });
                    } else {
                        adsetMap.get(adset).count += 1;
                    }
                }
                if (ad && ad.toLowerCase() !== "total" && !ad.toLowerCase().includes("hasil keseluruhan")) {
                    if (!adMap.has(ad)) {
                        adMap.set(ad, { adset: adset || "", campaign: camp || "", count: 1 });
                    } else {
                        adMap.get(ad).count += 1;
                    }
                }
            });

            const campaigns = Array.from(campMap.keys()).sort();
            const adsets = Array.from(adsetMap.keys()).sort();
            const ads = Array.from(adMap.keys()).sort();

            return {
                campaigns,
                adsets,
                ads,
                adsetMap,
                adMap,
                hasAdsetsOrAds: adsets.length > 0 || ads.length > 0
            };
        }, [Qe]),
        xl = I.useMemo(() => metaLinkOptions.campaigns, [metaLinkOptions]),
        getOptionsForTag = I.useCallback((linkedItems = []) => {
            const opts = [];
            const isLinked = (val, name) => linkedItems.includes(val) || linkedItems.includes(name);

            // 1. Campaigns
            const unlinkedCamps = metaLinkOptions.campaigns.filter(c => !isLinked("campaign:" + c, c));
            if (unlinkedCamps.length > 0) {
                opts.push({ heading: `📁 CAMPAIGN (${unlinkedCamps.length})` });
                unlinkedCamps.forEach(c => {
                    opts.push({
                        value: "campaign:" + c,
                        label: c,
                        hint: "Campaign",
                        type: "campaign"
                    });
                });
            }

            // 2. Ad Sets (Struktur 1-5-1)
            const unlinkedAdsets = metaLinkOptions.adsets.filter(a => !isLinked("adset:" + a, a));
            if (unlinkedAdsets.length > 0) {
                opts.push({ heading: `📑 AD SET / SET IKLAN (${unlinkedAdsets.length})` });
                unlinkedAdsets.forEach(a => {
                    const info = metaLinkOptions.adsetMap.get(a);
                    opts.push({
                        value: "adset:" + a,
                        label: a,
                        hint: info && info.campaign ? `Set · ${info.campaign}` : "Set Iklan",
                        type: "adset"
                    });
                });
            }

            // 3. Ads (Struktur 1-1-5)
            const unlinkedAds = metaLinkOptions.ads.filter(a => !isLinked("ad:" + a, a));
            if (unlinkedAds.length > 0) {
                opts.push({ heading: `🎯 ADS / MATERI IKLAN (${unlinkedAds.length})` });
                unlinkedAds.forEach(a => {
                    const info = metaLinkOptions.adMap.get(a);
                    const parent = info && info.adset ? `Ad · ${info.adset}` : (info && info.campaign ? `Ad · ${info.campaign}` : "Materi Iklan");
                    opts.push({
                        value: "ad:" + a,
                        label: a,
                        hint: parent,
                        type: "ad"
                    });
                });
            }

            return opts;
        }, [metaLinkOptions]), Et = I.useMemo(() => {
            const i = new Set;
            return _.forEach(u => {
                var d;
                const o = (d = u["Waktu Klik"]) == null ? void 0 : d.split(" ")[0];
                o && o !== "--" && !isNaN(new Date(o).getTime()) && i.add(o)
            }), be.forEach(u => {
                var d;
                const o = (d = u["Waktu Pemesanan"] || u["Waktu Klik"]) == null ? void 0 : d.split(" ")[0];
                o && o !== "--" && !isNaN(new Date(o).getTime()) && i.add(o)
            }), Qe.forEach(u => {
                const o = u["Reporting starts"];
                o && o !== "--" && !isNaN(new Date(o).getTime()) && i.add(o)
            }), Array.from(i).sort((u, o) => new Date(o) - new Date(u))
        }, [_, be, Qe]), an = I.useMemo(() => {
            const i = new Set(Et.map(u => u.substring(0, 7)));
            return Array.from(i).sort((u, o) => o.localeCompare(u))
        }, [Et]), gl = I.useMemo(() => {
            const i = new Set;
            return be.forEach(u => {
                u.Platform && i.add(u.Platform)
            }), Array.from(i).sort()
        }, [be]);
    I.useEffect(() => {
        !we && an.length > 0 && ur(an[0])
    }, [an, we]);
    const _e = i => !i || i === "--" ? !1 : fe === "all" ? !0 : fe === "daily" ? i === Ye : fe === "monthly" ? i.startsWith(Ye) : fe === "custom" ? !ue.start || !ue.end ? !0 : i >= ue.start && i <= ue.end : !0,
        Ze = I.useMemo(() => {
            let i = 0,
                u = 0,
                o = 0;
            const d = new Set,
                p = {};
            _.forEach(O => {
                var V;
                const v = (V = O["Waktu Klik"]) == null ? void 0 : V.split(" ")[0];
                _e(v) && (i += 1)
            }), be.forEach(O => {
                var le;
                const v = (le = O["Waktu Pemesanan"] || O["Waktu Klik"]) == null ? void 0 : le.split(" ")[0];
                if (!_e(v) || Xe !== "all" && O.Platform !== Xe) return;
                const V = O["ID Pemesanan"];
                V && d.add(V);
                const W = G(O["Total Komisi per Produk(Rp)"]);
                O["Total Komisi per Produk(Rp)"] !== void 0 ? u += W : V && !p[V] && (p[V] = !0, u += G(O["Total Komisi per Pesanan(Rp)"]))
            }), Qe.forEach(O => {
                const v = O["Reporting starts"];
                _e(v) && (o += G(O["Amount spent (IDR)"]))
            });
            const g = o * (1 + Ne / 100),
                k = u - g;
            let D = 0;
            g > 0 ? D = k / g * 100 : u > 0 && (D = 1 / 0);
            let R = 0;
            return g > 0 && (R = u / g), {
                clicks: i,
                orders: d.size,
                commission: u,
                totalSpentWithPpn: g,
                profit: k,
                roi: D,
                roas: R
            }
        }, [_, be, Qe, fe, Ye, ue, Xe, Ne]),
        hn = I.useMemo(() => {
            const i = {},
                u = 1 + Ne / 100;
            return _.forEach(o => {
                var p;
                const d = (p = o["Waktu Klik"]) == null ? void 0 : p.split(" ")[0];
                !d || d === "--" || isNaN(new Date(d).getTime()) || _e(d) && (i[d] || (i[d] = {
                    date: d,
                    clicks: 0,
                    commission: 0,
                    spend: 0,
                    orderIdsSet: new Set,
                    newBuyerOrderIdsSet: new Set,
                    addedOrdersComm: {},
                    clickDatesMap: {}
                }), i[d].clicks += 1)
            }), be.forEach(o => {
                var g, k, D;
                const d = (g = o["Waktu Pemesanan"] || o["Waktu Klik"]) == null ? void 0 : g.split(" ")[0];
                if (!d || d === "--" || isNaN(new Date(d).getTime()) || !_e(d) || Xe !== "all" && o.Platform !== Xe) return;
                i[d] || (i[d] = {
                    date: d,
                    clicks: 0,
                    commission: 0,
                    spend: 0,
                    orderIdsSet: new Set,
                    newBuyerOrderIdsSet: new Set,
                    addedOrdersComm: {},
                    clickDatesMap: {}
                });
                const p = o["ID Pemesanan"];
                if (p) {
                    i[d].orderIdsSet.add(p);
                    const O = (o["Tipe Pembeli"] || ((k = Object.entries(o).find(([V]) => V.toLowerCase().includes("pembeli") || V.toLowerCase().includes("buyer"))) == null ? void 0 : k[1]) || "").toLowerCase();
                    (O.includes("baru") || O.includes("new")) && i[d].newBuyerOrderIdsSet.add(p);
                    const v = (D = o["Waktu Klik"]) == null ? void 0 : D.split(" ")[0];
                    v && v !== "--" && !isNaN(new Date(v).getTime()) && (i[d].clickDatesMap[v] || (i[d].clickDatesMap[v] = new Set), i[d].clickDatesMap[v].add(p))
                }
                o["Total Komisi per Produk(Rp)"] !== void 0 ? i[d].commission += G(o["Total Komisi per Produk(Rp)"]) : p && !i[d].addedOrdersComm[p] && (i[d].addedOrdersComm[p] = !0, i[d].commission += G(o["Total Komisi per Pesanan(Rp)"]))
            }), Qe.forEach(o => {
                const d = o["Reporting starts"];
                if (!d || d === "--" || isNaN(new Date(d).getTime()) || !_e(d)) return;
                i[d] || (i[d] = {
                    date: d,
                    clicks: 0,
                    commission: 0,
                    spend: 0,
                    metaClicks: 0,
                    orderIdsSet: new Set,
                    newBuyerOrderIdsSet: new Set,
                    addedOrdersComm: {},
                    clickDatesMap: {}
                });
                i[d].spend += G(o["Amount spent (IDR)"]) * u;
                const mClicks = G(o["Link clicks"]) || G(o["Outbound clicks"]) || (o["Result indicator"] && o["Result indicator"].includes("link_click") ? G(o["Results"]) : 0) || G(o["Clicks (all)"]);
                i[d].metaClicks = (i[d].metaClicks || 0) + mClicks;
            }), Object.values(i).map(o => {
                const d = o.commission - o.spend,
                    p = o.spend > 0 ? d / o.spend * 100 : o.commission > 0 ? 1 / 0 : 0,
                    g = o.spend > 0 ? o.commission / o.spend : 0,
                    k = Object.entries(o.clickDatesMap).map(([D, R]) => ({
                        date: D,
                        count: R.size
                    })).sort((D, R) => new Date(D.date) - new Date(R.date)),
                    mClicks = o.metaClicks || 0,
                    sClicks = o.clicks || 0,
                    leakageInfo = calculateClickLeakage(mClicks, sClicks);
                return {
                    ...o,
                    metaClicks: mClicks,
                    shopeeClicks: sClicks,
                    kebocoran: leakageInfo.kebocoran,
                    leakagePct: leakageInfo.persentaseBocor,
                    orders: o.orderIdsSet.size,
                    newBuyers: o.newBuyerOrderIdsSet.size,
                    profit: d,
                    roi: p,
                    roas: g,
                    clickDates: k
                }
            }).sort((o, d) => new Date(o.date) - new Date(d.date))
        }, [_, be, Qe, Ne, fe, Ye, ue, Xe]),
        Ps = Math.max(...hn.map(i => Math.max(i.commission, i.spend)), 1),
        overallLeakage = I.useMemo(() => {
            const totalMeta = hn.reduce((sum, d) => sum + (d.metaClicks || 0), 0);
            const totalShopee = hn.reduce((sum, d) => sum + (d.shopeeClicks || d.clicks || 0), 0);
            return calculateClickLeakage(totalMeta, totalShopee);
        }, [hn]),
        placementData = I.useMemo(() => {
            return aggregatePlacementMeta(Qe.filter(o => _e(o["Reporting starts"])));
        }, [Qe, _e]),
        cookiePlantingSummary = I.useMemo(() => {
            const totalMeta = hn.reduce((sum, d) => sum + (d.metaClicks || 0), 0);
            const totalShopee = hn.reduce((sum, d) => sum + (d.shopeeClicks || d.clicks || 0), 0);
            const totalSpend = Ze.totalSpentWithPpn || 0;
            const totalComm = Ze.commission || 0;
            const totalOrders = Ze.orders || 0;
            return calculateCookiePlantingSummary(totalSpend, totalMeta, totalShopee, totalComm, totalOrders, j);
        }, [hn, Ze, j]),
        Tn = i => {
            if (!i) return "";
            const u = i.replace(/-+$/, "");
            return u.split("-")[0] || u
        },
        _t = I.useMemo(() => {
            const i = {};
            return _.forEach(u => {
                var p;
                let o = Tn(u.Tag_link);
                if (!o) return;
                i[o] || (i[o] = {
                    clicks: 0,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {},
                    commissionsArr: [],
                    timeDiffs: [],
                    clickTimes: [],
                    orderTimes: [],
                    clickDatesMap: {}
                }), i[o].clicks += 1;
                const d = (p = u["Waktu Klik"]) == null ? void 0 : p.replace(" ", "T");
                d && i[o].clickTimes.push(new Date(d).getTime())
            }), be.forEach(u => {
                var D, R, O;
                let o = u.Tag_link1;
                if (!o) return;
                o = o.replace(/-+$/, ""), i[o] || (i[o] = {
                    clicks: 0,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {},
                    commissionsArr: [],
                    timeDiffs: [],
                    clickTimes: [],
                    orderTimes: [],
                    clickDatesMap: {}
                });
                const d = u["ID Pemesanan"];
                if (d) {
                    i[o].orderIdsSet.add(d);
                    const v = (D = u["Waktu Klik"]) == null ? void 0 : D.split(" ")[0];
                    v && v !== "--" && !isNaN(new Date(v).getTime()) && (i[o].clickDatesMap[v] || (i[o].clickDatesMap[v] = new Set), i[o].clickDatesMap[v].add(d))
                }
                const p = G(u["Total Komisi per Produk(Rp)"]);
                if (u["Total Komisi per Produk(Rp)"] !== void 0) i[o].commission += p, i[o].commissionsArr.push(p);
                else if (d && !i[o].addedOrdersComm[d]) {
                    i[o].addedOrdersComm[d] = !0;
                    const v = G(u["Total Komisi per Pesanan(Rp)"]);
                    i[o].commission += v, i[o].commissionsArr.push(v)
                }
                const g = (R = u["Waktu Pemesanan"]) == null ? void 0 : R.replace(" ", "T"),
                    k = (O = u["Waktu Klik"]) == null ? void 0 : O.replace(" ", "T");
                if (g && i[o].orderTimes.push(new Date(g).getTime()), g && k) {
                    const v = new Date(g).getTime(),
                        V = new Date(k).getTime();
                    !isNaN(v) && !isNaN(V) && i[o].timeDiffs.push(v - V)
                }
            }), Object.keys(i).map(u => {
                const o = i[u],
                    d = o.commissionsArr,
                    p = o.timeDiffs,
                    g = o.clickTimes.filter(it => !isNaN(it)),
                    k = o.orderTimes.filter(it => !isNaN(it)),
                    D = d.length ? o.commission / d.length : 0,
                    R = d.length ? Math.max(...d) : 0,
                    O = d.length ? Math.min(...d) : 0,
                    v = p.length ? Math.max(...p) : null,
                    V = p.length ? Math.min(...p) : null,
                    W = g.length ? Math.min(...g) : null,
                    le = g.length ? Math.max(...g) : null,
                    je = k.length ? Math.min(...k) : null,
                    Y = k.length ? Math.max(...k) : null,
                    Se = ce[u] || [],
                    tt = Qe.filter(it => Se.some(link => matchesMetaRow(link, it))),
                    S = tt.reduce((it, Vt) => it + G(Vt["Amount spent (IDR)"]), 0),
                    N = tt.reduce((it, Vt) => it + G(Vt["Link clicks"]), 0),
                    F = tt.reduce((it, Vt) => it + G(Vt.Impressions), 0),
                    ie = tt.reduce((it, Vt) => it + G(Vt.Results), 0),
                    he = ie > 0 ? S / ie : N > 0 ? S / N : 0,
                    oe = F > 0 ? N / F * 100 : 0,
                    dt = S * (Ne / 100),
                    mt = S + dt,
                    es = o.commission - mt,
                    Qn = o.orderIdsSet.size;
                let Sr = 0;
                mt > 0 ? Sr = es / mt * 100 : o.commission > 0 && (Sr = 1 / 0);
                let En = 0;
                N > 0 ? En = o.clicks / N * 100 : o.clicks > 0 && (En = 1 / 0);
                let Cr = 0;
                o.clicks > 0 && (Cr = Qn / o.clicks * 100);
                const roasVal = mt > 0 ? o.commission / mt : S > 0 ? o.commission / S : 0;
                const tagLeak = N > o.clicks ? N - o.clicks : 0;
                const tagLeakPct = N > 0 ? (tagLeak / N) * 100 : 0;
                return {
                    tag: u,
                    shopeeClicks: o.clicks,
                    shopeeOrders: Qn,
                    shopeeCommission: o.commission,
                    avgComm: D,
                    maxComm: R,
                    minComm: O,
                    maxDiff: v,
                    minDiff: V,
                    minClick: W,
                    maxClick: le,
                    minOrder: je,
                    maxOrder: Y,
                    linkedCampaigns: Se,
                    amountSpent: S,
                    ppn: dt,
                    totalSpentWithPpn: mt,
                    roas: roasVal,
                    kebocoran: tagLeak,
                    leakagePct: tagLeakPct,
                    metaClicks: N,
                    cpr: he,
                    ctr: oe,
                    keuntungan: es,
                    roi: Sr,
                    rateLinkShopee: En,
                    rateShopeeOrder: Cr,
                    clickDates: Object.entries(o.clickDatesMap).map(([it, Vt]) => ({
                        date: it,
                        count: Vt.size
                    })).sort((it, Vt) => new Date(it.date) - new Date(Vt.date))
                }
            }).sort((u, o) => o.shopeeCommission - u.shopeeCommission || o.shopeeOrders - u.shopeeOrders)
        }, [_, be, ce, Qe, Ne]),
        Ts = I.useMemo(() => {
            const i = ln.trim().toLowerCase(),
                u = _t.filter(o => We.includes(o.tag) && (!i || (o.tag || "").toLowerCase().includes(i) || o.linkedCampaigns.some(d => d.toLowerCase().includes(i))));
            return sn.col ? [...u].sort((o, d) => {
                const p = o[sn.col] ?? 0,
                    g = d[sn.col] ?? 0;
                return sn.dir === "asc" ? p - g : g - p
            }) : u
        }, [_t, We, sn, ln]),
        Gr = I.useMemo(() => _t.filter(i => !We.includes(i.tag)), [_t, We]),
        jt = I.useMemo(() => _t.map(i => ({
            value: i.tag,
            label: i.tag || "<Tanpa Tag>"
        })), [_t]),
        breakdownOptions = I.useMemo(() => {
            const tags = _t.map(t => {
                const linked = ce[t.tag] || [];
                return {
                    value: t.tag,
                    label: `Tag: ${t.tag} (${linked.length} iklan, ${t.shopeeClicks} klik, Komisi: ${J(t.shopeeCommission)})`,
                    name: t.tag,
                    count: linked.length,
                    clicks: t.shopeeClicks,
                    commission: t.shopeeCommission
                };
            });
            const campaigns = metaLinkOptions.campaigns.map(c => {
                const mapped = Object.keys(ce).filter(t => (ce[t] || []).some(l => matchesMetaRow("campaign:" + c, l) || l === "campaign:" + c || l === c));
                return {
                    value: c,
                    label: `${c} ${mapped.length > 0 ? `[Terhubung Tag: ${mapped.join(', ')}]` : '[Belum Dipetakan]'}`,
                    name: c,
                    mappedTags: mapped
                };
            });
            const adsets = metaLinkOptions.adsets.map(a => {
                const mapped = Object.keys(ce).filter(t => (ce[t] || []).some(l => matchesMetaRow("adset:" + a.name, l) || l === "adset:" + a.name || l === a.name));
                return {
                    value: a.name,
                    label: `${a.name} ${mapped.length > 0 ? `[Terhubung Tag: ${mapped.join(', ')}]` : '[Belum Dipetakan]'}`,
                    name: a.name,
                    campaign: a.campaign,
                    mappedTags: mapped
                };
            });
            const ads = metaLinkOptions.ads.map(a => {
                const mapped = Object.keys(ce).filter(t => (ce[t] || []).some(l => matchesMetaRow("ad:" + a.name, l) || l === "ad:" + a.name || l === a.name));
                return {
                    value: a.name,
                    label: `${a.name} ${mapped.length > 0 ? `[Terhubung Tag: ${mapped.join(', ')}]` : '[Belum Dipetakan]'}`,
                    name: a.name,
                    adset: a.adset,
                    campaign: a.campaign,
                    mappedTags: mapped
                };
            });
            return { tags, campaigns, adsets, ads };
        }, [_t, ce, metaLinkOptions]),
        filteredBreakdownData = I.useMemo(() => {
            if (breakdownScopeType === "all" || !breakdownSelectedKey) {
                const totalMeta = hn.reduce((sum, d) => sum + (d.metaClicks || 0), 0);
                const totalShopee = hn.reduce((sum, d) => sum + (d.shopeeClicks || d.clicks || 0), 0);
                const totalSpend = Ze.totalSpentWithPpn || 0;
                const totalComm = Ze.commission || 0;
                const totalOrders = Ze.orders || 0;
                const leakageInfo = calculateClickLeakage(totalMeta, totalShopee);
                const roas = totalSpend > 0 ? totalComm / totalSpend : 0;
                const cpr = totalMeta > 0 ? totalSpend / totalMeta : 0;
                const cprc = totalShopee > 0 ? totalSpend / totalShopee : 0;
                const epc = totalShopee > 0 ? totalComm / totalShopee : 0;
                const insight = getAffiliateInsight({
                    roas,
                    cpr,
                    cprc,
                    epc,
                    leakage: Math.round(leakageInfo.persentaseBocor),
                    spend: totalSpend,
                    clicks: totalMeta,
                    shopeeClicks: totalShopee,
                    commission: totalComm,
                    profit: totalComm - totalSpend
                });

                return {
                    isFiltered: false,
                    scopeType: "all",
                    key: "",
                    label: "Semua Iklan & Shopee (Keseluruhan)",
                    sublabel: "Hasil gabungan seluruh kampanye iklan Meta Ads dan Shopee Affiliate",
                    dailyRows: hn,
                    placementRows: placementData,
                    totalSpend,
                    metaClicks: totalMeta,
                    shopeeClicks: totalShopee,
                    orders: totalOrders,
                    commission: totalComm,
                    profit: totalComm - totalSpend,
                    roas,
                    cpr,
                    cprc,
                    epc,
                    leakageInfo,
                    insight,
                    mappedTags: []
                };
            }

            let metaRows = [];
            let shopeeClickRows = [];
            let shopeeOrderRows = [];
            let label = "";
            let sublabel = "";
            let mappedTagList = [];

            if (breakdownScopeType === "tag") {
                const tag = breakdownSelectedKey;
                const linked = ce[tag] || [];
                metaRows = Qe.filter(r => linked.some(l => matchesMetaRow(l, r)));
                shopeeClickRows = _.filter(r => Tn(r.Tag_link) === tag);
                shopeeOrderRows = be.filter(r => (r.Tag_link1 || '').replace(/-+$/, '') === tag);
                label = `Tag Link: ${tag}`;
                sublabel = linked.length > 0 
                    ? `${linked.length} Iklan Meta Terhubung: ${linked.map(getMetaItemName).join(', ')}` 
                    : "Belum ada kampanye / adset / ad Meta yang dipetakan ke tag ini";
                mappedTagList = [tag];
            } else if (breakdownScopeType === "campaign") {
                const camp = breakdownSelectedKey;
                metaRows = Qe.filter(r => (r["Campaign name"] || r["Campaign Name"]) === camp);
                mappedTagList = Object.keys(ce).filter(t => (ce[t] || []).some(l => matchesMetaRow("campaign:" + camp, l) || l === "campaign:" + camp || l === camp));
                shopeeClickRows = _.filter(r => mappedTagList.includes(Tn(r.Tag_link)));
                shopeeOrderRows = be.filter(r => mappedTagList.includes((r.Tag_link1 || '').replace(/-+$/, '')));
                label = `Kampanye: ${camp}`;
                sublabel = mappedTagList.length > 0 
                    ? `Terhubung ke ${mappedTagList.length} Tag Shopee: ${mappedTagList.join(', ')}` 
                    : "⚠️ Kampanye ini belum dipetakan ke Tag Shopee manapun di tab Tag Performa";
            } else if (breakdownScopeType === "adset") {
                const adset = breakdownSelectedKey;
                metaRows = Qe.filter(r => (r["Ad set name"] || r["Ad Set Name"]) === adset);
                mappedTagList = Object.keys(ce).filter(t => (ce[t] || []).some(l => matchesMetaRow("adset:" + adset, l) || l === "adset:" + adset || l === adset));
                shopeeClickRows = _.filter(r => mappedTagList.includes(Tn(r.Tag_link)));
                shopeeOrderRows = be.filter(r => mappedTagList.includes((r.Tag_link1 || '').replace(/-+$/, '')));
                label = `Ad Set: ${adset}`;
                sublabel = mappedTagList.length > 0 
                    ? `Terhubung ke Tag Shopee: ${mappedTagList.join(', ')}` 
                    : "⚠️ Ad Set ini belum dipetakan ke Tag Shopee manapun di tab Tag Performa";
            } else if (breakdownScopeType === "ad") {
                const ad = breakdownSelectedKey;
                metaRows = Qe.filter(r => (r["Ad name"] || r["Ad Name"]) === ad);
                mappedTagList = Object.keys(ce).filter(t => (ce[t] || []).some(l => matchesMetaRow("ad:" + ad, l) || l === "ad:" + ad || l === ad));
                shopeeClickRows = _.filter(r => mappedTagList.includes(Tn(r.Tag_link)));
                shopeeOrderRows = be.filter(r => mappedTagList.includes((r.Tag_link1 || '').replace(/-+$/, '')));
                label = `Iklan (Ad): ${ad}`;
                sublabel = mappedTagList.length > 0 
                    ? `Terhubung ke Tag Shopee: ${mappedTagList.join(', ')}` 
                    : "⚠️ Iklan ini belum dipetakan ke Tag Shopee manapun di tab Tag Performa";
            }

            const dailyRows = calculateDailyBreakdownForRows(metaRows, shopeeClickRows, shopeeOrderRows, Ne, _e);
            const totalSpend = dailyRows.reduce((sum, d) => sum + d.spend, 0);
            const totalSpent = totalSpend;
            const metaClicks = dailyRows.reduce((sum, d) => sum + d.metaClicks, 0);
            const shopeeClicks = dailyRows.reduce((sum, d) => sum + d.shopeeClicks, 0);
            const orders = dailyRows.reduce((sum, d) => sum + d.orders, 0);
            const commission = dailyRows.reduce((sum, d) => sum + d.commission, 0);
            const profit = commission - totalSpend;
            const roas = totalSpend > 0 ? commission / totalSpend : 0;
            const cpr = metaClicks > 0 ? totalSpend / metaClicks : 0;
            const cprc = shopeeClicks > 0 ? totalSpend / shopeeClicks : 0;
            const epc = shopeeClicks > 0 ? commission / shopeeClicks : 0;
            const leakageInfo = calculateClickLeakage(metaClicks, shopeeClicks);

            const placementDrill = calculateTagPlacementLeakage(metaRows, shopeeClicks, Ne, commission);

            const insight = getAffiliateInsight({
                roas,
                cpr,
                cprc,
                epc,
                leakage: Math.round(leakageInfo.persentaseBocor),
                spend: totalSpend,
                clicks: metaClicks,
                shopeeClicks,
                commission,
                profit
            });

            return {
                isFiltered: true,
                scopeType: breakdownScopeType,
                key: breakdownSelectedKey,
                label,
                sublabel,
                dailyRows,
                placementRows: placementDrill.placements,
                placementSummary: placementDrill,
                totalSpend,
                metaClicks,
                shopeeClicks,
                orders,
                commission,
                profit,
                roas,
                cpr,
                cprc,
                epc,
                leakageInfo,
                insight,
                mappedTags: mappedTagList,
                rawMetaCount: metaRows.length
            };
        }, [breakdownScopeType, breakdownSelectedKey, hn, placementData, Ze, ce, Qe, _, be, Ne, _e]),
        ga = () => {
            Ve && !We.includes(Ve) && (Ue([...We, Ve]), kt(""))
        },
        Ut = i => {
            if (Et.length === 0) return;
            const u = Et[0],
                o = new Date(u),
                d = new Date(o);
            d.setDate(d.getDate() - (i - 1)), d.setHours(0, 0, 0, 0);
            const p = new Date(o);
            p.setHours(23, 59, 59, 999);
            const g = new Set;
            _.forEach(k => {
                var O;
                const D = (O = k["Waktu Klik"]) == null ? void 0 : O.split(" ")[0];
                if (!D || D === "--") return;
                const R = new Date(D);
                if (R >= d && R <= p) {
                    let v = Tn(k.Tag_link || "");
                    v && g.add(v)
                }
            }), be.forEach(k => {
                var O;
                const D = (O = k["Waktu Pemesanan"] || k["Waktu Klik"]) == null ? void 0 : O.split(" ")[0];
                if (!D || D === "--") return;
                const R = new Date(D);
                if (R >= d && R <= p) {
                    let v = (k.Tag_link1 || "").replace(/-+$/, "");
                    v && g.add(v)
                }
            }), Ue(Array.from(g))
        },
        va = I.useMemo(() => {
            if (!Ie) return [];
            const i = {};
            _.forEach(o => {
                var g;
                if (Tn(o.Tag_link || "") !== Ie) return;
                const p = (g = o["Waktu Klik"]) == null ? void 0 : g.split(" ")[0];
                !p || p === "--" || isNaN(new Date(p).getTime()) || (i[p] || (i[p] = {
                    date: p,
                    sClicks: 0,
                    orderIdsSet: new Set,
                    orderItemsMap: {},
                    clickDatesMap: {},
                    sComm: 0,
                    mSpent: 0,
                    mClicks: 0,
                    mImpressions: 0,
                    mResults: 0,
                    addedOrdersComm: {}
                }), i[p].sClicks += 1)
            }), be.forEach(o => {
                var k, D, R, O;
                if ((o.Tag_link1 || "").replace(/-+$/, "") !== Ie) return;
                const p = (k = o["Waktu Pemesanan"] || o["Waktu Klik"]) == null ? void 0 : k.split(" ")[0];
                if (!p || p === "--" || isNaN(new Date(p).getTime())) return;
                i[p] || (i[p] = {
                    date: p,
                    sClicks: 0,
                    orderIdsSet: new Set,
                    orderItemsMap: {},
                    clickDatesMap: {},
                    sComm: 0,
                    mSpent: 0,
                    mClicks: 0,
                    mImpressions: 0,
                    mResults: 0,
                    addedOrdersComm: {}
                });
                const g = o["ID Pemesanan"];
                if (g) {
                    i[p].orderIdsSet.add(g), i[p].orderItemsMap[g] || (i[p].orderItemsMap[g] = []);
                    const v = o["Nama Produk"] || ((D = Object.entries(o).find(([Y]) => Y.toLowerCase().includes("nama barang") || Y.toLowerCase().includes("nama barange") || Y.toLowerCase().includes("nama produk"))) == null ? void 0 : D[1]) || "",
                        V = G(o["Harga Produk"] ?? ((R = Object.entries(o).find(([Y]) => /^harga\(rp\)$/i.test(Y.trim()))) == null ? void 0 : R[1])),
                        W = G(o["Total Komisi per Produk(Rp)"]),
                        le = o["Kategori L1"] || "";
                    (v || V > 0 || W > 0) && i[p].orderItemsMap[g].push({
                        name: v,
                        price: V,
                        comm: W,
                        category: le
                    });
                    const je = (O = o["Waktu Klik"]) == null ? void 0 : O.split(" ")[0];
                    je && je !== "--" && !isNaN(new Date(je).getTime()) && (i[p].clickDatesMap[je] || (i[p].clickDatesMap[je] = new Set), i[p].clickDatesMap[je].add(g))
                }
                o["Total Komisi per Produk(Rp)"] !== void 0 ? i[p].sComm += G(o["Total Komisi per Produk(Rp)"]) : g && !i[p].addedOrdersComm[g] && (i[p].addedOrdersComm[g] = !0, i[p].sComm += G(o["Total Komisi per Pesanan(Rp)"]))
            });
            const u = ce[Ie] || [];
            return Qe.forEach(o => {
                if (!u.some(link => matchesMetaRow(link, o))) return;
                const d = o["Reporting starts"];
                !d || d === "--" || isNaN(new Date(d).getTime()) || (i[d] || (i[d] = {
                    date: d,
                    sClicks: 0,
                    orderIdsSet: new Set,
                    orderItemsMap: {},
                    clickDatesMap: {},
                    sComm: 0,
                    mSpent: 0,
                    mClicks: 0,
                    mImpressions: 0,
                    mResults: 0,
                    addedOrdersComm: {}
                }), i[d].mSpent += G(o["Amount spent (IDR)"]), i[d].mClicks += G(o["Link clicks"]), i[d].mImpressions += G(o.Impressions), i[d].mResults += G(o.Results))
            }), Object.values(i).map(o => ({
                ...o,
                sOrders: o.orderIdsSet.size,
                ordersList: Object.entries(o.orderItemsMap).flatMap(([d, p]) => p.map(g => ({
                    orderId: d,
                    ...g
                }))).sort((d, p) => p.comm - d.comm),
                clickDates: Object.entries(o.clickDatesMap).map(([d, p]) => ({
                    date: d,
                    count: p.size
                })).sort((d, p) => new Date(d.date) - new Date(p.date))
            })).sort((o, d) => new Date(o.date) - new Date(d.date))
        }, [Ie, _, be, Qe, ce]),
        Yr = I.useMemo(() => [..._t].sort((i, u) => u.shopeeCommission - i.shopeeCommission).slice(0, 10), [_t]),
        yr = A || (Yr.length > 0 ? Yr[0].tag : ""),
        Hn = I.useMemo(() => {
            if (!yr) return [];
            const i = {};
            return _.forEach(u => {
                var p;
                if (Tn(u.Tag_link || "") !== yr) return;
                const d = (p = u["Waktu Klik"]) == null ? void 0 : p.split(" ")[0];
                !d || d === "--" || isNaN(new Date(d).getTime()) || (i[d] || (i[d] = {
                    date: d,
                    clicks: 0,
                    orderIdsSet: new Set
                }), i[d].clicks += 1)
            }), be.forEach(u => {
                var g;
                if ((u.Tag_link1 || "").replace(/-+$/, "") !== yr) return;
                const d = (g = u["Waktu Pemesanan"] || u["Waktu Klik"]) == null ? void 0 : g.split(" ")[0];
                if (!d || d === "--" || isNaN(new Date(d).getTime())) return;
                i[d] || (i[d] = {
                    date: d,
                    clicks: 0,
                    orderIdsSet: new Set
                });
                const p = u["ID Pemesanan"];
                p && i[d].orderIdsSet.add(p)
            }), Object.values(i).map(u => ({
                ...u,
                orders: u.orderIdsSet.size
            })).sort((u, o) => new Date(u.date) - new Date(o.date))
        }, [yr, _, be]),
        kr = Math.max(...Hn.map(i => Math.max(i.clicks, i.orders)), 1),
        xn = z || (Yr.length > 0 ? Yr[0].tag : ""),
        Un = I.useMemo(() => {
            if (!xn) return [];
            const i = {};
            return be.forEach(u => {
                var g;
                if ((u.Tag_link1 || "").replace(/-+$/, "") !== xn) return;
                const d = (g = u["Waktu Pemesanan"] || u["Waktu Klik"]) == null ? void 0 : g.split(" ")[0];
                if (!d || d === "--" || isNaN(new Date(d).getTime())) return;
                i[d] || (i[d] = {
                    date: d,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                });
                const p = u["ID Pemesanan"];
                p && i[d].orderIdsSet.add(p), u["Total Komisi per Produk(Rp)"] !== void 0 ? i[d].commission += G(u["Total Komisi per Produk(Rp)"]) : p && !i[d].addedOrdersComm[p] && (i[d].addedOrdersComm[p] = !0, i[d].commission += G(u["Total Komisi per Pesanan(Rp)"]))
            }), Object.values(i).sort((u, o) => new Date(u.date) - new Date(o.date))
        }, [xn, be]),
        ya = Math.max(...Un.map(i => i.commission), 1),
        Ds = I.useMemo(() => {
            const i = {};
            return be.forEach(u => {
                let o = (u.Tag_link1 || "").replace(/-+$/, "");
                if (P !== "all" && o !== P) return;
                const d = u["Kategori L1"] || "Kategori Lainnya / Tidak Tersedia";
                i[d] || (i[d] = {
                    category: d,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                });
                const p = u["ID Pemesanan"];
                p && i[d].orderIdsSet.add(p), u["Total Komisi per Produk(Rp)"] !== void 0 ? i[d].commission += G(u["Total Komisi per Produk(Rp)"]) : p && !i[d].addedOrdersComm[p] && (i[d].addedOrdersComm[p] = !0, i[d].commission += G(u["Total Komisi per Pesanan(Rp)"]))
            }), Object.values(i).map(u => ({
                ...u,
                orders: u.orderIdsSet.size
            })).sort((u, o) => o.orders - u.orders || o.commission - u.commission).slice(0, 10)
        }, [be, P]),
        Es = Math.max(...Ds.map(i => i.orders), 1),
        Xr = I.useMemo(() => {
            const i = {};
            return be.forEach(u => {
                let o = (u.Tag_link1 || "").replace(/-+$/, "");
                if (ee !== "all" && o !== ee) return;
                const d = u.Platform || "Tidak Diketahui";
                i[d] || (i[d] = {
                    platform: d,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                });
                const p = u["ID Pemesanan"];
                p && i[d].orderIdsSet.add(p), u["Total Komisi per Produk(Rp)"] !== void 0 ? i[d].commission += G(u["Total Komisi per Produk(Rp)"]) : p && !i[d].addedOrdersComm[p] && (i[d].addedOrdersComm[p] = !0, i[d].commission += G(u["Total Komisi per Pesanan(Rp)"]))
            }), Object.values(i).map(u => ({
                ...u,
                orders: u.orderIdsSet.size
            })).sort((u, o) => o.orders - u.orders || o.commission - u.commission)
        }, [be, ee]),
        Rs = Math.max(...Xr.map(i => i.orders), 1),
        Dn = I.useMemo(() => {
            const i = {};
            be.forEach(o => {
                const d = o["Klik ID"];
                d && !i[d] && (i[d] = o.Platform || "")
            });
            const u = {};
            return _.forEach(o => {
                const d = (o.Tag_link || "").replace(/-+$/, "");
                if (ne !== "all" && d !== ne) return;
                const p = o["Klik ID"],
                    g = p && i[p] || "Tidak Diketahui";
                u[g] || (u[g] = {
                    platform: g,
                    clicks: 0
                }), u[g].clicks++
            }), Object.values(u).sort((o, d) => d.clicks - o.clicks)
        }, [_, be, ne]),
        ka = Math.max(...Dn.map(i => i.clicks), 1),
        qr = I.useMemo(() => {
            const i = {},
                u = Et[0],
                o = u ? new Date(u) : new Date;
            let d = new Date("2000-01-01"),
                p = new Date("2099-01-01"),
                g = null;
            de === "7d" ? (d = new Date(o), d.setDate(d.getDate() - 6), d.setHours(0, 0, 0, 0), p = o) : de === "30d" ? (d = new Date(o), d.setDate(d.getDate() - 29), d.setHours(0, 0, 0, 0), p = o) : de !== "all" && (g = de);
            const k = R => {
                if (g) return R === g;
                if (de === "all") return !0;
                if (!R || R === "--") return !1;
                const O = new Date(R);
                return O >= d && O <= p
            };
            be.forEach(R => {
                var W;
                const O = (W = R["Waktu Pemesanan"] || R["Waktu Klik"]) == null ? void 0 : W.split(" ")[0];
                if (!k(O)) return;
                let v = (R.Tag_link1 || "").replace(/-+$/, "");
                v || (v = "<Tanpa Tag>"), i[v] || (i[v] = {
                    tag: v,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {},
                    spend: 0
                });
                const V = R["ID Pemesanan"];
                V && i[v].orderIdsSet.add(V), R["Total Komisi per Produk(Rp)"] !== void 0 ? i[v].commission += G(R["Total Komisi per Produk(Rp)"]) : V && !i[v].addedOrdersComm[V] && (i[v].addedOrdersComm[V] = !0, i[v].commission += G(R["Total Komisi per Pesanan(Rp)"]))
            });
            const D = 1 + Ne / 100;
            return Qe.forEach(R => {
                const O = R["Reporting starts"];
                if (!k(O)) return;
                const v = R["Campaign name"];
                if (!v) return;
                const V = Object.keys(ce).filter(le => ce[le].includes(v)),
                    W = G(R["Amount spent (IDR)"]) * D;
                V.forEach(le => {
                    i[le] || (i[le] = {
                        tag: le,
                        commission: 0,
                        orderIdsSet: new Set,
                        addedOrdersComm: {},
                        spend: 0
                    }), i[le].spend += W
                })
            }), Object.values(i).map(R => {
                const O = R.orderIdsSet ? R.orderIdsSet.size : 0;
                return {
                    tag: R.tag,
                    commission: R.commission,
                    spend: R.spend,
                    profit: R.commission - R.spend,
                    orders: O
                }
            }).filter(R => R.commission > 0 || R.spend > 0).sort((R, O) => O.commission - R.commission || O.orders - R.orders)
        }, [be, Qe, de, Et, ce, Ne]),
        Pe = I.useMemo(() => {
            const i = {};
            let u = 0;
            const o = new Set;
            return be.forEach(d => {
                const p = d["ID Pemesanan"];
                if (p && o.has(p)) return;
                p && o.add(p);
                const g = d["Status Pesanan"] || "Tidak Diketahui";
                i[g] || (i[g] = 0), i[g] += 1, u += 1
            }), {
                total: u,
                data: Object.entries(i).map(([d, p]) => ({
                    status: d,
                    count: p
                })).sort((d, p) => p.count - d.count)
            }
        }, [be]),
        Zr = I.useMemo(() => {
            const i = {};
            return j.forEach(u => {
                var v;
                const o = (v = u["Waktu Pemesanan"] || u["Waktu Klik"]) == null ? void 0 : v.split(" ")[0];
                if (!o || o === "--" || isNaN(new Date(o).getTime())) return;
                const d = o.substring(0, 7);
                i[d] || (i[d] = {
                    orderIds: new Set,
                    selesaiIds: new Set,
                    gagalIds: new Set,
                    tertundaIds: new Set,
                    lainIds: new Set,
                    estimasiKomisi: 0,
                    realKomisi: 0,
                    selesaiMinDate: null,
                    selesaiMaxDate: null,
                    processedEstOrder: new Set
                });
                const p = i[d],
                    g = u["ID Pemesanan"],
                    k = (u["Status Pesanan"] || "").toLowerCase(),
                    D = k.includes("selesai"),
                    R = k.includes("batal") || k.includes("gagal") || k.includes("dibatalkan"),
                    O = k.includes("tertunda") || k.includes("pending") || k.includes("proses") || k.includes("dikirim") || k.includes("dalam pengiriman");
                if (g && (p.orderIds.add(g), D ? p.selesaiIds.add(g) : R ? p.gagalIds.add(g) : O ? p.tertundaIds.add(g) : p.lainIds.add(g)), g && !p.processedEstOrder.has(g)) {
                    p.processedEstOrder.add(g);
                    const V = G(u["Total Komisi per Pesanan(Rp)"]);
                    p.estimasiKomisi += V > 0 ? V : G(u["Total Komisi per Produk(Rp)"])
                }
                if (D) {
                    p.realKomisi += G(u["Total Komisi per Produk(Rp)"]);
                    const V = (u["Waktu Terselesaikan"] || "").split(" ")[0];
                    V && V !== "--" && !isNaN(new Date(V).getTime()) && ((!p.selesaiMinDate || V < p.selesaiMinDate) && (p.selesaiMinDate = V), (!p.selesaiMaxDate || V > p.selesaiMaxDate) && (p.selesaiMaxDate = V))
                }
            }), Object.entries(i).map(([u, o]) => ({
                month: u,
                totalOrders: o.orderIds.size,
                selesai: o.selesaiIds.size,
                gagal: o.gagalIds.size,
                tertunda: o.tertundaIds.size,
                lain: o.lainIds.size,
                selesaiPct: o.orderIds.size > 0 ? o.selesaiIds.size / o.orderIds.size * 100 : 0,
                gagalPct: o.orderIds.size > 0 ? o.gagalIds.size / o.orderIds.size * 100 : 0,
                estimasiKomisi: o.estimasiKomisi,
                realKomisi: o.realKomisi,
                selesaiMinDate: o.selesaiMinDate,
                selesaiMaxDate: o.selesaiMaxDate
            })).sort((u, o) => o.month.localeCompare(u.month))
        }, [j]),
        vl = (i, u) => {
            u && Ke(o => {
                const d = o[i] || [];
                return d.includes(u) ? o : {
                    ...o,
                    [i]: [...d, u]
                }
            })
        },
        Ms = (i, u) => {
            Ke(o => {
                const d = o[i] || [];
                return {
                    ...o,
                    [i]: d.filter(p => p !== u)
                }
            })
        },
        Rt = (i, u, o) => `px-1.5 py-2 align-middle text-center transition-colors border-r border-b border-slate-100 ${o}`,
        Vn = I.useRef(null),
        [zs, br] = I.useState(!1),
        [Jr, gn] = I.useState(0),
        [vn, yn] = I.useState(0),
        wr = i => {
            br(!0), gn(i.pageX - Vn.current.offsetLeft), yn(Vn.current.scrollLeft)
        },
        jr = () => br(!1),
        kn = () => br(!1),
        ba = i => {
            if (!zs) return;
            i.preventDefault();
            const o = (i.pageX - Vn.current.offsetLeft - Jr) * 2;
            Vn.current.scrollLeft = vn - o
        };
    I.useEffect(() => {
        const i = o => {
                o.current && (o.current.scrollLeft = o.current.scrollWidth)
            },
            u = setTimeout(() => {
                i(Ur), i(Cn), i($n), i(Ns)
            }, 200);
        return () => clearTimeout(u)
    }, [ve, hn, Hn, Un]);
    const Is = I.useMemo(() => {
            if (!we) return null;
            let i = 0,
                u = 0,
                o = 0;
            const d = new Set,
                p = {},
                g = 1 + Ne / 100;
            _.forEach(S => {
                var F;
                const N = (F = S["Waktu Klik"]) == null ? void 0 : F.split(" ")[0];
                N && N !== "--" && N.startsWith(we) && (i += 1)
            }), be.forEach(S => {
                var F;
                const N = (F = S["Waktu Pemesanan"] || S["Waktu Klik"]) == null ? void 0 : F.split(" ")[0];
                if (N && N !== "--" && N.startsWith(we)) {
                    const ie = S["ID Pemesanan"];
                    ie && d.add(ie), S["Total Komisi per Produk(Rp)"] !== void 0 ? u += G(S["Total Komisi per Produk(Rp)"]) : ie && !p[ie] && (p[ie] = !0, u += G(S["Total Komisi per Pesanan(Rp)"]))
                }
            }), Qe.forEach(S => {
                const N = S["Reporting starts"];
                N && N !== "--" && N.startsWith(we) && (o += G(S["Amount spent (IDR)"]))
            });
            const k = o * g,
                D = u - k,
                R = k > 0 ? D / k * 100 : u > 0 ? 1 / 0 : 0,
                O = k > 0 ? u / k : 0,
                v = {};
            be.forEach(S => {
                var he;
                const N = (he = S["Waktu Pemesanan"] || S["Waktu Klik"]) == null ? void 0 : he.split(" ")[0];
                if (!N || N === "--" || !N.startsWith(we)) return;
                let F = (S.Tag_link1 || "").replace(/-+$/, "") || "<Tanpa Tag>";
                v[F] || (v[F] = {
                    tag: F,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {},
                    spend: 0,
                    clicks: 0
                });
                const ie = S["ID Pemesanan"];
                ie && v[F].orderIdsSet.add(ie), S["Total Komisi per Produk(Rp)"] !== void 0 ? v[F].commission += G(S["Total Komisi per Produk(Rp)"]) : ie && !v[F].addedOrdersComm[ie] && (v[F].addedOrdersComm[ie] = !0, v[F].commission += G(S["Total Komisi per Pesanan(Rp)"]))
            }), _.forEach(S => {
                var ie;
                const N = (ie = S["Waktu Klik"]) == null ? void 0 : ie.split(" ")[0];
                if (!N || N === "--" || !N.startsWith(we)) return;
                let F = (S.Tag_link || "").replace(/-+$/, "") || "<Tanpa Tag>";
                v[F] || (v[F] = {
                    tag: F,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {},
                    spend: 0,
                    clicks: 0
                }), v[F].clicks += 1
            }), Qe.forEach(S => {
                const N = S["Reporting starts"];
                if (!N || N === "--" || !N.startsWith(we)) return;
                const ie = Object.keys(ce).filter(oe => (ce[oe] || []).some(link => matchesMetaRow(link, S))),
                    he = G(S["Amount spent (IDR)"]) * g;
                ie.forEach(oe => {
                    v[oe] || (v[oe] = {
                        tag: oe,
                        commission: 0,
                        orderIdsSet: new Set,
                        addedOrdersComm: {},
                        spend: 0,
                        clicks: 0
                    }), v[oe].spend += he
                })
            });
            const V = Object.values(v).map(S => ({
                    ...S,
                    orders: S.orderIdsSet.size,
                    profit: S.commission - S.spend,
                    roi: S.spend > 0 ? (S.commission - S.spend) / S.spend * 100 : S.commission > 0 ? 1 / 0 : 0
                })).filter(S => S.commission > 0 || S.spend > 0 || S.clicks > 0).sort((S, N) => N.commission - S.commission),
                W = {};
            be.forEach(S => {
                var he;
                const N = (he = S["Waktu Pemesanan"] || S["Waktu Klik"]) == null ? void 0 : he.split(" ")[0];
                if (!N || N === "--" || !N.startsWith(we)) return;
                const F = S["Kategori L1"] || "Kategori Lainnya";
                W[F] || (W[F] = {
                    category: F,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                });
                const ie = S["ID Pemesanan"];
                ie && W[F].orderIdsSet.add(ie), S["Total Komisi per Produk(Rp)"] !== void 0 ? W[F].commission += G(S["Total Komisi per Produk(Rp)"]) : ie && !W[F].addedOrdersComm[ie] && (W[F].addedOrdersComm[ie] = !0, W[F].commission += G(S["Total Komisi per Pesanan(Rp)"]))
            });
            const le = Object.values(W).map(S => ({
                    ...S,
                    orders: S.orderIdsSet.size
                })).sort((S, N) => N.commission - S.commission).slice(0, 15),
                je = {};
            be.forEach(S => {
                var he;
                const N = (he = S["Waktu Pemesanan"] || S["Waktu Klik"]) == null ? void 0 : he.split(" ")[0];
                if (!N || N === "--" || !N.startsWith(we)) return;
                const F = S.Platform || "Tidak Diketahui";
                je[F] || (je[F] = {
                    platform: F,
                    commission: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                });
                const ie = S["ID Pemesanan"];
                ie && je[F].orderIdsSet.add(ie), S["Total Komisi per Produk(Rp)"] !== void 0 ? je[F].commission += G(S["Total Komisi per Produk(Rp)"]) : ie && !je[F].addedOrdersComm[ie] && (je[F].addedOrdersComm[ie] = !0, je[F].commission += G(S["Total Komisi per Pesanan(Rp)"]))
            });
            const Y = Object.values(je).map(S => ({
                    ...S,
                    orders: S.orderIdsSet.size
                })).sort((S, N) => N.commission - S.commission),
                Se = {};
            _.forEach(S => {
                var F;
                const N = (F = S["Waktu Klik"]) == null ? void 0 : F.split(" ")[0];
                !N || N === "--" || !N.startsWith(we) || (Se[N] || (Se[N] = {
                    date: N,
                    clicks: 0,
                    commission: 0,
                    spend: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                }), Se[N].clicks += 1)
            }), be.forEach(S => {
                var ie;
                const N = (ie = S["Waktu Pemesanan"] || S["Waktu Klik"]) == null ? void 0 : ie.split(" ")[0];
                if (!N || N === "--" || !N.startsWith(we)) return;
                Se[N] || (Se[N] = {
                    date: N,
                    clicks: 0,
                    commission: 0,
                    spend: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                });
                const F = S["ID Pemesanan"];
                F && Se[N].orderIdsSet.add(F), S["Total Komisi per Produk(Rp)"] !== void 0 ? Se[N].commission += G(S["Total Komisi per Produk(Rp)"]) : F && !Se[N].addedOrdersComm[F] && (Se[N].addedOrdersComm[F] = !0, Se[N].commission += G(S["Total Komisi per Pesanan(Rp)"]))
            }), Qe.forEach(S => {
                const N = S["Reporting starts"];
                !N || N === "--" || !N.startsWith(we) || (Se[N] || (Se[N] = {
                    date: N,
                    clicks: 0,
                    commission: 0,
                    spend: 0,
                    orderIdsSet: new Set,
                    addedOrdersComm: {}
                }), Se[N].spend += G(S["Amount spent (IDR)"]) * g)
            });
            const tt = Object.values(Se).map(S => ({
                date: S.date,
                clicks: S.clicks,
                orders: S.orderIdsSet.size,
                commission: S.commission,
                spend: S.spend,
                profit: S.commission - S.spend,
                roi: S.spend > 0 ? (S.commission - S.spend) / S.spend * 100 : S.commission > 0 ? 1 / 0 : 0
            })).sort((S, N) => new Date(S.date) - new Date(N.date));
            return {
                summary: {
                    clicks: i,
                    orders: d.size,
                    commission: u,
                    totalSpentWithPpn: k,
                    profit: D,
                    roi: R,
                    roas: O
                },
                tags: V,
                categories: le,
                platforms: Y,
                daily: tt
            }
        }, [_, be, Qe, we, ce, Ne]),
        Nr = async () => {
            Ar(!0);
            try {
                if (!Is) {
                    Ar(!1);
                    return
                }
                const i = N => new Promise((F, ie) => {
                    if (document.querySelector(`script[src="${N}"]`)) {
                        F();
                        return
                    }
                    const he = document.createElement("script");
                    he.src = N, he.onload = F, he.onerror = () => ie(new Error(`Gagal memuat: ${N}`)), document.head.appendChild(he)
                });
                await i("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"), await i("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");
                const {
                    jsPDF: u
                } = window.jspdf, o = new u({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                }), d = Is, p = d.summary, g = new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }), k = N => new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0
                }).format(N || 0), D = N => new Intl.NumberFormat("id-ID").format(N || 0), R = N => {
                    if (!N) return "-";
                    const F = new Date(N);
                    return isNaN(F) ? N : new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }).format(F)
                }, O = N => N === 1 / 0 ? "∞" : `${(N||0).toFixed(1)}%`, v = o.internal.pageSize.getWidth(), V = o.internal.pageSize.getHeight(), W = 14, le = 14, je = v - W - le;
                let Y = 14;
                const Se = (N, F) => {
                        o.setFillColor(241, 245, 249), o.rect(W, Y, je, 7, "F"), o.setFillColor(...F), o.rect(W, Y, 3, 7, "F"), o.setFontSize(6.5), o.setFont("helvetica", "bold"), o.setTextColor(71, 85, 105), o.text(N.toUpperCase(), W + 5, Y + 5), Y += 10, o.setTextColor(30, 41, 59)
                    },
                    tt = N => {
                        Y + N > V - 14 && (o.addPage(), Y = 14)
                    };
                if (o.setFillColor(49, 46, 129), o.rect(W, Y, je, 20, "F"), o.setTextColor(255, 255, 255), o.setFontSize(20), o.setFont("helvetica", "bold"), o.text("ADPROFIT", W + 5, Y + 8), o.setFontSize(6.5), o.setFont("helvetica", "normal"), o.text("PERFORMANCE REPORT DASHBOARD", W + 5, Y + 14), o.setFontSize(13), o.setFont("helvetica", "bold"), o.text(Pn(we), v - le - 4, Y + 8, {
                        align: "right"
                    }), o.setFontSize(6.5), o.setFont("helvetica", "normal"), o.text(`Digenerate: ${g}`, v - le - 4, Y + 14, {
                        align: "right"
                    }), Y += 26, o.setTextColor(30, 41, 59), ht.summary) {
                    Se("Ringkasan Eksekutif", [16, 185, 129]);
                    const N = (je - 6) / 4;
                    [{
                        label: "Profit Bersih",
                        value: k(p.profit),
                        vRGB: p.profit >= 0 ? [5, 150, 105] : [220, 38, 38],
                        bgRGB: [240, 253, 244]
                    }, {
                        label: "Total ROI",
                        value: O(p.roi),
                        vRGB: [124, 58, 237],
                        bgRGB: [250, 245, 255]
                    }, {
                        label: "ROAS",
                        value: `${(p.roas||0).toFixed(2)}x`,
                        vRGB: [217, 119, 6],
                        bgRGB: [255, 251, 235]
                    }, {
                        label: "Ad Spend + PPN",
                        value: k(p.totalSpentWithPpn),
                        vRGB: [67, 56, 202],
                        bgRGB: [238, 242, 255]
                    }].forEach((oe, dt) => {
                        const mt = W + dt * (N + 2);
                        o.setFillColor(...oe.bgRGB), o.roundedRect(mt, Y, N, 18, 2, 2, "F"), o.setFontSize(6), o.setFont("helvetica", "bold"), o.setTextColor(100, 116, 139), o.text(oe.label.toUpperCase(), mt + 4, Y + 5.5), o.setFontSize(10), o.setFont("helvetica", "bold"), o.setTextColor(...oe.vRGB);
                        const es = N - 8,
                            Qn = o.splitTextToSize(oe.value, es);
                        o.text(Qn[0], mt + 4, Y + 14)
                    }), Y += 22, o.setTextColor(30, 41, 59);
                    const ie = [{
                            label: "Komisi Shopee",
                            value: k(p.commission)
                        }, {
                            label: "Total Pesanan",
                            value: D(p.orders)
                        }, {
                            label: "Total Klik Shopee",
                            value: D(p.clicks)
                        }],
                        he = (je - 4) / 3;
                    ie.forEach((oe, dt) => {
                        const mt = W + dt * (he + 2);
                        o.setFillColor(248, 250, 252), o.roundedRect(mt, Y, he, 13, 2, 2, "F"), o.setFontSize(5.5), o.setFont("helvetica", "bold"), o.setTextColor(148, 163, 184), o.text(oe.label.toUpperCase(), mt + he / 2, Y + 4.5, {
                            align: "center"
                        }), o.setFontSize(8.5), o.setFont("helvetica", "bold"), o.setTextColor(51, 65, 85), o.text(oe.value, mt + he / 2, Y + 11, {
                            align: "center"
                        })
                    }), Y += 17, o.setTextColor(30, 41, 59), d.daily.length > 0 && (tt(20), Se("Rincian Performa Harian", [59, 130, 246]), o.autoTable({
                        startY: Y,
                        margin: {
                            left: W,
                            right: le
                        },
                        head: [
                            ["Tanggal", "Klik", "Pesanan", "Komisi (Rp)", "Ad Spend (Rp)", "Profit (Rp)", "ROI"]
                        ],
                        body: d.daily.map(oe => [R(oe.date), D(oe.clicks), D(oe.orders), k(oe.commission), k(oe.spend), k(oe.profit), O(oe.roi)]),
                        headStyles: {
                            fillColor: [241, 245, 249],
                            textColor: [71, 85, 105],
                            fontStyle: "bold",
                            fontSize: 6.5,
                            halign: "center"
                        },
                        bodyStyles: {
                            fontSize: 7.5,
                            textColor: [51, 65, 85]
                        },
                        columnStyles: {
                            0: {
                                halign: "left",
                                fontStyle: "bold"
                            },
                            1: {
                                halign: "center",
                                textColor: [59, 130, 246],
                                fontStyle: "bold"
                            },
                            2: {
                                halign: "center",
                                fontStyle: "bold"
                            },
                            3: {
                                halign: "right",
                                textColor: [5, 150, 105],
                                fontStyle: "bold"
                            },
                            4: {
                                halign: "right",
                                textColor: [79, 70, 229],
                                fontStyle: "bold"
                            },
                            5: {
                                halign: "right",
                                fontStyle: "bold"
                            },
                            6: {
                                halign: "right",
                                textColor: [148, 163, 184]
                            }
                        },
                        alternateRowStyles: {
                            fillColor: [248, 250, 252]
                        },
                        didParseCell: oe => {
                            if (oe.section === "body" && oe.column.index === 5) {
                                const dt = d.daily[oe.row.index];
                                dt && (oe.cell.styles.textColor = dt.profit >= 0 ? [5, 150, 105] : [220, 38, 38])
                            }
                        },
                        theme: "grid",
                        tableLineColor: [226, 232, 240],
                        tableLineWidth: .2
                    }), Y = o.lastAutoTable.finalY + 8)
                }
                if (ht.table && d.tags.length > 0 && (tt(30), Se(`Tag Performa — ${Pn(we)}`, [59, 130, 246]), o.autoTable({
                        startY: Y,
                        margin: {
                            left: W,
                            right: le
                        },
                        head: [
                            ["#", "Tag Link", "Klik", "Pesanan", "Komisi (Rp)", "Ad Spend (Rp)", "Profit (Rp)", "ROI"]
                        ],
                        body: d.tags.map((N, F) => [F + 1, N.tag, D(N.clicks), D(N.orders), k(N.commission), k(N.spend), k(N.profit), O(N.roi)]),
                        headStyles: {
                            fillColor: [241, 245, 249],
                            textColor: [71, 85, 105],
                            fontStyle: "bold",
                            fontSize: 6.5,
                            halign: "center"
                        },
                        bodyStyles: {
                            fontSize: 7.5,
                            textColor: [51, 65, 85]
                        },
                        columnStyles: {
                            0: {
                                halign: "center",
                                textColor: [148, 163, 184]
                            },
                            1: {
                                halign: "left"
                            },
                            2: {
                                halign: "center",
                                textColor: [59, 130, 246],
                                fontStyle: "bold"
                            },
                            3: {
                                halign: "center",
                                fontStyle: "bold"
                            },
                            4: {
                                halign: "right",
                                textColor: [5, 150, 105],
                                fontStyle: "bold"
                            },
                            5: {
                                halign: "right",
                                textColor: [79, 70, 229],
                                fontStyle: "bold"
                            },
                            6: {
                                halign: "right",
                                fontStyle: "bold"
                            },
                            7: {
                                halign: "right",
                                textColor: [148, 163, 184]
                            }
                        },
                        alternateRowStyles: {
                            fillColor: [248, 250, 252]
                        },
                        didParseCell: N => {
                            if (N.section === "body" && N.column.index === 6) {
                                const F = d.tags[N.row.index];
                                F && (N.cell.styles.textColor = F.profit >= 0 ? [5, 150, 105] : [220, 38, 38])
                            }
                        },
                        theme: "grid",
                        tableLineColor: [226, 232, 240],
                        tableLineWidth: .2
                    }), Y = o.lastAutoTable.finalY + 8), ht.analytics && (d.categories.length > 0 || d.platforms.length > 0)) {
                    tt(30), Se(`Analitik — ${Pn(we)}`, [245, 158, 11]);
                    const N = (je - 6) / 2,
                        F = Y;
                    d.categories.length > 0 && (o.setFontSize(6.5), o.setFont("helvetica", "bold"), o.setTextColor(245, 158, 11), o.text("KATEGORI TERLARIS (TOP 15)", W, F - 3), o.autoTable({
                        startY: F,
                        margin: {
                            left: W,
                            right: v - W - N
                        },
                        head: [
                            ["#", "Kategori", "Pesanan", "Komisi (Rp)"]
                        ],
                        body: d.categories.map((oe, dt) => [dt + 1, oe.category, D(oe.orders), k(oe.commission)]),
                        headStyles: {
                            fillColor: [241, 245, 249],
                            textColor: [71, 85, 105],
                            fontStyle: "bold",
                            fontSize: 6.5
                        },
                        bodyStyles: {
                            fontSize: 7,
                            textColor: [51, 65, 85]
                        },
                        columnStyles: {
                            0: {
                                halign: "center",
                                textColor: [148, 163, 184]
                            },
                            1: {
                                fontStyle: "bold"
                            },
                            2: {
                                halign: "center"
                            },
                            3: {
                                halign: "right",
                                textColor: [5, 150, 105],
                                fontStyle: "bold"
                            }
                        },
                        alternateRowStyles: {
                            fillColor: [248, 250, 252]
                        },
                        theme: "grid",
                        tableLineColor: [226, 232, 240],
                        tableLineWidth: .2
                    }));
                    const ie = d.categories.length > 0 ? o.lastAutoTable.finalY : F;
                    if (d.platforms.length > 0) {
                        const oe = W + N + 6;
                        o.setFontSize(6.5), o.setFont("helvetica", "bold"), o.setTextColor(249, 115, 22), o.text("SUMBER PLATFORM / SOSMED", oe, F - 3), o.autoTable({
                            startY: F,
                            margin: {
                                left: oe,
                                right: le
                            },
                            head: [
                                ["#", "Platform", "Pesanan", "Komisi (Rp)"]
                            ],
                            body: d.platforms.map((dt, mt) => [mt + 1, dt.platform, D(dt.orders), k(dt.commission)]),
                            headStyles: {
                                fillColor: [241, 245, 249],
                                textColor: [71, 85, 105],
                                fontStyle: "bold",
                                fontSize: 6.5
                            },
                            bodyStyles: {
                                fontSize: 7,
                                textColor: [51, 65, 85]
                            },
                            columnStyles: {
                                0: {
                                    halign: "center",
                                    textColor: [148, 163, 184]
                                },
                                1: {
                                    fontStyle: "bold"
                                },
                                2: {
                                    halign: "center"
                                },
                                3: {
                                    halign: "right",
                                    textColor: [5, 150, 105],
                                    fontStyle: "bold"
                                }
                            },
                            alternateRowStyles: {
                                fillColor: [248, 250, 252]
                            },
                            theme: "grid",
                            tableLineColor: [226, 232, 240],
                            tableLineWidth: .2
                        })
                    }
                    const he = d.platforms.length > 0 ? o.lastAutoTable.finalY : F;
                    Y = Math.max(ie, he) + 8, o.setTextColor(30, 41, 59)
                }
                const S = o.internal.getNumberOfPages();
                for (let N = 1; N <= S; N++) {
                    o.setPage(N);
                    const F = V - 9;
                    o.setDrawColor(226, 232, 240), o.line(W, F - 2, v - le, F - 2), o.setFontSize(6.5), o.setFont("helvetica", "normal"), o.setTextColor(148, 163, 184), o.text("AdProfit — Shopee Meta Tracker", W, F + 2), o.text(`Laporan ${Pn(we)} · ${g}  |  Hal. ${N}/${S}`, v - le, F + 2, {
                        align: "right"
                    })
                }
                o.save(`AdProfit_Report_${we}.pdf`)
            } catch (i) {
                console.error("Export PDF gagal:", i), alert("Gagal mengekspor PDF. Pastikan koneksi internet aktif untuk memuat library jsPDF dari CDN.")
            } finally {
                Ar(!1)
            }
        };
    return r.jsxs("div", {
        className: "min-h-screen app-bg font-sans text-slate-800 relative isolate",
        children: [r.jsxs("div", {
            className: "fx-layer print:hidden",
            "aria-hidden": "true",
            children: [r.jsx("div", {
                className: "fx-grid"
            }), r.jsx("div", {
                className: "fx-blob fx-blob-a"
            }), r.jsx("div", {
                className: "fx-blob fx-blob-b"
            }), r.jsx("div", {
                className: "fx-blob fx-blob-c"
            })]
        }), dr && r.jsxs("div", {
            className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white",
            children: [r.jsx("div", {
                className: "animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-5 shadow-lg"
            }), r.jsx("h2", {
                className: "text-2xl font-black tracking-tight",
                children: "Menyiapkan Laporan PDF..."
            }), r.jsx("p", {
                className: "text-white/80 mt-2 font-medium",
                children: "File PDF akan otomatis terdownload."
            })]
        }), r.jsxs("header", {
            className: "glass-header sticky top-0 z-40 flex flex-col print:hidden",
            children: [r.jsxs("div", {
                className: "px-6 py-4 flex items-center justify-between",
                children: [r.jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [r.jsx("div", {
                        className: "brand-mark p-2.5 rounded-xl",
                        children: r.jsx(fa, {
                            size: 22
                        })
                    }), r.jsxs("div", {
                        children: [r.jsx("h1", {
                            className: "brand-text text-xl font-bold leading-tight",
                            children: "AdProfit"
                        }), r.jsx("p", {
                            className: "text-[11px] text-slate-500 hidden sm:block tracking-wide",
                            children: "Dashboard Tracking & Integrasi Tag"
                        })]
                    })]
                }), r.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [r.jsxs("div", {
                        className: "hidden lg:flex items-center gap-1.5 mr-2 bg-white/70 border border-slate-200/80 rounded-xl p-1",
                        children: [r.jsxs("div", {
                            className: `flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${Q.length>0?"bg-blue-100 text-blue-700 shadow-sm":"text-slate-400 opacity-60 hover:bg-slate-100 cursor-help"}`,
                            title: Q.length > 0 ? `${Q.length} baris Meta Ads dimuat` : "Data Meta Ads Belum Diupload",
                            children: [r.jsx(or, {
                                size: 12
                            }), " ", r.jsx("span", {
                                children: "Meta"
                            }), " ", Q.length > 0 && r.jsx(al, {
                                size: 12,
                                className: "text-blue-600"
                            })]
                        }), r.jsx("div", {
                            className: "w-px h-4 bg-slate-300 mx-0.5"
                        }), r.jsxs("div", {
                            className: `flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${_.length>0?"bg-orange-100 text-orange-700 shadow-sm":"text-slate-400 opacity-60 hover:bg-slate-100 cursor-help"}`,
                            title: _.length > 0 ? `${_.length} klik Shopee dimuat` : "Data Shopee Clicks Belum Diupload",
                            children: [r.jsx(ol, {
                                size: 12
                            }), " ", r.jsx("span", {
                                children: "Clicks"
                            }), " ", _.length > 0 && r.jsx(al, {
                                size: 12,
                                className: "text-orange-600"
                            })]
                        }), r.jsx("div", {
                            className: "w-px h-4 bg-slate-300 mx-0.5"
                        }), r.jsxs("div", {
                            className: `flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${j.length>0?"bg-emerald-100 text-emerald-700 shadow-sm":"text-slate-400 opacity-60 hover:bg-slate-100 cursor-help"}`,
                            title: j.length > 0 ? `${j.length} pesanan dimuat` : "Laporan Pesanan Affiliate Belum Diupload",
                            children: [r.jsx(il, {
                                size: 12
                            }), " ", r.jsx("span", {
                                children: "Pesanan"
                            }), " ", j.length > 0 && r.jsx(al, {
                                size: 12,
                                className: "text-emerald-600"
                            })]
                        })]
                    }), r.jsxs("button", {
                        onClick: () => pr(!0),
                        className: "head-btn text-rose-600 border-rose-200 hover:text-white hover:bg-rose-500 hover:border-rose-500",
                        children: [r.jsx(jm, {
                            size: 16,
                            className: "fill-rose-200"
                        }), r.jsx("span", {
                            className: "hidden sm:inline",
                            children: "Bermanfaat?"
                        })]
                    }), r.jsxs("button", {
                        onClick: () => fr(!0),
                        className: "head-btn text-amber-700 border-amber-200 hover:text-white hover:bg-amber-500 hover:border-amber-500",
                        children: [r.jsx(Cu, {
                            size: 16
                        }), r.jsx("span", {
                            className: "hidden sm:inline",
                            children: "Traktir AdProfit"
                        })]
                    }), r.jsxs("button", {
                        onClick: () => hr(i => i === "dark" ? "light" : "dark"),
                        className: "head-btn theme-toggle text-indigo-600 border-indigo-200 hover:border-indigo-400",
                        title: Xt === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap",
                        "aria-label": "Ganti tema",
                        children: [Xt === "dark" ? r.jsx(Pm, {
                            size: 16
                        }) : r.jsx(Sm, {
                            size: 16
                        }), r.jsx("span", {
                            className: "hidden md:inline",
                            children: Xt === "dark" ? "Terang" : "Gelap"
                        })]
                    }), r.jsxs("button", {
                        onClick: Vr,
                        className: "head-btn text-slate-600 border-slate-200 hover:text-cyan-700 hover:border-cyan-300",
                        children: [r.jsx(ju, {
                            size: 18
                        }), r.jsx("span", {
                            className: "hidden sm:inline",
                            children: "Panduan"
                        })]
                    })]
                })]
            }), r.jsxs("div", {
                className: "px-6 flex gap-3 overflow-x-auto no-scrollbar py-3 border-t border-slate-200/60",
                children: [r.jsxs("button", {
                    onClick: () => De("import"),
                    className: `nav-pill ${ve==="import"?"nav-pill-active":""}`,
                    children: [r.jsx(Nm, {
                        size: 16
                    }), " Import Data"]
                }), r.jsxs("button", {
                    onClick: () => De("dashboard"),
                    className: `nav-pill ${ve==="dashboard"?"nav-pill-active":""}`,
                    children: [r.jsx(wu, {
                        size: 16
                    }), " Dashboard"]
                }), r.jsxs("button", {
                    onClick: () => De("cookie_hub"),
                    className: `nav-pill ${ve==="cookie_hub"?"nav-pill-active":""}`,
                    children: [r.jsx(CookieIcon, {
                        size: 16
                    }), " Cookie Planting Hub"]
                }), r.jsxs("button", {
                    onClick: () => De("table"),
                    className: `nav-pill ${ve==="table"?"nav-pill-active":""}`,
                    children: [r.jsx(pa, {
                        size: 16
                    }), " Tag Performa"]
                }), r.jsxs("button", {
                    onClick: () => De("analytics"),
                    className: `nav-pill ${ve==="analytics"?"nav-pill-active":""}`,
                    children: [r.jsx(bu, {
                        size: 16
                    }), " Analitik Lanjutan"]
                }), r.jsxs("button", {
                    onClick: () => De("monthly"),
                    className: `nav-pill ${ve==="monthly"?"nav-pill-active":""}`,
                    children: [r.jsx(Yi, {
                        size: 16
                    }), " Laporan Bulanan"]
                }), r.jsxs("button", {
                    onClick: () => De("export"),
                    className: `nav-pill ${ve==="export"?"nav-pill-active":""}`,
                    children: [r.jsx(qi, {
                        size: 16
                    }), " Export PDF"]
                })]
            })]
        }), r.jsxs("main", {
            className: "max-w-7xl mx-auto px-6 mt-6 space-y-6 pb-12 print:hidden",
            children: [ve === "import" && r.jsxs("div", {
                className: "animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6",
                children: [r.jsxs("div", {
                    id: "step-upload",
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 relative",
                    children: [r.jsxs("h2", {
                        className: "text-lg font-bold text-slate-800 mb-4 flex items-center gap-2",
                        children: [r.jsx(Su, {
                            className: "text-blue-500"
                        }), " Upload Data (CSV / Excel)"]
                    }), r.jsxs("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                        children: [r.jsxs("div", {
                            className: `relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${Q.length>0?"border-blue-500 bg-blue-50":"border-slate-300 hover:bg-slate-50"}`,
                            children: [Q.length > 0 && r.jsx("button", {
                                onClick: () => pe([]),
                                className: "absolute top-2 right-2 text-slate-400 hover:text-red-500 focus:outline-none",
                                children: r.jsx(It, {
                                    size: 16
                                })
                            }), r.jsxs("label", {
                                className: "cursor-pointer flex flex-col items-center justify-center w-full h-full",
                                children: [r.jsx(or, {
                                    className: Q.length > 0 ? "text-blue-600 mb-2" : "text-slate-400 mb-2",
                                    size: 28
                                }), r.jsx("span", {
                                    className: "text-sm font-semibold text-slate-700",
                                    children: "1. Data Meta Ads"
                                }), r.jsxs("span", {
                                    className: "text-xs text-slate-500 text-center mt-1",
                                    children: [Q.length > 0 ? `${Q.length} baris termuat` : "Gunakan Breakdown By Day di FB!", r.jsx("br", {}), r.jsx("span", {
                                        className: "text-[10px] text-blue-500 font-medium",
                                        children: "+ Pilih multi-file (.csv atau .xlsx)"
                                    })]
                                }), r.jsx("input", {
                                    type: "file",
                                    multiple: !0,
                                    accept: ".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                    className: "hidden",
                                    onClick: i => {
                                        i.target.value = null
                                    },
                                    onChange: i => Wn(i, pe, u => (u["Campaign name"] || u["Ad set name"] || u["Ad name"]) && G(u["Amount spent (IDR)"]) > 0, "meta")
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: `relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${_.length>0?"border-[#ee4d2d] bg-orange-50":"border-slate-300 hover:bg-slate-50"}`,
                            children: [_.length > 0 && r.jsx("button", {
                                onClick: () => se([]),
                                className: "absolute top-2 right-2 text-slate-400 hover:text-red-500 focus:outline-none",
                                children: r.jsx(It, {
                                    size: 16
                                })
                            }), r.jsxs("label", {
                                className: "cursor-pointer flex flex-col items-center justify-center w-full h-full",
                                children: [r.jsx(ol, {
                                    className: _.length > 0 ? "text-[#ee4d2d] mb-2" : "text-slate-400 mb-2",
                                    size: 28
                                }), r.jsx("span", {
                                    className: "text-sm font-semibold text-slate-700",
                                    children: "2. Shopee Clicks"
                                }), r.jsxs("span", {
                                    className: "text-xs text-slate-500 text-center mt-1",
                                    children: [_.length > 0 ? `${_.length} klik termuat` : "Upload WebsiteClickReport", r.jsx("br", {}), r.jsx("span", {
                                        className: "text-[10px] text-[#ee4d2d] font-medium",
                                        children: "+ Pilih multi-file (.csv atau .xlsx)"
                                    })]
                                }), r.jsx("input", {
                                    type: "file",
                                    multiple: !0,
                                    accept: ".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                    className: "hidden",
                                    onClick: i => {
                                        i.target.value = null
                                    },
                                    onChange: i => Wn(i, se, u => u["Klik ID"] || u["Waktu Klik"], "click")
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: `relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${j.length>0?"border-[#ee4d2d] bg-orange-50":"border-slate-300 hover:bg-slate-50"}`,
                            children: [j.length > 0 && r.jsx("button", {
                                onClick: () => Re([]),
                                className: "absolute top-2 right-2 text-slate-400 hover:text-red-500 focus:outline-none",
                                children: r.jsx(It, {
                                    size: 16
                                })
                            }), r.jsxs("label", {
                                className: "cursor-pointer flex flex-col items-center justify-center w-full h-full",
                                children: [r.jsx(il, {
                                    className: j.length > 0 ? "text-[#ee4d2d] mb-2" : "text-slate-400 mb-2",
                                    size: 28
                                }), r.jsx("span", {
                                    className: "text-sm font-semibold text-slate-700",
                                    children: "3. Laporan Pesanan Affiliate"
                                }), r.jsxs("span", {
                                    className: "text-xs text-slate-500 text-center mt-1",
                                    children: [j.length > 0 ? `${j.length} pesanan termuat` : "Upload AffiliateCommissionReport", r.jsx("br", {}), r.jsx("span", {
                                        className: "text-[10px] text-[#ee4d2d] font-medium",
                                        children: "+ Pilih multi-file (.csv atau .xlsx)"
                                    })]
                                }), r.jsx("input", {
                                    type: "file",
                                    multiple: !0,
                                    accept: ".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                    className: "hidden",
                                    onClick: i => {
                                        i.target.value = null
                                    },
                                    onChange: i => Wn(i, Re, u => u["ID Pemesanan"], "commission")
                                })]
                            })]
                        })]
                    }), Bn.length > 0 && r.jsxs("div", {
                        className: "mt-4 border border-blue-100 rounded-xl overflow-hidden",
                        children: [r.jsxs("div", {
                            className: "px-4 py-2.5 bg-blue-50 text-xs font-bold text-blue-800 flex items-center gap-2",
                            children: [r.jsx(or, {
                                size: 14
                            }), " File Meta Ads Termuat (", Bn.length, " file) ", r.jsx("span", {
                                className: "font-medium text-blue-500",
                                children: "— spend belum termasuk PPN"
                            })]
                        }), r.jsx("div", {
                            className: "overflow-x-auto",
                            children: r.jsxs("table", {
                                className: "w-full text-xs text-left",
                                children: [r.jsx("thead", {
                                    className: "text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50",
                                    children: r.jsxs("tr", {
                                        children: [r.jsx("th", {
                                            className: "px-4 py-2",
                                            children: "File"
                                        }), r.jsx("th", {
                                            className: "px-4 py-2 whitespace-nowrap",
                                            children: "Tanggal"
                                        }), r.jsx("th", {
                                            className: "px-4 py-2 text-right",
                                            children: "Baris"
                                        }), r.jsx("th", {
                                            className: "px-4 py-2 text-right whitespace-nowrap",
                                            children: "Spend di File"
                                        }), r.jsx("th", {
                                            className: "px-4 py-2 text-right whitespace-nowrap",
                                            children: "Spend Dihitung"
                                        }), r.jsx("th", {
                                            className: "px-2 py-2"
                                        })]
                                    })
                                }), r.jsx("tbody", {
                                    children: Bn.map(i => {
                                        const u = Math.round(i.spend) !== Math.round(i.countedSpend);
                                        return r.jsxs("tr", {
                                            className: "border-t border-slate-100",
                                            children: [r.jsx("td", {
                                                className: "px-4 py-2 font-semibold text-slate-700 break-all",
                                                children: i.file || "(tanpa nama file)"
                                            }), r.jsx("td", {
                                                className: "px-4 py-2 text-slate-500 whitespace-nowrap",
                                                children: i.minDate ? i.minDate === i.maxDate ? i.minDate : `${i.minDate} s/d ${i.maxDate}` : "-"
                                            }), r.jsx("td", {
                                                className: "px-4 py-2 text-right text-slate-600",
                                                children: ke(i.rows)
                                            }), r.jsx("td", {
                                                className: "px-4 py-2 text-right font-bold text-slate-700 whitespace-nowrap",
                                                children: J(i.spend)
                                            }), r.jsx("td", {
                                                className: `px-4 py-2 text-right font-bold whitespace-nowrap ${u?"text-amber-600":"text-indigo-600"}`,
                                                title: u ? "Sebagian baris tidak dihitung: duplikat, atau di luar rentang tanggal klik Shopee (Sinkronisasi Tanggal)." : "",
                                                children: J(i.countedSpend)
                                            }), r.jsx("td", {
                                                className: "px-2 py-2 text-right",
                                                children: r.jsx("button", {
                                                    onClick: () => pe(o => o.filter(d => (d.__file || "") !== i.file)),
                                                    className: "text-slate-400 hover:text-red-500 focus:outline-none",
                                                    title: "Hapus file ini",
                                                    children: r.jsx(It, {
                                                        size: 14
                                                    })
                                                })
                                            })]
                                        }, i.file)
                                    })
                                }), r.jsx("tfoot", {
                                    children: r.jsxs("tr", {
                                        className: "border-t-2 border-blue-100 bg-blue-50/50 font-bold",
                                        children: [r.jsx("td", {
                                            className: "px-4 py-2 text-slate-700",
                                            colSpan: 2,
                                            children: "Total"
                                        }), r.jsx("td", {
                                            className: "px-4 py-2 text-right text-slate-700",
                                            children: ke(Q.length)
                                        }), r.jsx("td", {
                                            className: "px-4 py-2 text-right text-slate-700 whitespace-nowrap",
                                            children: J(Bn.reduce((i, u) => i + u.spend, 0))
                                        }), r.jsx("td", {
                                            className: "px-4 py-2 text-right text-indigo-600 whitespace-nowrap",
                                            children: J(Bn.reduce((i, u) => i + u.countedSpend, 0))
                                        }), r.jsx("td", {})]
                                    })
                                })]
                            })
                        })]
                    })]
                }), r.jsxs("div", {
                    className: "bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm mt-2",
                    children: [r.jsxs("h3", {
                        className: "text-base font-bold text-indigo-900 mb-5 flex items-center gap-2",
                        children: [r.jsx(Zi, {
                            size: 20,
                            className: "text-indigo-600"
                        }), " Panduan Cara Download & Upload File (Untuk Pemula)"]
                    }), r.jsxs("div", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-5",
                        children: [r.jsxs("div", {
                            className: "bg-white rounded-xl p-5 border border-indigo-100 shadow-sm flex flex-col hover:border-indigo-300 transition-colors",
                            children: [r.jsxs("div", {
                                className: "flex items-center gap-2.5 text-blue-700 font-bold text-sm sm:text-base border-b border-slate-100 pb-3 mb-3",
                                children: [r.jsx("div", {
                                    className: "bg-blue-50 p-1.5 rounded-lg",
                                    children: r.jsx(or, {
                                        size: 18
                                    })
                                }), " 1. File Meta Ads"]
                            }), r.jsxs("div", {
                                className: "text-[13px] text-slate-600 space-y-3",
                                children: [r.jsx("p", {
                                    className: "font-semibold text-slate-800",
                                    children: "Cara Download dari Facebook:"
                                }), r.jsxs("ol", {
                                    className: "list-decimal pl-4 space-y-2",
                                    children: [r.jsxs("li", {
                                        children: ["Buka halaman ", r.jsx("b", {
                                            children: "Ads Manager"
                                        }), " Facebook Anda."]
                                    }), r.jsx("li", {
                                        children: "Pilih rentang tanggal iklan di pojok kanan atas."
                                    }), r.jsxs("li", {
                                        children: ["Klik tombol ", r.jsx("b", {
                                            children: "Breakdown"
                                        }), " ➔ Pilih ", r.jsx("b", {
                                            children: "By Time"
                                        }), " ➔ Klik ", r.jsx("b", {
                                            children: "Day"
                                        }), ". ", r.jsx("i", {
                                            className: "text-rose-600 font-medium",
                                            children: "Ini wajib agar data akurat harian!"
                                        })]
                                    }), r.jsxs("li", {
                                        children: ["Klik ikon ", r.jsx("i", {
                                            children: "Export"
                                        }), " ➔ Pilih ", r.jsx("b", {
                                            children: "Export table data"
                                        }), " ➔ Format ", r.jsx("b", {
                                            children: ".CSV"
                                        }), " / ", r.jsx("b", {
                                            children: ".XLSX"
                                        }), "."]
                                    })]
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "bg-white rounded-xl p-5 border border-indigo-100 shadow-sm flex flex-col hover:border-indigo-300 transition-colors",
                            children: [r.jsxs("div", {
                                className: "flex items-center gap-2.5 text-orange-700 font-bold text-sm sm:text-base border-b border-slate-100 pb-3 mb-3",
                                children: [r.jsx("div", {
                                    className: "bg-orange-50 p-1.5 rounded-lg",
                                    children: r.jsx(ol, {
                                        size: 18
                                    })
                                }), " 2. File Shopee Clicks"]
                            }), r.jsxs("div", {
                                className: "text-[13px] text-slate-600 space-y-3",
                                children: [r.jsx("p", {
                                    className: "font-semibold text-slate-800",
                                    children: "Cara Download dari Shopee:"
                                }), r.jsxs("ol", {
                                    className: "list-decimal pl-4 space-y-2",
                                    children: [r.jsxs("li", {
                                        children: ["Buka ", r.jsx("b", {
                                            children: "Dashboard Shopee Affiliate"
                                        }), "."]
                                    }), r.jsxs("li", {
                                        children: ["Pergi ke menu ", r.jsx("b", {
                                            children: "Laporan"
                                        }), " ➔ ", r.jsx("b", {
                                            children: "Laporan Klik"
                                        }), "."]
                                    }), r.jsx("li", {
                                        children: "Pilih rentang waktu yang diinginkan."
                                    }), r.jsxs("li", {
                                        children: ["Klik ", r.jsx("b", {
                                            children: "Export"
                                        }), ". File bernama ", r.jsx("code", {
                                            className: "bg-slate-100 px-1 py-0.5 rounded text-orange-600",
                                            children: "WebsiteClickReport"
                                        }), "."]
                                    })]
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "bg-white rounded-xl p-5 border border-indigo-100 shadow-sm flex flex-col hover:border-indigo-300 transition-colors",
                            children: [r.jsxs("div", {
                                className: "flex items-center gap-2.5 text-emerald-700 font-bold text-sm sm:text-base border-b border-slate-100 pb-3 mb-3",
                                children: [r.jsx("div", {
                                    className: "bg-emerald-50 p-1.5 rounded-lg",
                                    children: r.jsx(il, {
                                        size: 18
                                    })
                                }), " 3. Laporan Pesanan Affiliate"]
                            }), r.jsxs("div", {
                                className: "text-[13px] text-slate-600 space-y-3",
                                children: [r.jsx("p", {
                                    className: "font-semibold text-slate-800",
                                    children: "Cara Download dari Shopee:"
                                }), r.jsxs("ol", {
                                    className: "list-decimal pl-4 space-y-2",
                                    children: [r.jsxs("li", {
                                        children: ["Buka ", r.jsx("b", {
                                            children: "Dashboard Shopee Affiliate"
                                        }), "."]
                                    }), r.jsxs("li", {
                                        children: ["Pergi ke menu ", r.jsx("b", {
                                            children: "Laporan"
                                        }), " ➔ ", r.jsx("b", {
                                            children: "Laporan Pesanan Affiliate"
                                        }), "."]
                                    }), r.jsxs("li", {
                                        children: ["Pilih filter berdasarkan ", r.jsx("b", {
                                            children: "Waktu Pemesanan"
                                        }), "."]
                                    }), r.jsx("li", {
                                        children: "Pilih rentang waktu yang diinginkan."
                                    }), r.jsxs("li", {
                                        children: [r.jsx("i", {
                                            className: "text-rose-600 font-medium",
                                            children: "Pastikan bahasa Shopee sudah diatur ke Bahasa Indonesia"
                                        }), " sebelum export."]
                                    }), r.jsxs("li", {
                                        children: ["Klik ", r.jsx("b", {
                                            children: "Export"
                                        }), ". File bernama ", r.jsx("code", {
                                            className: "bg-slate-100 px-1 py-0.5 rounded text-emerald-600",
                                            children: "AffiliateCommissionReport"
                                        }), "."]
                                    })]
                                })]
                            })]
                        })]
                    })]
                }), Ht && r.jsxs("div", {
                    className: "bg-white p-5 rounded-2xl card-fx border border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4",
                    children: [r.jsxs("div", {
                        className: "flex items-start gap-3",
                        children: [r.jsx("div", {
                            className: "bg-indigo-50 p-2 rounded-lg text-indigo-600 mt-1",
                            children: r.jsx(ma, {
                                size: 20
                            })
                        }), r.jsxs("div", {
                            children: [r.jsx("h3", {
                                className: "font-semibold text-slate-800 text-sm",
                                children: "Rentang Tanggal Data Klik"
                            }), r.jsxs("p", {
                                className: "text-xs text-slate-500 mt-0.5",
                                children: [r.jsx("span", {
                                    className: "font-medium text-indigo-700",
                                    children: qt(Ht.min)
                                }), " hingga ", r.jsx("span", {
                                    className: "font-medium text-indigo-700",
                                    children: qt(Ht.max)
                                })]
                            })]
                        })]
                    }), r.jsxs("button", {
                        onClick: () => Le(!Me),
                        className: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${Me?"bg-indigo-50 border-indigo-200 text-indigo-700":"bg-slate-50 border-slate-200 text-slate-600"}`,
                        children: [Me ? r.jsx(Em, {
                            className: "text-indigo-600",
                            size: 20
                        }) : r.jsx(Dm, {
                            className: "text-slate-400",
                            size: 20
                        }), "Singkronkan Data"]
                    })]
                })]
            }), ve === "dashboard" && r.jsx("div", {
                className: "animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6",
                children: r.jsxs("div", {
                    id: "step-summary",
                    className: `bg-white p-4 sm:p-6 rounded-2xl card-fx border border-slate-200/70 flex flex-col gap-4 transition-all duration-300 ${_.length===0&&j.length===0&&Qe.length===0?"opacity-60 grayscale-[40%]":""}`,
                    children: [r.jsxs("div", {
                        className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4",
                        children: [r.jsxs("div", {
                            className: "flex flex-wrap items-center gap-2 shrink-0",
                            children: [r.jsx(cr, {
                                className: "text-indigo-600",
                                size: 24
                            }), r.jsx("h2", {
                                className: "text-lg font-bold text-slate-800",
                                children: "Ringkasan Performa Keseluruhan"
                            }), r.jsxs("button", {
                                type: "button",
                                onClick: () => {
                                    const el = document.getElementById("dashboard-breakdown-section");
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                },
                                className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer shadow-2xs ml-1 sm:ml-2",
                                title: "Langsung ke Menu Cek Performa per Iklan / Placement",
                                children: [
                                    r.jsx(Pu, { size: 13, className: "text-indigo-600" }),
                                    "Cek Performa per Iklan ↓"
                                ]
                            })]
                        }), r.jsxs("div", {
                            className: "flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-20 w-full lg:w-auto",
                            children: [r.jsxs("div", {
                                className: "flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3",
                                children: [r.jsx("span", {
                                    className: "text-sm text-slate-500 font-medium whitespace-nowrap",
                                    children: "PPN Meta:"
                                }), r.jsxs("div", {
                                    className: "flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 w-20 shadow-sm transition-all",
                                    children: [r.jsx("input", {
                                        type: "number",
                                        className: "w-full bg-transparent text-sm text-slate-700 outline-none text-center font-bold",
                                        value: Ne,
                                        onChange: i => ct(Number(i.target.value) || 0)
                                    }), r.jsx("span", {
                                        className: "text-sm text-slate-500 font-bold",
                                        children: "%"
                                    })]
                                })]
                            }), r.jsxs("div", {
                                className: "flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto flex-wrap",
                                children: [r.jsx("span", {
                                    className: "text-sm text-slate-500 font-medium hidden sm:block whitespace-nowrap",
                                    children: "Filter:"
                                }), r.jsx(Wt, {
                                    size: "md",
                                    className: "w-full sm:w-auto sm:min-w-[150px]",
                                    searchable: !1,
                                    value: fe,
                                    onChange: i => {
                                        ze(i), i === "monthly" && an.length > 0 && ye(an[0]), i === "daily" && Et.length > 0 && ye(Et[0])
                                    },
                                    options: [{
                                        value: "all",
                                        label: "Semua Waktu"
                                    }, ...an.length > 0 ? [{
                                        value: "monthly",
                                        label: "Bulanan"
                                    }] : [], ...Et.length > 0 ? [{
                                        value: "daily",
                                        label: "Harian"
                                    }] : [], {
                                        value: "custom",
                                        label: "Custom Rentang"
                                    }]
                                }), fe === "monthly" && r.jsx(Wt, {
                                    size: "md",
                                    className: "w-full sm:w-auto sm:min-w-[160px]",
                                    placeholder: "Pilih bulan",
                                    searchPlaceholder: "Cari bulan...",
                                    value: Ye,
                                    onChange: ye,
                                    options: an.map(i => ({
                                        value: i,
                                        label: Pn(i)
                                    }))
                                }), fe === "daily" && r.jsx(Wt, {
                                    size: "md",
                                    className: "w-full sm:w-auto sm:min-w-[160px]",
                                    placeholder: "Pilih tanggal",
                                    searchPlaceholder: "Cari tanggal...",
                                    value: Ye,
                                    onChange: ye,
                                    options: Et.map(i => ({
                                        value: i,
                                        label: qt(new Date(i))
                                    }))
                                }), fe === "custom" && r.jsxs("div", {
                                    className: "flex items-center gap-2 w-full sm:w-auto",
                                    children: [r.jsx("input", {
                                        type: "date",
                                        className: "w-full sm:w-auto text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 bg-white shadow-sm text-slate-700",
                                        value: ue.start,
                                        onChange: i => st({
                                            ...ue,
                                            start: i.target.value
                                        })
                                    }), r.jsx("span", {
                                        className: "text-slate-400 font-medium",
                                        children: "-"
                                    }), r.jsx("input", {
                                        type: "date",
                                        className: "w-full sm:w-auto text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 bg-white shadow-sm text-slate-700",
                                        value: ue.end,
                                        onChange: i => st({
                                            ...ue,
                                            end: i.target.value
                                        })
                                    })]
                                }), gl.length > 0 && r.jsx(Wt, {
                                    size: "md",
                                    className: "w-full sm:w-auto sm:min-w-[160px]",
                                    placeholder: "Pilih platform",
                                    searchPlaceholder: "Cari platform...",
                                    value: Xe,
                                    onChange: $e,
                                    options: [{
                                        value: "all",
                                        label: "Semua Platform"
                                    }, ...gl.map(i => ({
                                        value: i,
                                        label: i
                                    }))]
                                })]
                            })]
                        })]
                    }), r.jsxs("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2",
                        children: [r.jsxs("div", {
                            className: "bg-orange-50/50 border border-orange-100 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-orange-50 transition-colors",
                            children: [r.jsx("div", {
                                className: "bg-orange-100 p-3 rounded-lg text-[#ee4d2d] shrink-0",
                                children: r.jsx(ol, {
                                    size: 24
                                })
                            }), r.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [r.jsx("p", {
                                    className: "text-xs sm:text-sm font-medium text-slate-500 truncate",
                                    children: "Total Shopee Clicks"
                                }), r.jsx("h3", {
                                    className: "text-lg sm:text-xl xl:text-2xl font-bold text-slate-800 truncate",
                                    title: ke(Ze.clicks),
                                    children: ke(Ze.clicks)
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "bg-blue-50/50 border border-blue-100 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-blue-50 transition-colors",
                            children: [r.jsx("div", {
                                className: "bg-blue-100 p-3 rounded-lg text-blue-600 shrink-0",
                                children: r.jsx(fa, {
                                    size: 24
                                })
                            }), r.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [r.jsx("p", {
                                    className: "text-xs sm:text-sm font-medium text-slate-500 truncate",
                                    children: "Total Pesanan"
                                }), r.jsx("h3", {
                                    className: "text-lg sm:text-xl xl:text-2xl font-bold text-slate-800 truncate",
                                    title: ke(Ze.orders),
                                    children: ke(Ze.orders)
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-emerald-50 transition-colors",
                            children: [r.jsx("div", {
                                className: "bg-emerald-100 p-3 rounded-lg text-emerald-600 shrink-0",
                                children: r.jsx(il, {
                                    size: 24
                                })
                            }), r.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [r.jsx("p", {
                                    className: "text-xs sm:text-sm font-medium text-slate-500 truncate",
                                    children: "Total Komisi"
                                }), r.jsx("h3", {
                                    className: "text-lg sm:text-xl xl:text-2xl font-bold text-emerald-600 truncate",
                                    title: J(Ze.commission),
                                    children: J(Ze.commission)
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-indigo-50 transition-colors",
                            children: [r.jsx("div", {
                                className: "bg-indigo-100 p-3 rounded-lg text-indigo-600 shrink-0",
                                children: r.jsx(or, {
                                    size: 24
                                })
                            }), r.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [r.jsxs("p", {
                                    className: "text-xs sm:text-sm font-medium text-slate-500 truncate",
                                    children: ["Ad Spend (+PPN ", Ne, "%)"]
                                }), r.jsx("h3", {
                                    className: "text-lg sm:text-xl xl:text-2xl font-bold text-indigo-600 truncate",
                                    title: J(Ze.totalSpentWithPpn),
                                    children: J(Ze.totalSpentWithPpn)
                                })]
                            })]
                        })]
                    }), r.jsxs("div", {
                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-2",
                        children: [r.jsxs("div", {
                            className: `border rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-colors ${Ze.profit>=0?"bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50":"bg-rose-50 border-rose-200 hover:bg-rose-100/50"}`,
                            children: [r.jsx("div", {
                                className: `p-3 rounded-lg shrink-0 ${Ze.profit>=0?"bg-emerald-200/50 text-emerald-700":"bg-rose-200/50 text-rose-700"}`,
                                children: r.jsx(ha, {
                                    size: 24
                                })
                            }), r.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [r.jsx("p", {
                                    className: "text-xs sm:text-sm font-medium text-slate-500 truncate",
                                    children: "Profit Bersih"
                                }), r.jsxs("h3", {
                                    className: `text-lg sm:text-xl xl:text-2xl font-bold truncate ${Ze.profit>=0?"text-emerald-700":"text-rose-700"}`,
                                    title: `${Ze.profit<0?"- ":""}${J(Math.abs(Ze.profit))}`,
                                    children: [Ze.profit < 0 && "- ", J(Math.abs(Ze.profit))]
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "bg-purple-50/50 border border-purple-200 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-purple-50 transition-colors",
                            children: [r.jsx("div", {
                                className: "bg-purple-100 p-3 rounded-lg text-purple-600 shrink-0",
                                children: r.jsx(Tm, {
                                    size: 24
                                })
                            }), r.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [r.jsx("p", {
                                    className: "text-xs sm:text-sm font-medium text-slate-500 truncate",
                                    children: "ROI"
                                }), r.jsx("h3", {
                                    className: "text-lg sm:text-xl xl:text-2xl font-bold text-purple-700 truncate",
                                    title: Ze.roi === 1 / 0 ? "∞" : `${(typeof Ze.roi === "number" && !isNaN(Ze.roi) ? Ze.roi : 0).toFixed(2)}%`,
                                    children: Ze.roi === 1 / 0 ? "∞" : `${(typeof Ze.roi === "number" && !isNaN(Ze.roi) ? Ze.roi : 0).toFixed(2)}%`
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "bg-amber-50/50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-amber-50 transition-colors",
                            children: [r.jsx("div", {
                                className: "bg-amber-100 p-3 rounded-lg text-amber-600 shrink-0",
                                children: r.jsx(cr, {
                                    size: 24
                                })
                            }), r.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [r.jsx("p", {
                                    className: "text-xs sm:text-sm font-medium text-slate-500 truncate",
                                    children: "ROAS"
                                }), r.jsxs("h3", {
                                    className: "text-lg sm:text-xl xl:text-2xl font-bold text-amber-700 truncate",
                                    title: `${(typeof Ze.roas === "number" && !isNaN(Ze.roas) ? Ze.roas : 0).toFixed(2)}x`,
                                    children: [(typeof Ze.roas === "number" && !isNaN(Ze.roas) ? Ze.roas : 0).toFixed(2), "x"]
                                })]
                            })]
                        })]
                    }), fe !== "daily" && hn.length > 0 && r.jsxs("div", {
                        id: "step-trend-chart",
                        className: "mt-4 border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-300",
                        children: [r.jsxs("div", {
                            className: "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4",
                            children: [r.jsxs("h3", {
                                className: "text-sm font-bold text-slate-800 flex items-center gap-2",
                                children: [r.jsx(bu, {
                                    size: 18,
                                    className: "text-indigo-500"
                                }), " Grafik Tren Komisi vs Ad Spend (Harian)"]
                            }), r.jsxs("div", {
                                className: "flex flex-wrap items-center gap-4 text-[11px] font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100",
                                children: [r.jsxs("span", {
                                    className: "flex items-center gap-1.5",
                                    children: [r.jsx("span", {
                                        className: "w-3 h-3 rounded-sm bg-emerald-400"
                                    }), " Komisi Shopee"]
                                }), r.jsxs("span", {
                                    className: "flex items-center gap-1.5",
                                    children: [r.jsx("span", {
                                        className: "w-3 h-3 rounded-sm bg-indigo-400"
                                    }), " Ad Spend (+PPN)"]
                                }), r.jsxs("span", {
                                    className: "flex items-center gap-1.5",
                                    children: [r.jsx("span", {
                                        className: "w-3 h-3 rounded-sm bg-rose-400"
                                    }), " Boncos"]
                                })]
                            })]
                        }), r.jsx("div", {
                            ref: Ur,
                            className: "flex items-end gap-2.5 h-56 overflow-x-auto pb-4 pt-8 px-10 smooth-scroll",
                            children: hn.map((i, u) => {
                                const o = i.commission - i.spend;
                                return r.jsxs("div", {
                                    className: "flex flex-col items-center gap-2 flex-shrink-0 group relative w-14 hover:-translate-y-1 transition-transform hover:z-50",
                                    children: [r.jsxs("div", {
                                        className: "w-full h-36 bg-slate-50/50 rounded flex items-end justify-center gap-[2px] hover:bg-slate-100 transition-colors relative px-0.5 border-b border-slate-200",
                                        children: [r.jsx("div", {
                                            className: "w-1/2 bg-emerald-400 rounded-t transition-all shadow-sm",
                                            style: {
                                                height: `${i.commission/Ps*100}%`,
                                                minHeight: "4px"
                                            }
                                        }), r.jsx("div", {
                                            className: "w-1/2 bg-indigo-400 rounded-t transition-all shadow-sm",
                                            style: {
                                                height: `${i.spend/Ps*100}%`,
                                                minHeight: "4px"
                                            }
                                        }), r.jsxs("div", {
                                            className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-800/95 backdrop-blur-sm text-white text-[9px] py-1.5 px-2.5 rounded whitespace-nowrap z-[100] shadow-xl border border-slate-700 pointer-events-none",
                                            children: [r.jsx("span", {
                                                className: "font-bold text-[10px] mb-1 border-b border-slate-600 pb-0.5 text-center",
                                                children: qt(new Date(i.date))
                                            }), r.jsxs("div", {
                                                className: "flex justify-between gap-3 mb-0.5",
                                                children: [r.jsx("span", {
                                                    className: "text-emerald-400",
                                                    children: "Komisi:"
                                                }), r.jsx("span", {
                                                    className: "font-bold",
                                                    children: J(i.commission)
                                                })]
                                            }), r.jsxs("div", {
                                                className: "flex justify-between gap-3 mb-1 border-b border-slate-600 pb-1",
                                                children: [r.jsx("span", {
                                                    className: "text-indigo-300",
                                                    children: "Spend:"
                                                }), r.jsx("span", {
                                                    className: "font-bold",
                                                    children: J(i.spend)
                                                })]
                                            }), r.jsxs("div", {
                                                className: `flex justify-between gap-3 font-bold text-[10px] ${o>=0?"text-emerald-400":"text-rose-400"}`,
                                                children: [r.jsx("span", {
                                                    children: o >= 0 ? "Profit:" : "Boncos:"
                                                }), r.jsx("span", {
                                                    children: J(Math.abs(o))
                                                })]
                                            })]
                                        })]
                                    }), r.jsx("span", {
                                        className: "text-[10px] text-slate-500 whitespace-nowrap font-medium",
                                        children: xt(i.date)
                                    })]
                                }, u)
                            })
                        })]
                    }), fe !== "daily" && hn.length > 0 && r.jsxs("div", {
                        className: "mt-4 border-t border-slate-100 dark:border-slate-800 pt-6 animate-in fade-in slide-in-from-top-4 duration-300",
                        children: [
                            /* Kartu Ringkasan Kebocoran Klik & Cookie Planting Hub */
                            r.jsxs("div", {
                                className: "mb-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white shadow-2xl overflow-hidden backdrop-blur-xl relative",
                                children: [
                                    /* Header Card */
                                    r.jsxs("div", {
                                        className: "p-5 sm:p-6 border-b border-indigo-500/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/[0.02]",
                                        children: [
                                            r.jsxs("div", {
                                                className: "flex items-start sm:items-center gap-3.5",
                                                children: [
                                                    r.jsx("div", {
                                                        className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0 mt-0.5 sm:mt-0",
                                                        children: r.jsx(CookieIcon, { size: 24, className: "animate-pulse" })
                                                    }),
                                                    r.jsxs("div", {
                                                        children: [
                                                            r.jsxs("div", {
                                                                className: "flex flex-wrap items-center gap-2",
                                                                children: [
                                                                    r.jsx("h3", {
                                                                        className: "text-base sm:text-lg font-black tracking-wide text-white",
                                                                        children: "Cookie Planting Hub — Strategi Tanam Cookies 7 Hari"
                                                                    }),
                                                                    r.jsx("span", {
                                                                        className: "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300",
                                                                        children: "Shopee Affiliate 7-Day Window"
                                                                    }),
                                                                    r.jsx("span", {
                                                                        className: `text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getLeakageBadgeStyle(overallLeakage.persentaseBocor).badgeCls}`,
                                                                        children: `Bocor: ${getLeakageBadgeStyle(overallLeakage.persentaseBocor).label}`
                                                                    })
                                                                ]
                                                            }),
                                                            r.jsx("p", {
                                                                className: "text-xs text-slate-300/80 mt-1 leading-relaxed max-w-2xl",
                                                                children: "Pantau biaya riil menanam 1 cookie di Shopee (CPRC), hasil valuasi komisi per cookie (EPC), kurva maturasi D+0 s.d D+7, dan komisi keranjang belanja."
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            r.jsxs("div", {
                                                className: "flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end",
                                                children: [
                                                    r.jsxs("div", {
                                                        className: `px-3.5 py-1.5 rounded-2xl border text-right shadow-sm ${
                                                            cookiePlantingSummary.cookieMargin >= 0
                                                                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                                                                : "bg-amber-950/60 border-amber-500/40 text-amber-300"
                                                        }`,
                                                        children: [
                                                            r.jsx("div", { className: "text-[8.5px] uppercase font-black tracking-wider opacity-80", children: "Margin per Cookie" }),
                                                            r.jsxs("div", { className: "text-base font-black font-mono", children: [
                                                                cookiePlantingSummary.cookieMargin >= 0 ? "+" : "",
                                                                J(Math.round(cookiePlantingSummary.cookieMargin)),
                                                                r.jsx("span", { className: "text-[10px] font-normal opacity-70 ml-1", children: "/cookie" })
                                                            ] })
                                                        ]
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "px-3.5 py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-right shadow-sm",
                                                        children: [
                                                            r.jsx("div", { className: "text-[8.5px] uppercase font-black text-slate-400 tracking-wider", children: "Kebocoran Klik" }),
                                                            r.jsxs("div", {
                                                                className: `text-base font-black font-mono ${overallLeakage.persentaseBocor > 70 ? "text-rose-400" : overallLeakage.persentaseBocor >= 50 ? "text-amber-400" : "text-emerald-400"}`,
                                                                children: [overallLeakage.persentaseBocor.toFixed(1), "%"]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),

                                    /* 4 Core Unit Economics Cards */
                                    r.jsxs("div", {
                                        className: "p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4",
                                        children: [
                                            r.jsxs("div", {
                                                className: "p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 transition-colors relative overflow-hidden group",
                                                children: [
                                                    r.jsx("div", { className: "text-[10.5px] font-bold text-slate-400 mb-1 flex items-center justify-between", children: [
                                                        "Cookies Aktif Tertanam",
                                                        r.jsx("span", { className: "text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30", children: "Shopee Clicks" })
                                                    ] }),
                                                    r.jsx("div", { className: "text-2xl font-black text-amber-400 font-mono tracking-tight", children: ke(cookiePlantingSummary.totalShopeeClicks) }),
                                                    r.jsxs("div", { className: "text-[9.5px] text-slate-400 mt-1 flex items-center gap-1", children: [
                                                        r.jsx("span", { className: "text-emerald-400 font-bold", children: `${cookiePlantingSummary.landingRatePct.toFixed(1)}% mendarat` }),
                                                        `dari ${ke(cookiePlantingSummary.totalMetaClicks)} klik Meta`
                                                    ] })
                                                ]
                                            }),
                                            r.jsxs("div", {
                                                className: "p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/40 transition-colors relative overflow-hidden group",
                                                children: [
                                                    r.jsx("div", { className: "text-[10.5px] font-bold text-slate-400 mb-1 flex items-center justify-between", children: [
                                                        "CPRC (Biaya Riil/Cookie)",
                                                        r.jsx("span", { className: `text-[9px] px-1.5 py-0.2 rounded font-extrabold ${cookiePlantingSummary.cprc <= 400 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : cookiePlantingSummary.cprc <= 800 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"}`, children: cookiePlantingSummary.cprc <= 400 ? "✓ Murah" : cookiePlantingSummary.cprc <= 800 ? "Sedang" : "⚠️ Mahal" })
                                                    ] }),
                                                    r.jsx("div", { className: "text-2xl font-black text-indigo-400 font-mono tracking-tight", children: J(Math.round(cookiePlantingSummary.cprc)) }),
                                                    r.jsx("div", { className: "text-[9.5px] text-slate-400 mt-1", children: "Biaya asli per 1 cookie yang aktif di Shopee" })
                                                ]
                                            }),
                                            r.jsxs("div", {
                                                className: "p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-emerald-500/40 transition-colors relative overflow-hidden group",
                                                children: [
                                                    r.jsx("div", { className: "text-[10.5px] font-bold text-slate-400 mb-1 flex items-center justify-between", children: [
                                                        "EPC (Valuasi/Cookie)",
                                                        r.jsx("span", { className: "text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", children: `${(cookiePlantingSummary.cprc > 0 ? (cookiePlantingSummary.epc / cookiePlantingSummary.cprc).toFixed(2) : '0')}x CPRC` })
                                                    ] }),
                                                    r.jsx("div", { className: "text-2xl font-black text-emerald-400 font-mono tracking-tight", children: J(Math.round(cookiePlantingSummary.epc)) }),
                                                    r.jsx("div", { className: "text-[9.5px] text-slate-400 mt-1", children: "Rata-rata hasil komisi per 1 cookie tertanam" })
                                                ]
                                            }),
                                            r.jsxs("div", {
                                                className: "p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-purple-500/40 transition-colors relative overflow-hidden group",
                                                children: [
                                                    r.jsx("div", { className: "text-[10.5px] font-bold text-slate-400 mb-1 flex items-center justify-between", children: [
                                                        "Net Cookie Margin",
                                                        r.jsx("span", { className: `text-[9px] px-1.5 py-0.2 rounded font-extrabold ${cookiePlantingSummary.cookieMargin >= 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-sky-500/20 text-sky-300 border border-sky-500/30"}`, children: cookiePlantingSummary.cookieMargin >= 0 ? "🔥 Untung Bersih" : "🌱 Maturing" })
                                                    ] }),
                                                    r.jsxs("div", {
                                                        className: `text-2xl font-black font-mono tracking-tight ${cookiePlantingSummary.cookieMargin >= 0 ? "text-emerald-300" : "text-amber-300"}`,
                                                        children: [
                                                            cookiePlantingSummary.cookieMargin >= 0 ? "+" : "",
                                                            J(Math.round(cookiePlantingSummary.cookieMargin))
                                                        ]
                                                    }),
                                                    r.jsx("div", { className: "text-[9.5px] text-slate-400 mt-1 truncate", children: cookiePlantingSummary.cookieMargin >= 0 ? "Setiap 1 cookie menghasilkan laba murni" : "Dalam proses panen checkout keranjang" })
                                                ]
                                            })
                                        ]
                                    }),

                                    /* 2 Tactical Panels: 7-Day Maturation Curve & Direct vs Indirect Basket Split */
                                    r.jsxs("div", {
                                        className: "px-5 sm:px-6 pb-6 pt-1 grid grid-cols-1 lg:grid-cols-12 gap-4",
                                        children: [
                                            /* Panel 1: Kurva Akumulasi 7 Hari */
                                            r.jsxs("div", {
                                                className: "lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex flex-col justify-between gap-3",
                                                children: [
                                                    r.jsxs("div", {
                                                        className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3",
                                                        children: [
                                                            r.jsxs("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    r.jsx(bu, { size: 16, className: "text-indigo-400" }),
                                                                    r.jsx("h4", { className: "text-xs font-black uppercase tracking-wider text-slate-200", children: "Kurva Akumulasi Siklus 7 Hari (D+0 s.d D+7)" })
                                                                ]
                                                            }),
                                                            r.jsxs("div", {
                                                                className: "flex items-center gap-2 text-[10px] text-slate-400 font-medium",
                                                                children: [
                                                                    "Proyeksi Komisi Penuh: ",
                                                                    r.jsx("span", { className: "font-black text-emerald-400 font-mono", children: J(Math.round(cookiePlantingSummary.projected7DayCommission)) }),
                                                                    r.jsx("span", { className: "text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30", children: `Est. ROAS ${cookiePlantingSummary.projected7DayRoas.toFixed(2)}x` })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    r.jsx("div", {
                                                        className: "grid grid-cols-4 sm:grid-cols-8 gap-2 py-1",
                                                        children: cookiePlantingSummary.cohortSchedule.map((c, cIdx) => {
                                                            return r.jsxs("div", {
                                                                className: `p-2 rounded-xl border text-center transition-all ${
                                                                    cIdx === 0
                                                                        ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-300"
                                                                        : cIdx <= 2
                                                                        ? "bg-slate-800/50 border-slate-700/60 text-slate-300"
                                                                        : "bg-slate-950/40 border-slate-800/60 text-slate-400"
                                                                }`,
                                                                children: [
                                                                    r.jsx("div", { className: "text-[8.5px] font-black uppercase tracking-tight", children: c.dayLabel }),
                                                                    r.jsxs("div", { className: "text-xs font-black font-mono text-white mt-0.5", children: [c.cumulativePct, "%"] }),
                                                                    r.jsxs("div", { className: "text-[7.5px] text-slate-400 mt-0.5 leading-none", children: ["+", c.sharePct, "%"] })
                                                                ]
                                                            }, c.dayLabel);
                                                        })
                                                    }),
                                                    r.jsxs("p", {
                                                        className: "text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 flex items-start gap-2",
                                                        children: [
                                                            r.jsx("span", { className: "text-amber-400 font-bold", children: "💡 Kunci Taktik:" }),
                                                            r.jsx("span", { children: "Di D+0 s.d D+2 pembeli sedang menimbun keranjang. Jika CPRC murah (< Rp 500) dan kebocoran < 60%, JANGAN di-kill! Beri waktu 3-7 hari untuk memanen komisi checkout dari keranjang belanja." })
                                                        ]
                                                    })
                                                ]
                                            }),

                                            /* Panel 2: Direct vs Indirect Split */
                                            r.jsxs("div", {
                                                className: "lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex flex-col justify-between gap-3",
                                                children: [
                                                    r.jsxs("div", {
                                                        className: "flex items-center gap-2 border-b border-slate-800 pb-3",
                                                        children: [
                                                            r.jsx(wu, { size: 16, className: "text-amber-400" }),
                                                            r.jsx("h4", { className: "text-xs font-black uppercase tracking-wider text-slate-200", children: "Panen Keranjang Silang (Direct vs Indirect)" })
                                                        ]
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "space-y-3",
                                                        children: [
                                                            r.jsxs("div", {
                                                                children: [
                                                                    r.jsxs("div", { className: "flex justify-between text-[10.5px] font-bold mb-1 text-slate-300", children: [
                                                                        r.jsx("span", { children: "🎯 Direct (Produk Diiklankan)" }),
                                                                        r.jsxs("span", { className: "text-amber-300 font-mono", children: [cookiePlantingSummary.directRatioPct.toFixed(0), "% (", J(Math.round(cookiePlantingSummary.directCommission)), ")"] })
                                                                    ] }),
                                                                    r.jsx("div", { className: "w-full h-2 rounded-full bg-slate-800 overflow-hidden", children: r.jsx("div", { className: "h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full", style: { width: `${cookiePlantingSummary.directRatioPct}%` } }) })
                                                                ]
                                                            }),
                                                            r.jsxs("div", {
                                                                children: [
                                                                    r.jsxs("div", { className: "flex justify-between text-[10.5px] font-bold mb-1 text-slate-300", children: [
                                                                        r.jsx("span", { children: "🛒 Indirect (Keranjang Silang / Toko Lain)" }),
                                                                        r.jsxs("span", { className: "text-emerald-300 font-mono", children: [cookiePlantingSummary.indirectRatioPct.toFixed(0), "% (", J(Math.round(cookiePlantingSummary.indirectCommission)), ")"] })
                                                                    ] }),
                                                                    r.jsx("div", { className: "w-full h-2 rounded-full bg-slate-800 overflow-hidden", children: r.jsx("div", { className: "h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full", style: { width: `${cookiePlantingSummary.indirectRatioPct}%` } }) })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    r.jsx("p", {
                                                        className: "text-[9.5px] text-slate-400/90 leading-tight",
                                                        children: "Semakin besar porsi Indirect, semakin sukses strategi umpan tanam cookie Anda memanen komisi dari seluruh isi keranjang belanja pembeli."
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            r.jsx(CookieOptimizerHub, {
                                tagsData: _t,
                                allMetaRows: Qe,
                                overallLeakagePct: overallLeakage.persentaseBocor,
                                defaultCprc: cookiePlantingSummary.cprc,
                                defaultEpc: cookiePlantingSummary.epc,
                                defaultAvgComm: cookiePlantingSummary.totalOrders > 0 ? cookiePlantingSummary.totalCommission / cookiePlantingSummary.totalOrders : 7500,
                                onSelectInspection: (scopeType, key) => {
                                    setBreakdownScopeType(scopeType);
                                    setBreakdownSelectedKey(key);
                                    const el = document.getElementById("dashboard-breakdown-section");
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                },
                                onNavigateToTab: (tabKey) => De(tabKey)
                            }),
                            /* SELECTOR BOX: Inspeksi Performa Harian & Placement (Satu per Satu) */
                            r.jsxs("div", {
                                id: "dashboard-breakdown-section",
                                className: "mb-6 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all scroll-mt-20",
                                children: [
                                    r.jsxs("div", {
                                        className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800",
                                        children: [
                                            r.jsxs("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    r.jsx("div", {
                                                        className: "w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0",
                                                        children: r.jsx(Pu, { size: 20 })
                                                    }),
                                                    r.jsxs("div", {
                                                        children: [
                                                            r.jsxs("h4", {
                                                                className: "text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2",
                                                                children: [
                                                                    "Inspeksi Performa Harian & Placement",
                                                                    r.jsx("span", {
                                                                        className: "text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
                                                                        children: "Cek Satu per Satu"
                                                                    })
                                                                ]
                                                            }),
                                                            r.jsx("p", {
                                                                className: "text-xs text-slate-500 dark:text-slate-400 mt-0.5",
                                                                children: "Filter tabel rincian harian dan analisis penempatan per Kampanye, Ad Set, Iklan (Ad), atau Tag Shopee secara spesifik."
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            filteredBreakdownData.isFiltered && r.jsxs("button", {
                                                type: "button",
                                                onClick: () => {
                                                    setBreakdownScopeType("all");
                                                    setBreakdownSelectedKey("");
                                                },
                                                className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer transition-colors shadow-2xs",
                                                children: [
                                                    r.jsx(It, { size: 14 }),
                                                    "Reset ke Semua Iklan (Keseluruhan)"
                                                ]
                                            })
                                        ]
                                    }),

                                    r.jsxs("div", {
                                        className: "grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-3.5 items-end",
                                        children: [
                                            r.jsxs("div", {
                                                className: "md:col-span-6 lg:col-span-5",
                                                children: [
                                                    r.jsx("label", {
                                                        className: "block text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5",
                                                        children: "1. Tingkat Analisis (Scope)"
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "grid grid-cols-5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] font-bold gap-1",
                                                        children: [
                                                            r.jsx("button", {
                                                                type: "button",
                                                                onClick: () => {
                                                                    setBreakdownScopeType("all");
                                                                    setBreakdownSelectedKey("");
                                                                },
                                                                className: `py-1.5 rounded-xl transition-all cursor-pointer truncate text-center ${
                                                                    breakdownScopeType === "all"
                                                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                                }`,
                                                                children: "Semua"
                                                            }),
                                                            r.jsx("button", {
                                                                type: "button",
                                                                onClick: () => {
                                                                    setBreakdownScopeType("tag");
                                                                    if (breakdownOptions.tags.length > 0 && (!breakdownSelectedKey || breakdownScopeType !== "tag")) {
                                                                        setBreakdownSelectedKey(breakdownOptions.tags[0].value);
                                                                    }
                                                                },
                                                                className: `py-1.5 rounded-xl transition-all cursor-pointer truncate text-center ${
                                                                    breakdownScopeType === "tag"
                                                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                                }`,
                                                                children: "Tag"
                                                            }),
                                                            r.jsx("button", {
                                                                type: "button",
                                                                onClick: () => {
                                                                    setBreakdownScopeType("campaign");
                                                                    if (breakdownOptions.campaigns.length > 0 && (!breakdownSelectedKey || breakdownScopeType !== "campaign")) {
                                                                        setBreakdownSelectedKey(breakdownOptions.campaigns[0].value);
                                                                    }
                                                                },
                                                                className: `py-1.5 rounded-xl transition-all cursor-pointer truncate text-center ${
                                                                    breakdownScopeType === "campaign"
                                                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                                }`,
                                                                children: "Kampanye"
                                                            }),
                                                            r.jsx("button", {
                                                                type: "button",
                                                                onClick: () => {
                                                                    setBreakdownScopeType("adset");
                                                                    if (breakdownOptions.adsets.length > 0 && (!breakdownSelectedKey || breakdownScopeType !== "adset")) {
                                                                        setBreakdownSelectedKey(breakdownOptions.adsets[0].value);
                                                                    }
                                                                },
                                                                className: `py-1.5 rounded-xl transition-all cursor-pointer truncate text-center ${
                                                                    breakdownScopeType === "adset"
                                                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                                }`,
                                                                children: "Ad Set"
                                                            }),
                                                            r.jsx("button", {
                                                                type: "button",
                                                                onClick: () => {
                                                                    setBreakdownScopeType("ad");
                                                                    if (breakdownOptions.ads.length > 0 && (!breakdownSelectedKey || breakdownScopeType !== "ad")) {
                                                                        setBreakdownSelectedKey(breakdownOptions.ads[0].value);
                                                                    }
                                                                },
                                                                className: `py-1.5 rounded-xl transition-all cursor-pointer truncate text-center ${
                                                                    breakdownScopeType === "ad"
                                                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                                }`,
                                                                children: "Iklan"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),

                                            r.jsxs("div", {
                                                className: "md:col-span-6 lg:col-span-7",
                                                children: [
                                                    r.jsxs("label", {
                                                        className: "block text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5",
                                                        children: [
                                                            "2. Pilih ",
                                                            breakdownScopeType === "tag" ? "Tag Link Shopee" : breakdownScopeType === "campaign" ? "Kampanye Meta" : breakdownScopeType === "adset" ? "Ad Set Meta" : breakdownScopeType === "ad" ? "Iklan Meta (Ad)" : "Tampilan",
                                                            breakdownScopeType !== "all" && r.jsx("span", {
                                                                className: "text-indigo-500 font-normal ml-1 lowercase",
                                                                children: `(${
                                                                    breakdownScopeType === "tag" ? breakdownOptions.tags.length :
                                                                    breakdownScopeType === "campaign" ? breakdownOptions.campaigns.length :
                                                                    breakdownScopeType === "adset" ? breakdownOptions.adsets.length :
                                                                    breakdownOptions.ads.length
                                                                } item)`
                                                            })
                                                        ]
                                                    }),
                                                    breakdownScopeType === "all" ? (
                                                        r.jsxs("select", {
                                                            value: "all",
                                                            onChange: g => {
                                                                const val = g.target.value;
                                                                if (val === "all") {
                                                                    setBreakdownScopeType("all");
                                                                    setBreakdownSelectedKey("");
                                                                } else if (val.startsWith("tag:")) {
                                                                    setBreakdownScopeType("tag");
                                                                    setBreakdownSelectedKey(val.slice(4));
                                                                } else if (val.startsWith("campaign:")) {
                                                                    setBreakdownScopeType("campaign");
                                                                    setBreakdownSelectedKey(val.slice(9));
                                                                } else if (val.startsWith("adset:")) {
                                                                    setBreakdownScopeType("adset");
                                                                    setBreakdownSelectedKey(val.slice(6));
                                                                } else if (val.startsWith("ad:")) {
                                                                    setBreakdownScopeType("ad");
                                                                    setBreakdownSelectedKey(val.slice(3));
                                                                }
                                                            },
                                                            className: "w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500/50 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs",
                                                            children: [
                                                                r.jsx("option", {
                                                                    value: "all",
                                                                    children: "⭐ Semua Iklan & Shopee (Gabungan Keseluruhan)"
                                                                }),
                                                                breakdownOptions.tags.length > 0 && r.jsx("optgroup", {
                                                                    label: "🏷️ Tag Link Shopee",
                                                                    children: breakdownOptions.tags.map(opt => r.jsx("option", {
                                                                        value: "tag:" + opt.value,
                                                                        children: opt.label
                                                                    }, "tag:" + opt.value))
                                                                }),
                                                                breakdownOptions.campaigns.length > 0 && r.jsx("optgroup", {
                                                                    label: "📁 Kampanye Meta Ads",
                                                                    children: breakdownOptions.campaigns.map(opt => r.jsx("option", {
                                                                        value: "campaign:" + opt.value,
                                                                        children: opt.label
                                                                    }, "campaign:" + opt.value))
                                                                }),
                                                                breakdownOptions.adsets.length > 0 && r.jsx("optgroup", {
                                                                    label: "🎯 Ad Set Meta Ads",
                                                                    children: breakdownOptions.adsets.map(opt => r.jsx("option", {
                                                                        value: "adset:" + opt.value,
                                                                        children: opt.label
                                                                    }, "adset:" + opt.value))
                                                                }),
                                                                breakdownOptions.ads.length > 0 && r.jsx("optgroup", {
                                                                    label: "🎬 Iklan Meta Ads (Ads)",
                                                                    children: breakdownOptions.ads.map(opt => r.jsx("option", {
                                                                        value: "ad:" + opt.value,
                                                                        children: opt.label
                                                                    }, "ad:" + opt.value))
                                                                })
                                                            ]
                                                        })
                                                    ) : (
                                                        r.jsxs("select", {
                                                            value: breakdownSelectedKey,
                                                            onChange: g => {
                                                                if (g.target.value === "__ALL__") {
                                                                    setBreakdownScopeType("all");
                                                                    setBreakdownSelectedKey("");
                                                                } else {
                                                                    setBreakdownSelectedKey(g.target.value);
                                                                }
                                                            },
                                                            className: "w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500/50 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs",
                                                            children: [
                                                                r.jsx("option", {
                                                                    value: "__ALL__",
                                                                    children: "← Kembali ke Semua Iklan (Keseluruhan)"
                                                                }),
                                                                (
                                                                    breakdownScopeType === "tag" ? breakdownOptions.tags :
                                                                    breakdownScopeType === "campaign" ? breakdownOptions.campaigns :
                                                                    breakdownScopeType === "adset" ? breakdownOptions.adsets :
                                                                    breakdownOptions.ads
                                                                ).map(opt => r.jsx("option", {
                                                                    value: opt.value,
                                                                    children: opt.label
                                                                }, opt.value))
                                                            ]
                                                        })
                                                    )
                                                ]
                                            })
                                        ]
                                    }),

                                    filteredBreakdownData.isFiltered && r.jsxs("div", {
                                        className: "mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 shadow-xs animate-in fade-in duration-200",
                                        children: [
                                            r.jsxs("div", {
                                                className: "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/40",
                                                children: [
                                                    r.jsxs("div", {
                                                        className: "flex items-start gap-2.5",
                                                        children: [
                                                            r.jsx("span", {
                                                                className: "text-lg mt-0.5",
                                                                children: breakdownScopeType === "tag" ? "🏷️" : breakdownScopeType === "campaign" ? "📁" : breakdownScopeType === "adset" ? "🎯" : "🎬"
                                                            }),
                                                            r.jsxs("div", {
                                                                children: [
                                                                    r.jsxs("div", {
                                                                        className: "flex flex-wrap items-center gap-2",
                                                                        children: [
                                                                            r.jsx("h5", {
                                                                                className: "text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider",
                                                                                children: filteredBreakdownData.label
                                                                            }),
                                                                            r.jsx("span", {
                                                                                className: "text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs",
                                                                                children: "Data Terfilter"
                                                                            })
                                                                        ]
                                                                    }),
                                                                    r.jsx("p", {
                                                                        className: "text-[11px] text-slate-500 dark:text-slate-400 mt-0.5",
                                                                        children: filteredBreakdownData.sublabel
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    filteredBreakdownData.insight && r.jsxs("div", {
                                                        className: `px-3 py-1.5 rounded-xl border flex items-center gap-2 ${filteredBreakdownData.insight.badgeCls}`,
                                                        children: [
                                                            r.jsx("span", { className: "text-xs font-black", children: filteredBreakdownData.insight.label }),
                                                            r.jsx("span", { className: "text-[10px] opacity-90 hidden sm:inline", children: `• ${filteredBreakdownData.insight.action}` })
                                                        ]
                                                    })
                                                ]
                                            }),

                                            r.jsxs("div", {
                                                className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3",
                                                children: [
                                                    r.jsxs("div", {
                                                        className: "p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center",
                                                        children: [
                                                            r.jsx("div", { className: "text-[9.5px] font-semibold text-slate-400 uppercase", children: "Spent (+PPN)" }),
                                                            r.jsx("div", { className: "text-xs font-black text-violet-700 dark:text-violet-400 font-mono mt-0.5", children: J(filteredBreakdownData.totalSpend) })
                                                        ]
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center",
                                                        children: [
                                                            r.jsx("div", { className: "text-[9.5px] font-semibold text-slate-400 uppercase", children: "Meta Clicks" }),
                                                            r.jsx("div", { className: "text-xs font-black text-indigo-700 dark:text-indigo-400 font-mono mt-0.5", children: ke(filteredBreakdownData.metaClicks) })
                                                        ]
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center",
                                                        children: [
                                                            r.jsx("div", { className: "text-[9.5px] font-semibold text-slate-400 uppercase", children: "Shopee Clicks" }),
                                                            r.jsx("div", { className: "text-xs font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5", children: ke(filteredBreakdownData.shopeeClicks) })
                                                        ]
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center",
                                                        children: [
                                                            r.jsx("div", { className: "text-[9.5px] font-semibold text-slate-400 uppercase", children: "% Kebocoran" }),
                                                            r.jsxs("div", {
                                                                className: `text-xs font-black font-mono mt-0.5 ${
                                                                    filteredBreakdownData.leakageInfo.persentaseBocor > 70 ? "text-rose-600 dark:text-rose-400" :
                                                                    filteredBreakdownData.leakageInfo.persentaseBocor >= 50 ? "text-amber-600 dark:text-amber-400" :
                                                                    "text-emerald-600 dark:text-emerald-400"
                                                                }`,
                                                                children: [filteredBreakdownData.leakageInfo.persentaseBocor.toFixed(1), "%"]
                                                            })
                                                        ]
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center",
                                                        children: [
                                                            r.jsx("div", { className: "text-[9.5px] font-semibold text-slate-400 uppercase", children: "Komisi Shopee" }),
                                                            r.jsx("div", { className: "text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5", children: J(filteredBreakdownData.commission) })
                                                        ]
                                                    }),
                                                    r.jsxs("div", {
                                                        className: "p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center",
                                                        children: [
                                                            r.jsx("div", { className: "text-[9.5px] font-semibold text-slate-400 uppercase", children: "ROAS" }),
                                                            r.jsxs("div", {
                                                                className: `text-xs font-black font-mono mt-0.5 ${
                                                                    filteredBreakdownData.roas >= 2 ? "text-emerald-600 dark:text-emerald-400" :
                                                                    filteredBreakdownData.roas >= 1 ? "text-blue-600 dark:text-blue-400" :
                                                                    "text-rose-600 dark:text-rose-400"
                                                                }`,
                                                                children: [filteredBreakdownData.roas.toFixed(2), "x"]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),

                            r.jsx("div", {
                                className: "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4",
                                children: r.jsxs("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        r.jsxs("h3", {
                                            className: "text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2",
                                            children: [
                                                r.jsx(ma, {
                                                    size: 18,
                                                    className: "text-indigo-500"
                                                }),
                                                " Tabel Rincian Performa Harian"
                                            ]
                                        }),
                                        filteredBreakdownData.isFiltered ? (
                                            r.jsx("span", {
                                                className: "text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
                                                children: filteredBreakdownData.label
                                            })
                                        ) : (
                                            r.jsx("span", {
                                                className: "text-[10px] text-slate-400 font-medium",
                                                children: "(Hasil Keseluruhan)"
                                            })
                                        )
                                    ]
                                })
                            }),
                            r.jsx("div", {
                                className: "overflow-x-auto max-h-[850px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm relative",
                                children: r.jsxs("table", {
                                    className: "min-w-full text-[11px] text-left",
                                    children: [
                                        r.jsx("thead", {
                                            className: "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 z-10 shadow-sm",
                                            children: r.jsxs("tr", {
                                                children: [
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap",
                                                        children: "Tanggal"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap text-violet-700 dark:text-violet-300",
                                                        children: "Meta Clicks"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap text-amber-700 dark:text-amber-300",
                                                        children: "Shopee Clicks"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap text-rose-700 dark:text-rose-300",
                                                        children: "% Kebocoran"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap",
                                                        children: "Pesanan"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap",
                                                        children: "Komisi Shopee"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap",
                                                        children: "Ad Spend (+PPN)"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap",
                                                        children: "Profit Bersih"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap",
                                                        children: "ROI"
                                                    }),
                                                    r.jsx("th", {
                                                        className: "px-4 py-2.5 whitespace-nowrap",
                                                        children: "ROAS"
                                                    })
                                                ]
                                            })
                                        }),
                                        r.jsx("tbody", {
                                            className: "divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60",
                                            children: filteredBreakdownData.dailyRows.length === 0 ? (
                                                r.jsx("tr", {
                                                    children: r.jsx("td", {
                                                        colSpan: 10,
                                                        className: "py-10 text-center text-slate-400 dark:text-slate-500 text-xs italic",
                                                        children: "Tidak ada data transaksi atau klik untuk iklan/tag yang dipilih pada rentang tanggal aktif."
                                                    })
                                                })
                                            ) : (
                                                [...filteredBreakdownData.dailyRows].reverse().map((i, u) => {
                                                    const badgeStyle = getLeakageBadgeStyle(i.leakagePct);
                                                    return r.jsxs("tr", {
                                                        className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors",
                                                        children: [
                                                            r.jsx("td", {
                                                                className: "px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap",
                                                                children: qt(new Date(i.date))
                                                            }),
                                                            r.jsx("td", {
                                                                className: "px-4 py-2.5 font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap",
                                                                children: i.metaClicks > 0 ? ke(i.metaClicks) : r.jsx("span", { className: "text-slate-300 dark:text-slate-600", children: "—" })
                                                            }),
                                                            r.jsx("td", {
                                                                className: "px-4 py-2.5 font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap",
                                                                children: ke(i.shopeeClicks || i.clicks)
                                                            }),
                                                            r.jsx("td", {
                                                                className: "px-4 py-2.5 whitespace-nowrap",
                                                                children: i.metaClicks > 0 ? r.jsxs("span", {
                                                                    className: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${badgeStyle.badgeCls}`,
                                                                    title: `Bocor: ${ke(i.kebocoran)} klik (${ke(i.shopeeClicks)} sampai dari ${ke(i.metaClicks)} klik Meta)`,
                                                                    children: [
                                                                        r.jsx("span", {
                                                                            className: `w-1.5 h-1.5 rounded-full ${i.leakagePct > 70 ? "bg-rose-500 animate-pulse" : i.leakagePct >= 50 ? "bg-amber-500" : "bg-emerald-500"}`
                                                                        }),
                                                                        `${i.leakagePct.toFixed(1)}%`
                                                                    ]
                                                                }) : r.jsx("span", { className: "text-slate-300 dark:text-slate-600", children: "—" })
                                                            }),
                                                            r.jsx("td", {
                                                                className: "px-4 py-2.5 font-medium",
                                                                children: r.jsxs("div", {
                                                                    className: "flex items-center gap-1.5",
                                                                    children: [
                                                                        r.jsx("span", {
                                                                            children: ke(i.orders)
                                                                        }),
                                                                        i.clickDates && i.clickDates.length > 0 && r.jsx("button", {
                                                                            onClick: () => Z({
                                                                                orderDate: i.date,
                                                                                label: null,
                                                                                tag: null,
                                                                                clickDates: i.clickDates
                                                                            }),
                                                                            className: "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-500 ring-1 ring-amber-200 hover:bg-amber-400 hover:text-white hover:ring-amber-400 transition-all cursor-pointer flex-shrink-0",
                                                                            title: "Distribusi tanggal klik",
                                                                            children: r.jsx(cr, {
                                                                                size: 9
                                                                            })
                                                                        })
                                                                    ]
                                                                })
                                                            }),
                                                            r.jsx("td", {
                                                                className: "px-4 py-2.5 font-bold text-[#ee4d2d]",
                                                                children: J(i.commission)
                                                            }),
                                                            r.jsx("td", {
                                                                className: "px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400",
                                                                children: J(i.spend)
                                                            }),
                                                            r.jsxs("td", {
                                                                className: `px-4 py-2.5 font-bold ${i.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`,
                                                                children: [i.profit < 0 && "- ", J(Math.abs(i.profit))]
                                                            }),
                                                            r.jsx("td", {
                                                                className: `px-4 py-2.5 font-bold ${(i.roi ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`,
                                                                children: i.roi === 1 / 0 ? "∞" : typeof i.roi === "number" && !isNaN(i.roi) ? `${i.roi.toFixed(2)}%` : "0.00%"
                                                            }),
                                                            r.jsxs("td", {
                                                                className: "px-4 py-2.5 font-bold text-amber-600 dark:text-amber-400",
                                                                children: [typeof i.roas === "number" && !isNaN(i.roas) ? i.roas.toFixed(2) : "0.00", "x"]
                                                            })
                                                        ]
                                                    }, i.date || u);
                                                })
                                            )
                                        })
                                    ]
                                })
                            }),

                            /* Seksi / Tabel Placement Meta Ads (Multi-Breakdown) */
                            r.jsxs("div", {
                                className: "mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 animate-in fade-in slide-in-from-top-4 duration-300",
                                children: [
                                    r.jsxs("div", {
                                        className: "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2",
                                        children: [
                                            r.jsxs("div", {
                                                children: [
                                                    r.jsxs("div", {
                                                        className: "flex flex-wrap items-center gap-2",
                                                        children: [
                                                            r.jsxs("h3", {
                                                                className: "text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2",
                                                                children: [
                                                                    r.jsx(Pu, { size: 18, className: "text-indigo-500" }),
                                                                    "Analisis Placement Meta Ads (Multi-Breakdown)"
                                                                ]
                                                            }),
                                                            filteredBreakdownData.isFiltered && r.jsx("span", {
                                                                className: "text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
                                                                children: filteredBreakdownData.label
                                                            })
                                                        ]
                                                    }),
                                                    r.jsx("p", {
                                                        className: "text-xs text-slate-400 mt-0.5",
                                                        children: filteredBreakdownData.isFiltered 
                                                            ? `Rincian Ad Spend dan Klik berdasarkan penempatan khusus untuk: ${filteredBreakdownData.label}` 
                                                            : "Rincian Ad Spend dan Klik berdasarkan penempatan (Instagram Reels, Facebook Feed, Stories, dll.)"
                                                    })
                                                ]
                                            }),
                                            r.jsxs("span", {
                                                className: "text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full",
                                                children: [filteredBreakdownData.placementRows.length, " Penempatan Terdeteksi"]
                                            })
                                        ]
                                    }),
                                    r.jsx("div", {
                                        className: "overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900/60",
                                        children: r.jsxs("table", {
                                            className: "min-w-full text-[11px] text-left",
                                            children: [
                                                r.jsx("thead", {
                                                    className: "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold",
                                                    children: r.jsxs("tr", {
                                                        children: [
                                                            r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap", children: "Nama Placement" }),
                                                            r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right", children: "Total Spent (+PPN)" }),
                                                            r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right", children: "Porsi Spent (%)" }),
                                                            r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right", children: "Meta Link Clicks" }),
                                                            filteredBreakdownData.isFiltered && r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right text-amber-600 dark:text-amber-400", children: "Est. Shopee Clicks" }),
                                                            filteredBreakdownData.isFiltered && r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right text-indigo-600 dark:text-indigo-400", children: "CPRC (Biaya/Cookie)" }),
                                                            r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right", children: "CPC (Cost per Click)" }),
                                                            r.jsx("th", { className: "px-4 py-2.5 min-w-[160px]", children: "Distribusi Spent" })
                                                        ]
                                                    })
                                                }),
                                                r.jsx("tbody", {
                                                    className: "divide-y divide-slate-100 dark:divide-slate-800",
                                                    children: filteredBreakdownData.placementRows.length === 0 ? (
                                                        r.jsx("tr", {
                                                            children: r.jsx("td", {
                                                                colSpan: filteredBreakdownData.isFiltered ? 8 : 6,
                                                                className: "py-8 text-center text-slate-400 text-xs italic",
                                                                children: "Tidak ada data penempatan (placement) yang terdeteksi untuk pilihan ini."
                                                            })
                                                        })
                                                    ) : (
                                                        filteredBreakdownData.placementRows.map((plItem, idx) => {
                                                            const totalSpentAll = filteredBreakdownData.placementRows.reduce((s, p) => s + (p.amountSpent || 0), 0) || 1;
                                                            const spentWithPpn = plItem.amountSpentWithPpn !== undefined ? plItem.amountSpentWithPpn : plItem.amountSpent * (1 + Ne / 100);
                                                            const share = plItem.spendSharePct !== undefined ? plItem.spendSharePct : (plItem.amountSpent / totalSpentAll) * 100;
                                                            const metaClicks = plItem.linkClicks !== undefined ? plItem.linkClicks : plItem.metaClicks;
                                                            const cpc = plItem.cpc !== undefined ? plItem.cpc : (metaClicks > 0 ? spentWithPpn / metaClicks : 0);
                                                            const estShopee = plItem.estimatedShopeeClicks;
                                                            const cprc = plItem.cprc;

                                                            return r.jsxs("tr", {
                                                                className: "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors",
                                                                children: [
                                                                    r.jsx("td", {
                                                                        className: "px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200",
                                                                        children: r.jsxs("div", {
                                                                            className: "flex items-center gap-2",
                                                                            children: [
                                                                                r.jsx("span", {
                                                                                    className: `w-2 h-2 rounded-full ${
                                                                                        plItem.placement.toLowerCase().includes("reels") ? "bg-pink-500" :
                                                                                        plItem.placement.toLowerCase().includes("stories") ? "bg-purple-500" :
                                                                                        plItem.placement.toLowerCase().includes("feed") ? "bg-blue-500" : "bg-indigo-500"
                                                                                    }`
                                                                                }),
                                                                                plItem.placement
                                                                            ]
                                                                        })
                                                                    }),
                                                                    r.jsx("td", {
                                                                        className: "px-4 py-2.5 font-bold text-violet-600 dark:text-violet-400 text-right whitespace-nowrap",
                                                                        children: J(spentWithPpn)
                                                                    }),
                                                                    r.jsx("td", {
                                                                        className: "px-4 py-2.5 text-right font-medium whitespace-nowrap",
                                                                        children: `${share.toFixed(1)}%`
                                                                    }),
                                                                    r.jsx("td", {
                                                                        className: "px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 text-right whitespace-nowrap",
                                                                        children: ke(metaClicks)
                                                                    }),
                                                                    filteredBreakdownData.isFiltered && r.jsx("td", {
                                                                        className: "px-4 py-2.5 font-bold text-amber-600 dark:text-amber-400 text-right whitespace-nowrap",
                                                                        children: estShopee !== undefined ? ke(estShopee) : "—"
                                                                    }),
                                                                    filteredBreakdownData.isFiltered && r.jsx("td", {
                                                                        className: "px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 text-right whitespace-nowrap",
                                                                        children: cprc && cprc > 0 ? J(Math.round(cprc)) : "—"
                                                                    }),
                                                                    r.jsx("td", {
                                                                        className: "px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap",
                                                                        children: cpc > 0 ? J(cpc) : "—"
                                                                    }),
                                                                    r.jsx("td", {
                                                                        className: "px-4 py-2.5",
                                                                        children: r.jsx("div", {
                                                                            className: "w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden",
                                                                            children: r.jsx("div", {
                                                                                className: "h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full",
                                                                                style: { width: `${Math.min(100, Math.max(2, share))}%` }
                                                                            })
                                                                        })
                                                                    })
                                                                ]
                                                            }, plItem.placement || idx);
                                                        })
                                                    )
                                                })
                                            ]
                                        })
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        }), ve === "cookie_hub" && r.jsx("div", {
            className: "animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6",
            children: r.jsx(TagDashboard, {
                metaRows: Qe,
                shopeeClicks: _,
                shopeeOrders: be,
                tagMappings: ce,
                onUpdateTagMapping: (tag, links) => Ke(prev => ({ ...prev, [tag]: links })),
                ppnRate: Ne,
                dateFilterFn: _e,
                activeFilterLabel: fe === "all" ? "Semua Waktu" : fe === "monthly" ? Pn(Ye) : fe === "daily" ? qt(new Date(Ye)) : "Custom Rentang",
                onNavigateToDashboard: (scope, key) => {
                    setBreakdownScopeType(scope);
                    setBreakdownSelectedKey(key);
                    De("dashboard");
                    setTimeout(() => {
                        const el = document.getElementById("dashboard-breakdown-section");
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                }
            })
        }), ve === "table" && r.jsxs("div", {
                className: "bg-white rounded-2xl card-fx border border-slate-200/70 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300",
                children: [r.jsxs("div", {
                    className: "px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-white to-indigo-50/40 relative z-10",
                    children: [r.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [r.jsx("div", {
                            className: "w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0",
                            children: r.jsx(ha, {
                                className: "text-rose-500",
                                size: 18
                            })
                        }), r.jsxs("div", {
                            children: [r.jsx("h2", {
                                className: "text-sm font-black text-slate-800",
                                children: "Performa Tag Shopee Affiliate"
                            }), r.jsx("p", {
                                className: "text-[10px] text-slate-400 mt-0.5",
                                children: "Klik nama tag untuk melihat breakdown harian secara detail."
                            })]
                        })]
                    }), r.jsxs("div", {
                        className: "relative w-full sm:w-72",
                        children: [r.jsx(Lu, {
                            size: 14,
                            className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        }), r.jsx("input", {
                            type: "text",
                            value: ln,
                            onChange: i => Hr(i.target.value),
                            placeholder: "Cari tag, campaign, ad set, atau ads...",
                            className: "w-full text-base sm:text-xs border border-slate-200 rounded-xl pl-9 pr-9 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white shadow-sm text-slate-600"
                        }), ln && r.jsx("button", {
                            onClick: () => Hr(""),
                            className: "absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-all",
                            title: "Hapus pencarian",
                            children: r.jsx(It, {
                                size: 11
                            })
                        })]
                    })]
                }), r.jsxs("div", {
                    id: "step-add-tag",
                    className: "px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative",
                    children: [r.jsxs("div", {
                        className: "flex flex-col sm:flex-row gap-2 w-full max-w-lg relative z-20",
                        children: [r.jsx(Wt, {
                            className: "flex-1",
                            searchable: !0,
                            placeholder: "Pilih tag untuk ditambahkan...",
                            searchPlaceholder: "Cari nama tag...",
                            emptyText: _t.length === 0 ? "Upload Data CSV terlebih dahulu" : "Semua tag sudah ada di tabel",
                            value: Ve || null,
                            onChange: kt,
                            options: Gr.map(i => ({
                                value: i.tag,
                                label: i.tag || "<Tanpa Tag>",
                                hint: `${ke(i.shopeeOrders)} Pesanan`
                            }))
                        }), r.jsxs("button", {
                            onClick: ga,
                            className: "bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 max-sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm shadow-indigo-200 disabled:opacity-40 disabled:shadow-none",
                            disabled: !Ve,
                            children: [r.jsx(Nu, {
                                size: 14
                            }), " Tambah Tag"]
                        })]
                    }), r.jsxs("div", {
                        className: "flex items-center gap-2 relative z-20",
                        children: [r.jsx(Wt, {
                            id: "step-tag-filter",
                            tone: "indigo",
                            className: "max-sm:flex-1",
                            searchable: !1,
                            placeholder: "Tampilkan Banyak...",
                            disabled: _t.length === 0,
                            onChange: i => {
                                i === "all" ? Ue(_t.map(u => u.tag)) : Ut(Number(i))
                            },
                            options: [{
                                value: "all",
                                label: `Semua Tag (${_t.length})`
                            }, {
                                value: "7",
                                label: "Aktif 7 Hari Terakhir"
                            }, {
                                value: "30",
                                label: "Aktif 30 Hari Terakhir"
                            }, {
                                value: "60",
                                label: "Aktif 60 Hari Terakhir"
                            }]
                        }), r.jsxs("button", {
                            onClick: () => Ue([]),
                            className: "text-xs text-rose-500 font-bold px-3 py-2 max-sm:py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap",
                            children: [r.jsx(Rm, {
                                size: 13
                            }), " Kosongkan"]
                        })]
                    })]
                }), r.jsxs("div", {
                    className: "px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs",
                    children: [
                        r.jsxs("div", {
                            className: "flex flex-wrap items-center gap-1.5",
                            children: [
                                r.jsx("span", {
                                    className: "text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mr-1",
                                    children: "Filter Status Rekomendasi:"
                                }),
                                r.jsx("button", {
                                    type: "button",
                                    onClick: () => Ue(_t.map(u => u.tag)),
                                    className: "px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 cursor-pointer shadow-2xs transition-colors",
                                    children: `Semua Tag (${_t.length})`
                                }),
                                r.jsx("button", {
                                    type: "button",
                                    onClick: () => {
                                        const tags = _t.filter(t => {
                                            const ins = getAffiliateInsight({ roas: t.roas, spend: t.totalSpentWithPpn, clicks: t.metaClicks, shopeeClicks: t.shopeeClicks, commission: t.shopeeCommission });
                                            return ins.tone === 'green';
                                        }).map(t => t.tag);
                                        Ue(tags);
                                    },
                                    className: "px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer shadow-2xs transition-colors",
                                    children: "🔥 Scale Up"
                                }),
                                r.jsx("button", {
                                    type: "button",
                                    onClick: () => {
                                        const tags = _t.filter(t => {
                                            const ins = getAffiliateInsight({ roas: t.roas, spend: t.totalSpentWithPpn, clicks: t.metaClicks, shopeeClicks: t.shopeeClicks, commission: t.shopeeCommission, leakage: t.leakagePct });
                                            return ins.tone === 'crimson' || ins.tone === 'red';
                                        }).map(t => t.tag);
                                        Ue(tags);
                                    },
                                    className: "px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer shadow-2xs transition-colors",
                                    children: "🛑 Boncos / Kill"
                                }),
                                r.jsx("button", {
                                    type: "button",
                                    onClick: () => {
                                        const tags = _t.filter(t => {
                                            const ins = getAffiliateInsight({ roas: t.roas, spend: t.totalSpentWithPpn, clicks: t.metaClicks, shopeeClicks: t.shopeeClicks, commission: t.shopeeCommission, daysActive: t.clickDates?.length });
                                            return ins.tone === 'blue';
                                        }).map(t => t.tag);
                                        Ue(tags);
                                    },
                                    className: "px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 cursor-pointer shadow-2xs transition-colors",
                                    children: "🌱 Cookie Maturing"
                                }),
                                r.jsx("button", {
                                    type: "button",
                                    onClick: () => {
                                        const tags = _t.filter(t => t.leakagePct >= 50).map(t => t.tag);
                                        Ue(tags);
                                    },
                                    className: "px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer shadow-2xs transition-colors",
                                    children: "⚠️ Bocor > 50%"
                                })
                            ]
                        }),
                        r.jsxs("span", {
                            className: "text-[10px] text-slate-400 font-medium",
                            children: [`Menampilkan ${We.length} dari ${_t.length} tag`]
                        })
                    ]
                }), r.jsx("div", {
                    id: "step-table",
                    ref: Vn,
                    onMouseDown: wr,
                    onMouseLeave: jr,
                    onMouseUp: kn,
                    onMouseMove: ba,
                    className: `overflow-y-auto overflow-x-auto select-none max-h-[70vh] pb-2 relative ${zs?"cursor-grabbing":"cursor-grab"} z-10`,
                    children: r.jsxs("table", {
                        className: "w-full text-[10px] md:text-[11px] text-center border-separate border-spacing-0",
                        children: [r.jsx("thead", {
                            className: "leading-tight",
                            children: (() => {
                                const i = (u, o, d, p = null) => {
                                    const g = sn.col === u;
                                    return r.jsx("th", {
                                        className: `${o} cursor-pointer select-none hover:brightness-95 transition-all`,
                                        onClick: () => js(k => ({
                                            col: u,
                                            dir: k.col === u && k.dir === "desc" ? "asc" : "desc"
                                        })),
                                        children: r.jsxs("div", {
                                            className: "flex flex-col items-center gap-0",
                                            children: [r.jsx("span", {
                                                children: d
                                            }), p && r.jsx("span", {
                                                className: "text-[8px] font-normal opacity-60 normal-case",
                                                children: p
                                            }), r.jsx("span", {
                                                className: `text-[9px] leading-none mt-0.5 ${g?"opacity-100":"opacity-25"}`,
                                                children: g ? sn.dir === "asc" ? "▲" : "▼" : "⇅"
                                            })]
                                        })
                                    })
                                };
                                return r.jsxs("tr", {
                                    children: [r.jsx("th", {
                                        id: "step-tag-col-header",
                                        className: "px-3 py-2.5 text-left border-r border-b border-slate-200 sticky top-0 left-0 z-30 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider lg:w-[15%]",
                                        children: "Tag & Campaign"
                                    }), i("amountSpent", "px-2 py-2.5 border-b-2 border-violet-200 bg-violet-50/80 text-violet-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Ad Spend"), r.jsx("th", {
                                        className: "px-2 py-2.5 border-b-2 border-violet-200 bg-violet-50/80 text-violet-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider",
                                        children: "PPN"
                                    }), i("metaClicks", "px-2 py-2.5 border-b-2 border-violet-200 bg-violet-50/80 text-violet-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Klik", "Meta"), i("cpr", "px-2 py-2.5 border-b-2 border-violet-200 bg-violet-50/80 text-violet-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "CPR"), i("ctr", "px-2 py-2.5 border-b-2 border-violet-200 border-r border-slate-200 bg-violet-50/80 text-violet-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "CTR"), i("shopeeClicks", "px-2 py-2.5 border-b-2 border-orange-200 bg-orange-50/70 text-orange-500 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Klik", "Shopee"), i("shopeeOrders", "px-2 py-2.5 border-b-2 border-orange-200 bg-orange-50/70 text-orange-500 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Pesanan"), i("shopeeCommission", "px-2 py-2.5 border-b-2 border-orange-200 border-r border-slate-200 bg-orange-50/70 text-orange-500 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Komisi"), i("rateLinkShopee", "px-2 py-2.5 border-b-2 border-sky-200 bg-sky-50/70 text-sky-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Rate", "→ Shopee"), i("rateShopeeOrder", "px-2 py-2.5 border-b-2 border-sky-200 border-r border-slate-200 bg-sky-50/70 text-sky-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Rate", "→ Order"), i("keuntungan", "px-2 py-2.5 border-b-2 border-emerald-200 bg-emerald-50/70 text-emerald-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "Profit"), i("roi", "px-2 py-2.5 border-b-2 border-emerald-200 border-r border-slate-200 bg-emerald-50/70 text-emerald-600 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider", "ROI"), r.jsxs("th", {
                                        className: "px-2 py-2.5 border-b-2 border-slate-200 bg-slate-50 text-slate-400 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider",
                                        children: ["Statistik", r.jsx("br", {}), r.jsx("span", {
                                            className: "text-[8px] font-normal opacity-60 normal-case",
                                            children: "Komisi"
                                        })]
                                    }), r.jsxs("th", {
                                        className: "px-2 py-2.5 border-b-2 border-slate-200 bg-slate-50 text-slate-400 font-bold text-[10px] sticky top-0 z-20 uppercase tracking-wider",
                                        children: ["Jeda", r.jsx("br", {}), r.jsx("span", {
                                            className: "text-[8px] font-normal opacity-60 normal-case",
                                            children: "Waktu Order"
                                        })]
                                    })]
                                })
                            })()
                        }), r.jsx("tbody", {
                            className: "bg-white relative z-0",
                            children: Ts.length === 0 ? r.jsx("tr", {
                                children: r.jsx("td", {
                                    colSpan: "15",
                                    className: "px-3 py-24 text-center",
                                    children: r.jsxs("div", {
                                        className: "flex flex-col items-center justify-center text-slate-300",
                                        children: [r.jsx(pa, {
                                            size: 44,
                                            className: "mb-3"
                                        }), r.jsx("h3", {
                                            className: "text-base font-bold text-slate-500 mb-1",
                                            children: ln.trim() && We.length > 0 ? "Tidak Ditemukan" : "Tabel Masih Kosong"
                                        }), ln.trim() && We.length > 0 ? r.jsxs("p", {
                                            className: "text-xs text-slate-400",
                                            children: ['Tidak ada tag atau campaign yang cocok dengan "', r.jsx("b", {
                                                children: ln.trim()
                                            }), '".']
                                        }) : r.jsxs("p", {
                                            className: "text-xs text-slate-400",
                                            children: ["Pilih dan ", r.jsx("b", {
                                                children: "Tambah Tag"
                                            }), " lewat dropdown di atas."]
                                        })]
                                    })
                                })
                            }) : Ts.map((i, u) => {
                                let o = "-";
                                i.roi === 1 / 0 ? o = "∞" : (typeof i.roi === "number" && !isNaN(i.roi) && (i.totalSpentWithPpn || i.amountSpent || 0) > 0) ? o = `${i.roi.toFixed(2)}%` : o = "0%";
                                let d = i.rateLinkShopee === 1 / 0 ? "∞" : (typeof i.rateLinkShopee === "number" && !isNaN(i.rateLinkShopee) ? `${i.rateLinkShopee.toFixed(2)}%` : "0%");
                                const tagSpend = i.totalSpentWithPpn || i.amountSpent || 0;
                                const tagRoas = i.roas !== undefined ? i.roas : (tagSpend > 0 ? (i.shopeeCommission || 0) / tagSpend : 0);
                                const tagLeakageVal = i.leakagePct !== undefined ? Math.round(i.leakagePct) : (i.metaClicks > 0 ? Math.round(Math.max(0, (i.metaClicks - (i.shopeeClicks || 0)) / i.metaClicks * 100)) : 0);
                                const tagCprc = (i.shopeeClicks || 0) > 0 ? tagSpend / i.shopeeClicks : (i.metaClicks > 0 ? tagSpend / i.metaClicks : 0);
                                const tagEpc = (i.shopeeClicks || 0) > 0 ? (i.shopeeCommission || 0) / i.shopeeClicks : 0;
                                const tagCookieMargin = tagEpc - tagCprc;
                                const tagInsight = getAffiliateInsight({
                                    roas: tagRoas,
                                    cpr: i.cpr,
                                    cprc: tagCprc,
                                    epc: tagEpc,
                                    leakage: tagLeakageVal,
                                    spend: tagSpend,
                                    clicks: i.metaClicks,
                                    shopeeClicks: i.shopeeClicks,
                                    commission: i.shopeeCommission,
                                    profit: i.keuntungan,
                                    daysActive: i.clickDates ? i.clickDates.length : undefined
                                });
                                const p = u % 2 === 0;
                                return r.jsxs("tr", {
                                    className: "group transition-colors duration-100 relative z-0",
                                    children: [r.jsxs("td", {
                                        className: `px-3 py-2 align-top border-r border-b border-slate-100 sticky left-0 z-10 text-left shadow-[1px_0_4px_-2px_rgba(0,0,0,0.06)] ${p?"bg-white group-hover:bg-indigo-50/40":"bg-slate-50/60 group-hover:bg-indigo-50/40"}`,
                                        children: [r.jsxs("div", {
                                            className: "flex justify-between items-start gap-1 mb-2",
                                            children: [r.jsxs("button", {
                                                onClick: g => {
                                                    g.stopPropagation(), Ee(i.tag)
                                                },
                                                className: "group/tag flex-1 min-w-0",
                                                children: [r.jsxs("span", {
                                                    className: "inline-flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all shadow-sm shadow-indigo-200 max-w-full",
                                                    children: [r.jsx(cr, {
                                                        size: 10,
                                                        className: "flex-shrink-0"
                                                    }), r.jsx("span", {
                                                        className: "truncate",
                                                        children: i.tag || "<Tanpa Tag>"
                                                    })]
                                                }), r.jsx("span", {
                                                    className: "block text-[8.5px] text-indigo-400 mt-1 ml-0.5 group-hover/tag:text-indigo-500 transition-colors",
                                                    children: "Klik untuk lihat rincian harian →"
                                                })]
                                            }), r.jsx("button", {
                                                onClick: g => {
                                                    g.stopPropagation(), Ue(We.filter(k => k !== i.tag))
                                                },
                                                className: "w-5 h-5 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-all flex-shrink-0 mt-0.5",
                                                title: "Hapus dari tabel",
                                                children: r.jsx(It, {
                                                    size: 11
                                                })
                                            })]
                                        }), r.jsxs("div", {
                                            className: "mb-2 flex flex-wrap items-center gap-1.5",
                                            children: [
                                                r.jsx("span", {
                                                    className: `inline-flex items-center text-[9px] font-black px-2.5 py-0.5 rounded-full border shadow-xs cursor-help transition-transform hover:scale-105 ${tagInsight.badgeCls}`,
                                                    title: `${tagInsight.description} → Tindakan: ${tagInsight.action}`,
                                                    children: tagInsight.label
                                                }),
                                                (i.shopeeClicks > 0 || tagSpend > 0) && r.jsxs("span", {
                                                    className: `inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                                                        tagCookieMargin >= 0
                                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                                    }`,
                                                    title: `CPRC: Rp ${Math.round(tagCprc)} | EPC: Rp ${Math.round(tagEpc)} | Margin: ${tagCookieMargin >= 0 ? '+' : ''}Rp ${Math.round(tagCookieMargin)} per cookie`,
                                                    children: [
                                                        "🍪 CPRC: ",
                                                        J(Math.round(tagCprc)),
                                                        " • EPC: ",
                                                        J(Math.round(tagEpc))
                                                    ]
                                                })
                                            ]
                                        }), r.jsx("div", {
                                            className: "flex flex-wrap gap-1 mb-1.5",
                                            children: i.linkedCampaigns.map(g => {
                                                const isAdset = g.startsWith("adset:");
                                                const isAd = g.startsWith("ad:");
                                                const isCamp = g.startsWith("campaign:");
                                                const displayName = isAdset ? g.slice(6) : isAd ? g.slice(3) : isCamp ? g.slice(9) : g;
                                                const badgeLabel = isAdset ? "SET" : isAd ? "ADS" : "CAMP";
                                                const badgeCls = isAdset
                                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                                    : isAd
                                                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                                    : "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800";
                                                const pillCls = isAdset
                                                    ? "bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"
                                                    : isAd
                                                    ? "bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                                                    : "bg-violet-200/80 dark:bg-violet-800 text-violet-900 dark:text-violet-100";
                                                return r.jsxs("span", {
                                                    className: `inline-flex items-center gap-1.5 border text-[8.5px] pl-1 pr-1.5 py-0.5 rounded-full max-w-full font-medium transition-all shadow-2xs ${badgeCls}`,
                                                    children: [r.jsx("span", {
                                                        className: `text-[7px] font-black uppercase tracking-wider px-1 py-0.2 rounded ${pillCls}`,
                                                        children: badgeLabel
                                                    }), r.jsx("span", {
                                                        className: "truncate max-w-[110px]",
                                                        title: `${badgeLabel}: ${displayName}`,
                                                        children: displayName
                                                    }), r.jsx("button", {
                                                        type: "button",
                                                        onClick: (e) => { e.stopPropagation(); Ms(i.tag, g); },
                                                        className: "hover:text-rose-500 focus:outline-none flex-shrink-0 cursor-pointer opacity-70 hover:opacity-100",
                                                        title: "Hapus kaitan",
                                                        children: r.jsx(It, {
                                                            size: 7
                                                        })
                                                    })]
                                                }, g)
                                            })
                                        }), i.linkedCampaigns.length === 0 && Q.length > 0 && r.jsxs("div", {
                                            className: "flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mb-1.5",
                                            children: [r.jsx(Ji, {
                                                size: 10,
                                                className: "text-amber-400 flex-shrink-0 mt-px"
                                            }), r.jsx("p", {
                                                className: "text-[8.5px] text-amber-700 leading-snug font-medium",
                                                children: "Kaitkan Campaign, Ad Set (1-5-1), atau Ads (1-1-5) di bawah agar Ad Spend, Klik, & Profit muncul."
                                            })]
                                        }), r.jsx("div", {
                                            className: "relative",
                                            onMouseDown: g => g.stopPropagation(),
                                            children: r.jsx(Wt, {
                                                size: "xs",
                                                className: "w-full",
                                                searchable: !0,
                                                menuMinWidth: 300,
                                                tone: i.linkedCampaigns.length === 0 && Q.length > 0 ? "amber" : "indigo",
                                                placeholder: "+ Kaitkan Ads / Set / Campaign...",
                                                searchPlaceholder: "Cari campaign, ad set, atau ads...",
                                                emptyText: Q.length === 0 ? "Upload data Meta Ads terlebih dahulu" : "Tidak ada campaign/adset/ads tersisa",
                                                onChange: g => vl(i.tag, g),
                                                options: getOptionsForTag(i.linkedCampaigns)
                                            })
                                        }), r.jsx("button", {
                                            type: "button",
                                            onClick: (g) => {
                                                g.stopPropagation();
                                                setPlacementDrilldownTag(i);
                                                setModalDrilldownTab("placement");
                                                setModalSubItemFilter("all");
                                            },
                                            className: "mt-1.5 w-full inline-flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-[9px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer shadow-2xs group",
                                            title: "Buka Analisis Penempatan & Rincian Performa Harian untuk tag ini",
                                            children: [
                                                r.jsxs("span", {
                                                    className: "inline-flex items-center gap-1",
                                                    children: [
                                                        r.jsx(Pu, { size: 10, className: "text-indigo-500 group-hover:scale-110 transition-transform" }),
                                                        "📊 Detail Harian & Placement"
                                                    ]
                                                }),
                                                i.metaClicks > 0 && r.jsx("span", {
                                                    className: `text-[7.5px] px-1 py-0.2 rounded font-extrabold ${
                                                        (i.metaClicks > 0 ? Math.max(0, (i.metaClicks - (i.shopeeClicks || 0)) / i.metaClicks * 100) : 0) > 40
                                                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                                                    }`,
                                                    children: `Bocor ${(i.metaClicks > 0 ? Math.max(0, (i.metaClicks - (i.shopeeClicks || 0)) / i.metaClicks * 100) : 0).toFixed(0)}%`
                                                })
                                            ]
                                        }), r.jsx("button", {
                                            type: "button",
                                            onClick: (g) => {
                                                g.stopPropagation();
                                                setBreakdownScopeType("tag");
                                                setBreakdownSelectedKey(i.tag);
                                                De("dashboard");
                                                setTimeout(() => {
                                                    const el = document.getElementById("dashboard-breakdown-section");
                                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }, 150);
                                            },
                                            className: "mt-1 w-full inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer",
                                            title: "Filter dan buka di Dashboard Utama",
                                            children: [
                                                r.jsx(bu, { size: 9 }),
                                                "Cek di Dashboard"
                                            ]
                                        })]
                                    }), r.jsx("td", {
                                        className: Rt(i.amountSpent, "amountSpent", `border-b border-slate-100 ${p?"bg-violet-50/20 group-hover:bg-violet-50/60":"bg-violet-50/30 group-hover:bg-violet-50/70"}`),
                                        children: r.jsx("div", {
                                            className: "font-bold text-violet-800",
                                            children: J(i.amountSpent)
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.ppn, "ppn", `border-b border-slate-100 ${p?"bg-violet-50/20 group-hover:bg-violet-50/60":"bg-violet-50/30 group-hover:bg-violet-50/70"}`),
                                        children: r.jsx("div", {
                                            className: "font-semibold text-violet-500",
                                            children: J(i.ppn)
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.metaClicks, "metaClicks", `border-b border-slate-100 ${p?"bg-violet-50/20 group-hover:bg-violet-50/60":"bg-violet-50/30 group-hover:bg-violet-50/70"}`),
                                        children: r.jsx("div", {
                                            className: "font-bold text-slate-700",
                                            children: ke(i.metaClicks)
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.cpr, "cpr", `border-b border-slate-100 ${p?"bg-violet-50/20 group-hover:bg-violet-50/60":"bg-violet-50/30 group-hover:bg-violet-50/70"}`),
                                        children: r.jsx("div", {
                                            className: "font-bold text-slate-700",
                                            children: J(i.cpr)
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.ctr, "ctr", `border-b border-r border-slate-100 ${p?"bg-violet-50/20 group-hover:bg-violet-50/60":"bg-violet-50/30 group-hover:bg-violet-50/70"}`),
                                        children: r.jsxs("div", {
                                            className: "font-bold text-slate-700",
                                            children: [typeof i.ctr === "number" && !isNaN(i.ctr) ? i.ctr.toFixed(2) : "0.00", "%"]
                                        })
                                    }), r.jsxs("td", {
                                        className: Rt(i.shopeeClicks, "shopeeClicks", `border-b border-slate-100 ${p?"bg-orange-50/20 group-hover:bg-orange-50/50":"bg-orange-50/30 group-hover:bg-orange-50/60"}`),
                                        children: [r.jsx("div", {
                                            className: "font-bold text-orange-600",
                                            children: ke(i.shopeeClicks)
                                        }), i.minClick && r.jsxs("div", {
                                            className: "text-[7.5px] mt-0.5 text-slate-400 leading-none",
                                            children: [xt(i.minClick), " – ", xt(i.maxClick)]
                                        })]
                                    }), r.jsxs("td", {
                                        className: Rt(i.shopeeOrders, "shopeeOrders", `border-b border-slate-100 ${p?"bg-orange-50/20 group-hover:bg-orange-50/50":"bg-orange-50/30 group-hover:bg-orange-50/60"}`),
                                        children: [r.jsxs("div", {
                                            className: "flex items-center justify-center gap-1.5",
                                            children: [r.jsx("div", {
                                                className: "font-bold text-orange-600",
                                                children: ke(i.shopeeOrders)
                                            }), i.clickDates && i.clickDates.length > 0 && r.jsx("button", {
                                                onClick: () => Z({
                                                    label: i.tag,
                                                    tag: i.tag,
                                                    clickDates: i.clickDates,
                                                    orderDate: null
                                                }),
                                                className: "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-500 ring-1 ring-amber-200 hover:bg-amber-400 hover:text-white hover:ring-amber-400 transition-all cursor-pointer flex-shrink-0",
                                                title: "Distribusi tanggal klik",
                                                children: r.jsx(cr, {
                                                    size: 9
                                                })
                                            })]
                                        }), i.minOrder && r.jsxs("div", {
                                            className: "text-[7.5px] mt-0.5 text-slate-400 leading-none",
                                            children: [xt(i.minOrder), " – ", xt(i.maxOrder)]
                                        })]
                                    }), r.jsx("td", {
                                        className: Rt(i.shopeeCommission, "shopeeCommission", `border-b border-r border-slate-100 ${p?"bg-orange-50/20 group-hover:bg-orange-50/50":"bg-orange-50/30 group-hover:bg-orange-50/60"}`),
                                        children: r.jsx("div", {
                                            className: "font-black text-[#ee4d2d]",
                                            children: J(i.shopeeCommission)
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.rateLinkShopee, "rateLinkShopee", `border-b border-slate-100 ${p?"bg-sky-50/20 group-hover:bg-sky-50/50":"bg-sky-50/30 group-hover:bg-sky-50/60"}`),
                                        children: r.jsx("div", {
                                            className: "font-bold text-sky-600",
                                            children: d
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.rateShopeeOrder, "rateShopeeOrder", `border-b border-r border-slate-100 ${p?"bg-sky-50/20 group-hover:bg-sky-50/50":"bg-sky-50/30 group-hover:bg-sky-50/60"}`),
                                        children: r.jsxs("div", {
                                            className: "font-bold text-sky-600",
                                            children: [typeof i.rateShopeeOrder === "number" && !isNaN(i.rateShopeeOrder) ? i.rateShopeeOrder.toFixed(2) : "0.00", "%"]
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.keuntungan, "keuntungan", `border-b border-slate-100 ${p?"bg-emerald-50/20 group-hover:bg-emerald-50/50":"bg-emerald-50/30 group-hover:bg-emerald-50/60"}`),
                                        children: r.jsxs("div", {
                                            className: `font-black text-[11px] ${i.keuntungan>=0?"text-emerald-600":"text-rose-500"}`,
                                            children: [i.keuntungan < 0 && "−", J(Math.abs(i.keuntungan))]
                                        })
                                    }), r.jsx("td", {
                                        className: Rt(i.roi, "roi", `border-b border-r border-slate-100 ${p?"bg-emerald-50/20 group-hover:bg-emerald-50/50":"bg-emerald-50/30 group-hover:bg-emerald-50/60"}`),
                                        children: r.jsx("span", {
                                            className: `inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black ring-1 ${i.keuntungan>=0?"bg-emerald-50 text-emerald-700 ring-emerald-200":"bg-rose-50 text-rose-600 ring-rose-200"}`,
                                            children: o
                                        })
                                    }), r.jsx("td", {
                                        className: `px-2 py-2 align-middle border-b border-slate-100 text-[9px] ${p?"bg-white group-hover:bg-slate-50/80":"bg-slate-50/40 group-hover:bg-slate-50/80"}`,
                                        children: i.shopeeOrders > 0 ? r.jsxs("div", {
                                            className: "flex flex-col gap-0.5 w-full max-w-[90px] mx-auto text-left",
                                            children: [r.jsxs("div", {
                                                className: "flex justify-between gap-1",
                                                children: [r.jsx("span", {
                                                    className: "text-slate-300 font-medium",
                                                    children: "Avg"
                                                }), r.jsx("span", {
                                                    className: "font-semibold text-slate-600",
                                                    children: J(i.avgComm)
                                                })]
                                            }), r.jsxs("div", {
                                                className: "flex justify-between gap-1",
                                                children: [r.jsx("span", {
                                                    className: "text-slate-300 font-medium",
                                                    children: "Max"
                                                }), r.jsx("span", {
                                                    className: "font-semibold text-emerald-500",
                                                    children: J(i.maxComm)
                                                })]
                                            }), r.jsxs("div", {
                                                className: "flex justify-between gap-1",
                                                children: [r.jsx("span", {
                                                    className: "text-slate-300 font-medium",
                                                    children: "Min"
                                                }), r.jsx("span", {
                                                    className: "font-semibold text-rose-400",
                                                    children: J(i.minComm)
                                                })]
                                            })]
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: `px-2 py-2 align-middle border-b border-slate-100 text-[9px] ${p?"bg-white group-hover:bg-slate-50/80":"bg-slate-50/40 group-hover:bg-slate-50/80"}`,
                                        children: i.shopeeOrders > 0 ? r.jsxs("div", {
                                            className: "flex flex-col gap-0.5 w-full max-w-[90px] mx-auto text-left",
                                            children: [r.jsxs("div", {
                                                className: "flex justify-between gap-1",
                                                children: [r.jsx("span", {
                                                    className: "text-slate-300 font-medium",
                                                    children: "Cepat"
                                                }), r.jsx("span", {
                                                    className: "font-semibold text-emerald-500",
                                                    children: Cs(i.minDiff)
                                                })]
                                            }), r.jsxs("div", {
                                                className: "flex justify-between gap-1",
                                                children: [r.jsx("span", {
                                                    className: "text-slate-300 font-medium",
                                                    children: "Lama"
                                                }), r.jsx("span", {
                                                    className: "font-semibold text-rose-400",
                                                    children: Cs(i.maxDiff)
                                                })]
                                            })]
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    })]
                                }, i.tag || u)
                            })
                        })]
                    })
                })]
            }), ve === "analytics" && (be.length === 0 ? r.jsxs("div", {
                className: "bg-white p-12 rounded-3xl card-fx border border-slate-200/70 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300",
                children: [r.jsx("div", {
                    className: "w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4",
                    children: r.jsx(or, {
                        className: "text-amber-500 w-10 h-10"
                    })
                }), r.jsx("h2", {
                    className: "text-xl font-bold text-slate-800 mb-2",
                    children: "Data Analitik Belum Tersedia"
                }), r.jsxs("p", {
                    className: "text-slate-500 max-w-md",
                    children: ["Silakan upload file ", r.jsx("b", {
                        className: "text-indigo-600",
                        children: "Laporan Pesanan Affiliate"
                    }), " Anda di menu Import Data terlebih dahulu untuk membuka kunci fitur analitik mendalam ini."]
                })]
            }) : r.jsxs("div", {
                id: "step-analytics",
                className: "grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
                children: [r.jsxs("div", {
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 lg:col-span-1",
                    children: [r.jsxs("div", {
                        className: "flex flex-col mb-6 border-b border-slate-100 pb-4 gap-4",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [r.jsx(Pu, {
                                className: "text-indigo-500",
                                size: 20
                            }), r.jsx("h2", {
                                className: "text-md font-bold text-slate-800",
                                children: "Kategori Terlaris"
                            })]
                        }), r.jsx(Wt, {
                            className: "w-full",
                            searchPlaceholder: "Cari nama tag...",
                            value: P,
                            onChange: te,
                            options: [{
                                value: "all",
                                label: "Semua Tag"
                            }, ...jt]
                        })]
                    }), r.jsx("div", {
                        className: "flex flex-col gap-4 pt-1 max-h-[300px] overflow-y-auto pr-2",
                        children: Ds.length === 0 ? r.jsx("p", {
                            className: "text-center text-sm text-slate-400 mt-4",
                            children: "Belum ada data kategori."
                        }) : Ds.map((i, u) => r.jsxs("div", {
                            children: [r.jsxs("div", {
                                className: "flex justify-between text-xs mb-1.5",
                                children: [r.jsxs("span", {
                                    className: "font-bold text-slate-700 truncate pr-2",
                                    title: i.category,
                                    children: [u + 1, ". ", i.category]
                                }), r.jsx("span", {
                                    className: "text-emerald-600 font-bold whitespace-nowrap",
                                    children: J(i.commission)
                                })]
                            }), r.jsx("div", {
                                className: "flex justify-between text-[10px] text-slate-500 mb-1 font-medium",
                                children: r.jsxs("span", {
                                    children: [ke(i.orders), " Pesanan"]
                                })
                            }), r.jsx("div", {
                                className: "w-full bg-slate-100 rounded-full h-2.5",
                                children: r.jsx("div", {
                                    className: "bg-indigo-400 h-2.5 rounded-full transition-all",
                                    style: {
                                        width: `${i.orders/Es*100}%`
                                    }
                                })
                            })]
                        }, u))
                    })]
                }), r.jsxs("div", {
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 lg:col-span-1",
                    children: [r.jsxs("div", {
                        className: "flex flex-col mb-6 border-b border-slate-100 pb-4 gap-4",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [r.jsx(Du, {
                                className: "text-blue-500",
                                size: 20
                            }), r.jsx("h2", {
                                className: "text-md font-bold text-slate-800",
                                children: "Sumber Platform"
                            })]
                        }), r.jsx(Wt, {
                            className: "w-full",
                            searchPlaceholder: "Cari nama tag...",
                            value: ee,
                            onChange: ae,
                            options: [{
                                value: "all",
                                label: "Semua Tag"
                            }, ...jt]
                        })]
                    }), r.jsx("div", {
                        className: "flex flex-col gap-4 pt-1 max-h-[300px] overflow-y-auto pr-2",
                        children: Xr.length === 0 ? r.jsx("p", {
                            className: "text-center text-sm text-slate-400 mt-4",
                            children: "Belum ada data platform."
                        }) : Xr.map((i, u) => r.jsxs("div", {
                            children: [r.jsxs("div", {
                                className: "flex justify-between text-xs mb-1.5",
                                children: [r.jsxs("span", {
                                    className: "font-bold text-slate-700 truncate pr-2",
                                    title: i.platform,
                                    children: [u + 1, ". ", i.platform]
                                }), r.jsx("span", {
                                    className: "text-emerald-600 font-bold whitespace-nowrap",
                                    children: J(i.commission)
                                })]
                            }), r.jsx("div", {
                                className: "flex justify-between text-[10px] text-slate-500 mb-1 font-medium",
                                children: r.jsxs("span", {
                                    children: [ke(i.orders), " Pesanan"]
                                })
                            }), r.jsx("div", {
                                className: "w-full bg-slate-100 rounded-full h-2.5",
                                children: r.jsx("div", {
                                    className: "bg-blue-400 h-2.5 rounded-full transition-all",
                                    style: {
                                        width: `${i.orders/Rs*100}%`
                                    }
                                })
                            })]
                        }, u))
                    })]
                }), r.jsxs("div", {
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 lg:col-span-1",
                    children: [r.jsxs("div", {
                        className: "flex flex-col mb-6 border-b border-slate-100 pb-4 gap-4",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [r.jsx(ol, {
                                className: "text-violet-500",
                                size: 20
                            }), r.jsx("h2", {
                                className: "text-md font-bold text-slate-800",
                                children: "Sumber Klik per Platform"
                            })]
                        }), r.jsx(Wt, {
                            className: "w-full",
                            searchPlaceholder: "Cari nama tag...",
                            value: ne,
                            onChange: ge,
                            options: [{
                                value: "all",
                                label: "Semua Tag"
                            }, ...jt]
                        })]
                    }), r.jsx("div", {
                        className: "flex flex-col gap-4 pt-1 max-h-[300px] overflow-y-auto pr-2",
                        children: Dn.length === 0 ? r.jsx("p", {
                            className: "text-center text-sm text-slate-400 mt-4",
                            children: "Belum ada data klik."
                        }) : Dn.map((i, u) => {
                            const o = (i.clicks / ka * 100).toFixed(0);
                            return r.jsxs("div", {
                                children: [r.jsxs("div", {
                                    className: "flex justify-between text-xs mb-1.5",
                                    children: [r.jsxs("span", {
                                        className: "font-bold text-slate-700 truncate pr-2",
                                        title: i.platform,
                                        children: [u + 1, ". ", i.platform]
                                    }), r.jsxs("span", {
                                        className: "text-violet-600 font-bold whitespace-nowrap",
                                        children: [ke(i.clicks), " klik"]
                                    })]
                                }), r.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [r.jsx("div", {
                                        className: "flex-1 bg-slate-100 rounded-full h-2.5",
                                        children: r.jsx("div", {
                                            className: "bg-violet-400 h-2.5 rounded-full transition-all",
                                            style: {
                                                width: `${o}%`
                                            }
                                        })
                                    }), r.jsxs("span", {
                                        className: "text-[10px] text-slate-400 font-medium w-7 text-right",
                                        children: [o, "%"]
                                    })]
                                })]
                            }, u)
                        })
                    })]
                }), r.jsxs("div", {
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 lg:col-span-1",
                    children: [r.jsxs("div", {
                        className: "flex items-center gap-2 mb-6 border-b border-slate-100 pb-4",
                        children: [r.jsx(wu, {
                            className: "text-rose-500",
                            size: 20
                        }), r.jsx("h2", {
                            className: "text-md font-bold text-slate-800",
                            children: "Status Pesanan"
                        })]
                    }), r.jsx("div", {
                        className: "flex flex-col gap-5 pt-2",
                        children: Pe.data.map((i, u) => {
                            const o = (i.count / Pe.total * 100).toFixed(1);
                            let d = "bg-blue-400";
                            return i.status.toLowerCase().includes("selesai") ? d = "bg-emerald-500" : i.status.toLowerCase().includes("tertunda") ? d = "bg-amber-400" : (i.status.toLowerCase().includes("batal") || i.status.toLowerCase().includes("gagal")) && (d = "bg-rose-500"), r.jsxs("div", {
                                children: [r.jsxs("div", {
                                    className: "flex justify-between text-xs mb-1.5",
                                    children: [r.jsx("span", {
                                        className: "font-medium text-slate-700",
                                        children: i.status
                                    }), r.jsxs("div", {
                                        className: "text-right",
                                        children: [r.jsx("span", {
                                            className: "text-slate-800 font-bold",
                                            children: i.count
                                        }), " ", r.jsxs("span", {
                                            className: "text-slate-500 font-medium",
                                            children: ["(", o, "%)"]
                                        })]
                                    })]
                                }), r.jsx("div", {
                                    className: "w-full bg-slate-100 rounded-full h-2.5",
                                    children: r.jsx("div", {
                                        className: `${d} h-2.5 rounded-full transition-all`,
                                        style: {
                                            width: `${o}%`
                                        }
                                    })
                                })]
                            }, u)
                        })
                    })]
                }), r.jsxs("div", {
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 lg:col-span-4",
                    children: [r.jsxs("div", {
                        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [r.jsx(ha, {
                                className: "text-orange-500",
                                size: 20
                            }), r.jsx("h2", {
                                className: "text-md font-bold text-slate-800",
                                children: "Tren Klik & Pesanan per Tag"
                            })]
                        }), r.jsxs("div", {
                            className: "flex flex-wrap items-center gap-3",
                            children: [r.jsxs("div", {
                                className: "flex items-center gap-2 text-[10px] font-medium bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100",
                                children: [r.jsxs("span", {
                                    className: "flex items-center gap-1",
                                    children: [r.jsx("span", {
                                        className: "w-2.5 h-2.5 rounded-sm bg-blue-400"
                                    }), " Klik Shopee"]
                                }), r.jsxs("span", {
                                    className: "flex items-center gap-1",
                                    children: [r.jsx("span", {
                                        className: "w-2.5 h-2.5 rounded-sm bg-orange-400"
                                    }), " Pesanan"]
                                })]
                            }), r.jsx(Wt, {
                                className: "w-[150px]",
                                menuMinWidth: 260,
                                placeholder: "Pilih tag",
                                searchPlaceholder: "Cari nama tag...",
                                emptyText: "Belum ada data",
                                value: yr,
                                onChange: C,
                                options: jt
                            })]
                        })]
                    }), r.jsx("div", {
                        ref: Cn,
                        className: "flex items-end gap-3 h-64 overflow-x-auto pb-4 pt-6 px-10 smooth-scroll",
                        children: Hn.map((i, u) => {
                            const o = i.clicks > 0 ? (i.orders / i.clicks * 100).toFixed(1) : 0;
                            return r.jsxs("div", {
                                className: "flex flex-col items-center gap-2 flex-shrink-0 group relative hover:z-50",
                                children: [r.jsxs("div", {
                                    className: "w-14 h-44 bg-slate-50/50 rounded flex items-end justify-center gap-0.5 hover:bg-slate-100 transition-colors relative px-1 border-b border-slate-200",
                                    children: [r.jsx("div", {
                                        className: "w-1/2 bg-blue-400 rounded-t transition-all shadow-sm",
                                        style: {
                                            height: `${i.clicks/kr*100}%`,
                                            minHeight: "4px"
                                        }
                                    }), r.jsx("div", {
                                        className: "w-1/2 bg-orange-400 rounded-t transition-all shadow-sm",
                                        style: {
                                            height: `${i.orders/kr*100}%`,
                                            minHeight: "4px"
                                        }
                                    }), r.jsxs("div", {
                                        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-800/95 backdrop-blur-sm text-white text-[9px] py-1.5 px-2.5 rounded whitespace-nowrap z-[100] shadow-xl border border-slate-700 pointer-events-none",
                                        children: [r.jsx("span", {
                                            className: "font-bold text-[10px] mb-1 border-b border-slate-600 pb-0.5 text-center",
                                            children: qt(new Date(i.date))
                                        }), r.jsxs("div", {
                                            className: "flex justify-between gap-4 mb-0.5",
                                            children: [r.jsx("span", {
                                                className: "text-blue-300",
                                                children: "Klik:"
                                            }), r.jsx("span", {
                                                className: "font-bold",
                                                children: ke(i.clicks)
                                            })]
                                        }), r.jsxs("div", {
                                            className: "flex justify-between gap-4 mb-1 border-b border-slate-600 pb-1",
                                            children: [r.jsx("span", {
                                                className: "text-orange-300",
                                                children: "Pesanan:"
                                            }), r.jsx("span", {
                                                className: "font-bold",
                                                children: ke(i.orders)
                                            })]
                                        }), r.jsxs("div", {
                                            className: "flex justify-between gap-4 font-bold text-[10px] text-teal-400",
                                            children: [r.jsx("span", {
                                                children: "Rate Konversi:"
                                            }), r.jsxs("span", {
                                                children: [o, "%"]
                                            })]
                                        })]
                                    })]
                                }), r.jsx("span", {
                                    className: "text-[10px] text-slate-500 whitespace-nowrap font-medium",
                                    children: xt(i.date)
                                })]
                            }, u)
                        })
                    })]
                }), r.jsxs("div", {
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 lg:col-span-4",
                    children: [r.jsxs("div", {
                        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [r.jsx(il, {
                                className: "text-emerald-500",
                                size: 20
                            }), r.jsx("h2", {
                                className: "text-md font-bold text-slate-800",
                                children: "Tren Komisi per Tag (Harian)"
                            })]
                        }), r.jsxs("div", {
                            className: "flex flex-wrap items-center gap-3",
                            children: [r.jsx("div", {
                                className: "flex items-center gap-2 text-[10px] font-medium bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100",
                                children: r.jsxs("span", {
                                    className: "flex items-center gap-1",
                                    children: [r.jsx("span", {
                                        className: "w-2.5 h-2.5 rounded-sm bg-emerald-400"
                                    }), " Total Komisi Harian"]
                                })
                            }), r.jsx(Wt, {
                                className: "w-[200px] max-sm:w-[150px]",
                                menuMinWidth: 260,
                                placeholder: "Pilih tag",
                                searchPlaceholder: "Cari nama tag...",
                                emptyText: "Belum ada data",
                                value: xn,
                                onChange: x,
                                options: jt
                            })]
                        })]
                    }), r.jsx("div", {
                        ref: Ns,
                        className: "flex items-end gap-3 h-56 overflow-x-auto pb-4 pt-6 px-10 smooth-scroll",
                        children: Un.map((i, u) => r.jsxs("div", {
                            className: "flex flex-col items-center gap-2 flex-shrink-0 group relative hover:z-50",
                            children: [r.jsxs("div", {
                                className: "w-14 h-36 bg-slate-50/50 rounded flex items-end justify-center gap-0.5 hover:bg-slate-100 transition-colors relative px-1 border-b border-slate-200",
                                children: [r.jsx("div", {
                                    className: "w-full bg-emerald-400 rounded-t transition-all shadow-sm",
                                    style: {
                                        height: `${i.commission/ya*100}%`,
                                        minHeight: "4px"
                                    }
                                }), r.jsxs("div", {
                                    className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-800/95 backdrop-blur-sm text-white text-[9px] py-1.5 px-2.5 rounded whitespace-nowrap z-[100] shadow-xl border border-slate-700 pointer-events-none",
                                    children: [r.jsx("span", {
                                        className: "font-bold text-[10px] mb-1 border-b border-slate-600 pb-0.5 text-center",
                                        children: qt(new Date(i.date))
                                    }), r.jsxs("div", {
                                        className: "flex justify-between gap-4 mt-1 font-bold text-[10px] text-emerald-400",
                                        children: [r.jsx("span", {
                                            children: "Total Komisi:"
                                        }), r.jsx("span", {
                                            children: J(i.commission)
                                        })]
                                    })]
                                })]
                            }), r.jsx("span", {
                                className: "text-[10px] text-slate-500 whitespace-nowrap font-medium",
                                children: xt(i.date)
                            })]
                        }, u))
                    })]
                }), r.jsxs("div", {
                    className: "bg-white p-6 rounded-2xl card-fx border border-slate-200/70 lg:col-span-4",
                    children: [r.jsxs("div", {
                        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [r.jsx(Eu, {
                                className: "text-amber-500",
                                size: 20
                            }), r.jsx("h2", {
                                className: "text-md font-bold text-slate-800",
                                children: "Peringkat & Performa Tag"
                            })]
                        }), r.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [r.jsx("span", {
                                className: "text-xs font-medium text-slate-500",
                                children: "Periode:"
                            }), r.jsx(Wt, {
                                className: "min-w-[150px]",
                                placeholder: "Pilih periode",
                                searchPlaceholder: "Cari tanggal...",
                                value: de,
                                onChange: Fe,
                                options: [{
                                    value: "all",
                                    label: "Semua Waktu"
                                }, ...Et.length > 0 ? [{
                                    value: "7d",
                                    label: "7 Hari Terakhir"
                                }, {
                                    value: "30d",
                                    label: "30 Hari Terakhir"
                                }, {
                                    heading: "Pilih Tanggal Spesifik"
                                }] : [], ...Et.map(i => ({
                                    value: i,
                                    label: qt(new Date(i))
                                }))]
                            })]
                        })]
                    }), r.jsx("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 max-h-[500px] overflow-y-auto px-2 pb-4",
                        children: qr.length === 0 ? r.jsx("div", {
                            className: "col-span-full text-center py-10 text-slate-400 text-sm font-medium",
                            children: "Tidak ada aktivitas atau komisi tag pada periode yang dipilih."
                        }) : qr.map((i, u) => r.jsxs("div", {
                            className: "flex flex-col justify-center bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors shadow-sm",
                            children: [r.jsxs("div", {
                                className: "flex justify-between items-start mb-2",
                                children: [r.jsxs("span", {
                                    className: "font-bold text-slate-800 truncate pr-2 flex items-center gap-1.5",
                                    title: i.tag,
                                    children: [r.jsx("span", {
                                        className: `flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${u<3?"bg-amber-100 text-amber-600":"bg-slate-200 text-slate-500"}`,
                                        children: u + 1
                                    }), " ", i.tag || "<Tanpa Tag>"]
                                }), r.jsxs("div", {
                                    className: "text-right",
                                    children: [r.jsx("div", {
                                        className: "text-emerald-600 font-bold whitespace-nowrap leading-none",
                                        children: J(i.commission)
                                    }), r.jsx("div", {
                                        className: "text-[9px] text-slate-400 font-medium mt-1",
                                        children: "Komisi"
                                    })]
                                })]
                            }), r.jsxs("div", {
                                className: "grid grid-cols-2 gap-2 text-[10px] mb-3",
                                children: [r.jsxs("div", {
                                    className: "bg-white p-2 rounded border border-slate-100",
                                    children: [r.jsx("div", {
                                        className: "text-slate-400 mb-0.5",
                                        children: "Pesanan"
                                    }), r.jsx("div", {
                                        className: "font-bold text-slate-700",
                                        children: ke(i.orders)
                                    })]
                                }), r.jsxs("div", {
                                    className: "bg-white p-2 rounded border border-slate-100",
                                    children: [r.jsx("div", {
                                        className: "text-slate-400 mb-0.5",
                                        children: "Spend (+PPN)"
                                    }), r.jsx("div", {
                                        className: "font-bold text-indigo-600",
                                        children: J(i.spend)
                                    })]
                                })]
                            }), r.jsxs("div", {
                                className: "flex justify-between items-center text-xs pt-2 border-t border-slate-200/60",
                                children: [r.jsx("span", {
                                    className: "font-medium text-slate-500 text-[10px]",
                                    children: "Keuntungan:"
                                }), r.jsxs("span", {
                                    className: `font-bold ${i.profit>=0?"text-emerald-500":"text-rose-500"}`,
                                    children: [i.profit < 0 ? "- " : "+ ", " ", J(Math.abs(i.profit))]
                                })]
                            })]
                        }, u))
                    })]
                })]
            })), ve === "monthly" && r.jsx("div", {
                className: "animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6",
                children: j.length === 0 ? r.jsxs("div", {
                    className: "bg-white p-12 rounded-2xl card-fx border border-slate-200/70 flex flex-col items-center text-center gap-4",
                    children: [r.jsx(Yi, {
                        size: 48,
                        className: "text-violet-300"
                    }), r.jsxs("div", {
                        children: [r.jsx("p", {
                            className: "text-lg font-bold text-slate-700",
                            children: "Belum ada data pesanan"
                        }), r.jsxs("p", {
                            className: "text-sm text-slate-500 mt-1",
                            children: ["Upload file ", r.jsx("b", {
                                children: "Laporan Pesanan Affiliate"
                            }), " di tab ", r.jsx("b", {
                                children: "Import Data"
                            }), " terlebih dahulu."]
                        })]
                    })]
                }) : r.jsxs(r.Fragment, {
                    children: [(() => {
                        const i = Zr.reduce((p, g) => ({
                                orders: p.orders + g.totalOrders,
                                selesai: p.selesai + g.selesai,
                                gagal: p.gagal + g.gagal,
                                lainnya: p.lainnya + g.tertunda + g.lain,
                                estimasi: p.estimasi + g.estimasiKomisi,
                                real: p.real + g.realKomisi
                            }), {
                                orders: 0,
                                selesai: 0,
                                gagal: 0,
                                lainnya: 0,
                                estimasi: 0,
                                real: 0
                            }),
                            u = i.orders > 0 ? i.selesai / i.orders * 100 : 0,
                            o = i.orders > 0 ? i.gagal / i.orders * 100 : 0,
                            d = i.orders > 0 ? i.lainnya / i.orders * 100 : 0;
                        return r.jsxs("div", {
                            className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
                            children: [r.jsxs("div", {
                                className: "bg-white p-5 rounded-2xl card-fx border border-slate-200/70",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [r.jsx(fa, {
                                        size: 16,
                                        className: "text-violet-500"
                                    }), r.jsx("span", {
                                        className: "text-xs font-semibold text-slate-500 uppercase tracking-wide",
                                        children: "Total Pesanan"
                                    })]
                                }), r.jsx("p", {
                                    className: "text-2xl font-black text-slate-800",
                                    children: ke(i.orders)
                                }), r.jsxs("p", {
                                    className: "text-xs text-slate-400 mt-1",
                                    children: [Zr.length, " bulan data"]
                                })]
                            }), r.jsxs("div", {
                                className: "bg-white p-5 rounded-2xl card-fx border border-slate-200/70",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [r.jsx(al, {
                                        size: 16,
                                        className: "text-emerald-500"
                                    }), r.jsx("span", {
                                        className: "text-xs font-semibold text-slate-500 uppercase tracking-wide",
                                        children: "Selesai"
                                    })]
                                }), r.jsxs("p", {
                                    className: "text-2xl font-black text-emerald-600",
                                    children: [u.toFixed(1), "%"]
                                }), r.jsxs("p", {
                                    className: "text-xs text-slate-400 mt-1",
                                    children: [ke(i.selesai), " pesanan"]
                                })]
                            }), r.jsxs("div", {
                                className: "bg-white p-5 rounded-2xl card-fx border border-slate-200/70",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [r.jsx(Mm, {
                                        size: 16,
                                        className: "text-rose-500"
                                    }), r.jsx("span", {
                                        className: "text-xs font-semibold text-slate-500 uppercase tracking-wide",
                                        children: "Gagal/Batal"
                                    })]
                                }), r.jsxs("p", {
                                    className: "text-2xl font-black text-rose-600",
                                    children: [o.toFixed(1), "%"]
                                }), r.jsxs("p", {
                                    className: "text-xs text-slate-400 mt-1",
                                    children: [ke(i.gagal), " pesanan"]
                                })]
                            }), r.jsxs("div", {
                                className: "bg-white p-5 rounded-2xl card-fx border border-slate-200/70",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [r.jsx(Pu, {
                                        size: 16,
                                        className: "text-slate-400"
                                    }), r.jsx("span", {
                                        className: "text-xs font-semibold text-slate-500 uppercase tracking-wide",
                                        children: "Lainnya"
                                    })]
                                }), r.jsxs("p", {
                                    className: "text-2xl font-black text-slate-600",
                                    children: [d.toFixed(1), "%"]
                                }), r.jsxs("p", {
                                    className: "text-xs text-slate-400 mt-1",
                                    children: [ke(i.lainnya), " pesanan"]
                                })]
                            }), r.jsxs("div", {
                                className: "bg-white p-5 rounded-2xl card-fx border border-slate-200/70",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [r.jsx(or, {
                                        size: 16,
                                        className: "text-amber-500"
                                    }), r.jsx("span", {
                                        className: "text-xs font-semibold text-slate-500 uppercase tracking-wide",
                                        children: "Estimasi Komisi"
                                    })]
                                }), r.jsx("p", {
                                    className: "text-lg font-black text-slate-800 leading-tight",
                                    children: J(i.estimasi)
                                }), r.jsx("p", {
                                    className: "text-xs text-slate-400 mt-1",
                                    children: "Semua status pesanan"
                                })]
                            }), r.jsxs("div", {
                                className: "bg-white p-5 rounded-2xl card-fx border border-slate-200/70",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [r.jsx(ym, {
                                        size: 16,
                                        className: "text-violet-600"
                                    }), r.jsx("span", {
                                        className: "text-xs font-semibold text-slate-500 uppercase tracking-wide",
                                        children: "Komisi Real"
                                    })]
                                }), r.jsx("p", {
                                    className: "text-lg font-black text-violet-700 leading-tight",
                                    children: J(i.real)
                                }), r.jsx("p", {
                                    className: "text-xs text-slate-400 mt-1",
                                    children: "Hanya pesanan selesai"
                                })]
                            })]
                        })
                    })(), r.jsxs("div", {
                        className: "bg-white rounded-2xl card-fx border border-slate-200/70 overflow-hidden",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-3 p-6 border-b border-slate-100",
                            children: [r.jsx(Yi, {
                                className: "text-violet-600",
                                size: 20
                            }), r.jsx("h2", {
                                className: "text-md font-bold text-slate-800",
                                children: "Rincian Per Bulan"
                            }), r.jsx("span", {
                                className: "ml-auto text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200",
                                children: "Diurutkan bulan terbaru"
                            })]
                        }), r.jsx("div", {
                            className: "overflow-x-auto",
                            children: r.jsxs("table", {
                                className: "w-full text-sm",
                                children: [r.jsx("thead", {
                                    children: r.jsxs("tr", {
                                        className: "bg-slate-50 border-b border-slate-200",
                                        children: [r.jsx("th", {
                                            className: "px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Bulan"
                                        }), r.jsx("th", {
                                            className: "px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Total Pesanan"
                                        }), r.jsx("th", {
                                            className: "px-4 py-3 text-center text-xs font-bold text-emerald-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Selesai"
                                        }), r.jsx("th", {
                                            className: "px-4 py-3 text-center text-xs font-bold text-rose-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Gagal / Batal"
                                        }), r.jsx("th", {
                                            className: "px-4 py-3 text-center text-xs font-bold text-amber-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Lainnya"
                                        }), r.jsx("th", {
                                            className: "px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Estimasi Komisi"
                                        }), r.jsx("th", {
                                            className: "px-4 py-3 text-center text-xs font-bold text-violet-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Komisi Real (Selesai)"
                                        }), r.jsx("th", {
                                            className: "px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap",
                                            children: "Selisih"
                                        })]
                                    })
                                }), r.jsx("tbody", {
                                    children: Zr.map((i, u) => {
                                        const o = i.estimasiKomisi - i.realKomisi,
                                            d = u % 2 === 0 ? "bg-white" : "bg-slate-50/50";
                                        return r.jsxs("tr", {
                                            className: `${d} border-b border-slate-100 hover:bg-violet-50/30 transition-colors`,
                                            children: [r.jsx("td", {
                                                className: "px-4 py-4 font-bold text-slate-800 whitespace-nowrap",
                                                children: r.jsxs("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [r.jsx("div", {
                                                        className: "w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"
                                                    }), Pn(i.month)]
                                                })
                                            }), r.jsx("td", {
                                                className: "px-4 py-4 text-center font-bold text-slate-700 text-base",
                                                children: ke(i.totalOrders)
                                            }), r.jsx("td", {
                                                className: "px-4 py-4 text-center",
                                                children: r.jsxs("div", {
                                                    className: "flex flex-col items-center gap-1",
                                                    children: [r.jsxs("span", {
                                                        className: "text-emerald-700 font-bold text-sm",
                                                        children: [i.selesaiPct.toFixed(1), "%"]
                                                    }), r.jsxs("span", {
                                                        className: "text-xs text-slate-400",
                                                        children: [ke(i.selesai), " pesanan"]
                                                    }), r.jsx("div", {
                                                        className: "w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden",
                                                        children: r.jsx("div", {
                                                            className: "h-full bg-emerald-500 rounded-full",
                                                            style: {
                                                                width: `${i.selesaiPct}%`
                                                            }
                                                        })
                                                    })]
                                                })
                                            }), r.jsx("td", {
                                                className: "px-4 py-4 text-center",
                                                children: r.jsxs("div", {
                                                    className: "flex flex-col items-center gap-1",
                                                    children: [r.jsxs("span", {
                                                        className: "text-rose-600 font-bold text-sm",
                                                        children: [i.gagalPct.toFixed(1), "%"]
                                                    }), r.jsxs("span", {
                                                        className: "text-xs text-slate-400",
                                                        children: [ke(i.gagal), " pesanan"]
                                                    }), r.jsx("div", {
                                                        className: "w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden",
                                                        children: r.jsx("div", {
                                                            className: "h-full bg-rose-500 rounded-full",
                                                            style: {
                                                                width: `${i.gagalPct}%`
                                                            }
                                                        })
                                                    })]
                                                })
                                            }), r.jsx("td", {
                                                className: "px-4 py-4 text-center",
                                                children: r.jsxs("div", {
                                                    className: "flex flex-col items-center gap-1",
                                                    children: [r.jsxs("span", {
                                                        className: "text-slate-600 font-bold text-sm",
                                                        children: [(i.totalOrders > 0 ? (i.tertunda + i.lain) / i.totalOrders * 100 : 0).toFixed(1), "%"]
                                                    }), r.jsxs("span", {
                                                        className: "text-xs text-slate-400",
                                                        children: [ke(i.tertunda + i.lain), " pesanan"]
                                                    }), r.jsx("div", {
                                                        className: "w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden",
                                                        children: r.jsx("div", {
                                                            className: "h-full bg-slate-400 rounded-full",
                                                            style: {
                                                                width: `${i.totalOrders>0?(i.tertunda+i.lain)/i.totalOrders*100:0}%`
                                                            }
                                                        })
                                                    })]
                                                })
                                            }), r.jsx("td", {
                                                className: "px-4 py-4 text-center font-semibold text-slate-700 whitespace-nowrap",
                                                children: J(i.estimasiKomisi)
                                            }), r.jsxs("td", {
                                                className: "px-4 py-4 text-center whitespace-nowrap",
                                                children: [r.jsx("span", {
                                                    className: "font-bold text-violet-700",
                                                    children: J(i.realKomisi)
                                                }), i.selesaiMinDate && r.jsxs("p", {
                                                    className: "text-[10px] text-slate-400 mt-0.5",
                                                    children: [xt(i.selesaiMinDate), i.selesaiMinDate !== i.selesaiMaxDate ? ` – ${xt(i.selesaiMaxDate)}` : ""]
                                                })]
                                            }), r.jsxs("td", {
                                                className: "px-4 py-4 text-center whitespace-nowrap",
                                                children: [r.jsxs("span", {
                                                    className: `font-semibold text-sm ${o>0?"text-amber-600":"text-slate-400"}`,
                                                    children: [o > 0 ? "-" : "", J(Math.abs(o))]
                                                }), o > 0 && r.jsx("p", {
                                                    className: "text-[10px] text-amber-500 mt-0.5",
                                                    children: "Gagal/Belum Cair"
                                                })]
                                            })]
                                        }, i.month)
                                    })
                                })]
                            })
                        }), r.jsx("div", {
                            className: "px-6 py-4 bg-slate-50/50 border-t border-slate-100",
                            children: r.jsxs("p", {
                                className: "text-xs text-slate-400 flex items-center gap-1.5",
                                children: [r.jsx(Zi, {
                                    size: 12
                                }), "Pesanan dikelompokkan berdasarkan ", r.jsx("b", {
                                    children: "tanggal pemesanan"
                                }), ". Pesanan yang dipesan di bulan A namun selesai di bulan B tetap dicatat di bulan A."]
                            })
                        })]
                    })]
                })
            }), ve === "export" && r.jsx("div", {
                className: "animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl mx-auto space-y-6",
                children: r.jsxs("div", {
                    id: "step-export",
                    className: "bg-white p-6 md:p-8 rounded-3xl card-fx border border-slate-200/70 relative overflow-hidden",
                    children: [r.jsx("div", {
                        className: "absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none"
                    }), r.jsxs("div", {
                        className: "flex items-start gap-4 mb-8",
                        children: [r.jsx("div", {
                            className: "bg-slate-800 p-3 rounded-xl text-white shadow-md",
                            children: r.jsx(Cm, {
                                size: 28
                            })
                        }), r.jsxs("div", {
                            children: [r.jsx("h2", {
                                className: "text-2xl font-black text-slate-800",
                                children: "Cetak Laporan PDF"
                            }), r.jsxs("p", {
                                className: "text-sm text-slate-500 mt-1",
                                children: ["Bisa di ", r.jsx("i", {
                                    children: "copy-paste"
                                }), "! Atur data yang ingin dilampirkan."]
                            })]
                        })]
                    }), an.length === 0 ? r.jsxs("div", {
                        className: "bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-center flex flex-col items-center",
                        children: [r.jsx(Ji, {
                            size: 32,
                            className: "text-amber-500 mb-3"
                        }), r.jsx("span", {
                            className: "font-bold",
                            children: "Belum ada data!"
                        }), r.jsxs("span", {
                            className: "text-sm mt-1",
                            children: ["Silakan upload file CSV Anda terlebih dahulu di menu ", r.jsx("b", {
                                children: "Import Data"
                            }), "."]
                        })]
                    }) : r.jsxs("div", {
                        className: "space-y-8",
                        children: [r.jsxs("div", {
                            className: "space-y-3",
                            children: [r.jsxs("label", {
                                className: "text-sm font-bold text-slate-700 flex items-center gap-2",
                                children: [r.jsx(ma, {
                                    size: 16,
                                    className: "text-slate-400"
                                }), " Pilih Periode Bulan"]
                            }), r.jsx(Wt, {
                                size: "lg",
                                className: "w-full",
                                placeholder: "Pilih bulan",
                                searchPlaceholder: "Cari bulan...",
                                emptyText: "Belum ada data",
                                value: we,
                                onChange: ur,
                                options: an.map(i => ({
                                    value: i,
                                    label: Pn(i)
                                }))
                            })]
                        }), r.jsxs("div", {
                            className: "space-y-4",
                            children: [r.jsxs("label", {
                                className: "text-sm font-bold text-slate-700 flex items-center gap-2",
                                children: [r.jsx(pa, {
                                    size: 16,
                                    className: "text-slate-400"
                                }), " Konten Laporan"]
                            }), r.jsxs("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                children: [r.jsxs("label", {
                                    className: `flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${ht.summary?"border-emerald-500 bg-emerald-50/30":"border-slate-200 hover:border-slate-300"}`,
                                    children: [r.jsxs("div", {
                                        className: "flex justify-between items-start mb-2",
                                        children: [r.jsx("span", {
                                            className: `font-bold ${ht.summary?"text-emerald-700":"text-slate-700"}`,
                                            children: "Ringkasan"
                                        }), r.jsx("input", {
                                            type: "checkbox",
                                            className: "w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer",
                                            checked: ht.summary,
                                            onChange: i => An({
                                                ...ht,
                                                summary: i.target.checked
                                            })
                                        })]
                                    }), r.jsx("span", {
                                        className: "text-xs text-slate-500",
                                        children: "Total Profit, ROI, Clicks, dll."
                                    })]
                                }), r.jsxs("label", {
                                    className: `flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${ht.table?"border-rose-500 bg-rose-50/30":"border-slate-200 hover:border-slate-300"}`,
                                    children: [r.jsxs("div", {
                                        className: "flex justify-between items-start mb-2",
                                        children: [r.jsx("span", {
                                            className: `font-bold ${ht.table?"text-rose-700":"text-slate-700"}`,
                                            children: "Tabel Tag"
                                        }), r.jsx("input", {
                                            type: "checkbox",
                                            className: "w-5 h-5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer",
                                            checked: ht.table,
                                            onChange: i => An({
                                                ...ht,
                                                table: i.target.checked
                                            })
                                        })]
                                    }), r.jsx("span", {
                                        className: "text-xs text-slate-500",
                                        children: "Tabel rincian performa per tag."
                                    })]
                                }), r.jsxs("label", {
                                    className: `flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${ht.analytics?"border-amber-500 bg-amber-50/30":"border-slate-200 hover:border-slate-300"}`,
                                    children: [r.jsxs("div", {
                                        className: "flex justify-between items-start mb-2",
                                        children: [r.jsx("span", {
                                            className: `font-bold ${ht.analytics?"text-amber-700":"text-slate-700"}`,
                                            children: "Analitik"
                                        }), r.jsx("input", {
                                            type: "checkbox",
                                            className: "w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer",
                                            checked: ht.analytics,
                                            onChange: i => An({
                                                ...ht,
                                                analytics: i.target.checked
                                            })
                                        })]
                                    }), r.jsx("span", {
                                        className: "text-xs text-slate-500",
                                        children: "Kategori & Sumber Platform."
                                    })]
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "pt-6 border-t border-slate-100",
                            children: [r.jsx("button", {
                                onClick: Nr,
                                disabled: dr,
                                className: "w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 text-lg disabled:opacity-50 disabled:hover:translate-y-0",
                                children: dr ? r.jsx(r.Fragment, {
                                    children: "Menyiapkan PDF..."
                                }) : r.jsxs(r.Fragment, {
                                    children: [r.jsx(qi, {
                                        size: 22
                                    }), " Simpan Laporan PDF"]
                                })
                            }), r.jsx("p", {
                                className: "text-center text-xs text-slate-400 mt-4",
                                children: "PDF akan langsung terdownload ke perangkat Anda. Teks di dalam PDF bisa diseleksi & dicopy secara native."
                            })]
                        })]
                    })]
                })
            })]
        }), Kr && (() => {
            const i = Bt[Tt],
                u = Tt === 0,
                o = Tt === Bt.length - 1,
                d = (Tt + 1) / Bt.length * 100;
            return r.jsxs(r.Fragment, {
                children: [r.jsx("div", {
                    className: "fixed inset-0 z-[9990] pointer-events-none",
                    style: {
                        background: "rgba(15,23,42,0.65)"
                    }
                }), i.targetId && Sn.opacity === 1 && r.jsx("div", {
                    className: "fixed z-[9991] pointer-events-none",
                    style: {
                        top: Sn.top,
                        left: Sn.left,
                        width: Sn.width,
                        height: Sn.height,
                        borderRadius: 14,
                        boxShadow: `0 0 0 9999px rgba(15,23,42,0.65), 0 0 0 2.5px ${i.accent}, 0 0 0 6px ${i.accent}28, 0 8px 32px rgba(0,0,0,0.3)`,
                        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)"
                    }
                }), r.jsx("div", {
                    className: "fixed z-[10000] pointer-events-auto",
                    style: {
                        ...mr,
                        width: 420
                    },
                    children: r.jsxs("div", {
                        className: "bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] overflow-hidden border border-white/60",
                        children: [r.jsx("div", {
                            className: "h-[3px] bg-slate-100",
                            children: r.jsx("div", {
                                className: "h-full transition-all duration-500 ease-out",
                                style: {
                                    width: `${d}%`,
                                    background: i.accent
                                }
                            })
                        }), r.jsxs("div", {
                            className: `bg-gradient-to-br ${i.headerCls} px-5 pt-4 pb-3.5 border-b border-slate-100`,
                            children: [r.jsxs("div", {
                                className: "flex items-start justify-between gap-2 mb-3",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-2 flex-wrap",
                                    children: [r.jsx("span", {
                                        className: "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                        style: {
                                            background: `${i.accent}18`,
                                            color: i.accent
                                        },
                                        children: i.category
                                    }), r.jsxs("span", {
                                        className: "text-[10px] font-semibold text-slate-400",
                                        children: [Tt + 1, " dari ", Bt.length]
                                    })]
                                }), r.jsx("button", {
                                    onClick: Qr,
                                    className: "w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 mt-0.5",
                                    title: "Tutup panduan",
                                    children: r.jsx(It, {
                                        size: 13
                                    })
                                })]
                            }), r.jsxs("div", {
                                className: "flex items-start gap-3",
                                children: [i.icon, r.jsx("h3", {
                                    className: "text-[17px] font-black text-slate-800 leading-snug",
                                    children: i.title
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "px-5 py-4",
                            children: [r.jsx("p", {
                                className: "text-[13px] text-slate-600 leading-[1.65]",
                                children: i.desc
                            }), i.tip && r.jsxs("div", {
                                className: "mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5",
                                children: [r.jsx("span", {
                                    className: "text-base flex-shrink-0 mt-px",
                                    children: "💡"
                                }), r.jsx("p", {
                                    className: "text-[11.5px] text-amber-800 leading-snug font-medium",
                                    children: i.tip
                                })]
                            })]
                        }), r.jsxs("div", {
                            className: "px-5 pb-4 flex items-center gap-3 border-t border-slate-50 pt-3",
                            children: [r.jsx("div", {
                                className: "flex-1 flex items-center gap-1 flex-wrap",
                                children: Bt.map((p, g) => r.jsx("button", {
                                    onClick: () => Kn(g),
                                    title: `Step ${g+1}`,
                                    className: "flex-shrink-0 rounded-full transition-all duration-300",
                                    style: {
                                        width: g === Tt ? 18 : 7,
                                        height: 7,
                                        background: g === Tt ? i.accent : g < Tt ? `${i.accent}60` : "rgb(var(--bg-slate-200))"
                                    }
                                }, g))
                            }), r.jsxs("div", {
                                className: "flex items-center gap-2 flex-shrink-0",
                                children: [r.jsx("button", {
                                    onClick: Qr,
                                    className: "text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors",
                                    children: "Skip"
                                }), r.jsx("button", {
                                    onClick: gr,
                                    disabled: u,
                                    className: "flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-25 disabled:pointer-events-none",
                                    children: "← Prev"
                                }), r.jsx("button", {
                                    onClick: Ss,
                                    className: "flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0",
                                    style: {
                                        background: i.accent
                                    },
                                    children: o ? "🎉 Selesai" : "Lanjut →"
                                })]
                            })]
                        })]
                    })
                })]
            })
        })(), xa && r.jsx("div", {
            className: "fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-4",
            style: {
                backgroundColor: "rgba(15,23,42,0.7)",
                backdropFilter: "blur(6px)"
            },
            children: r.jsxs("div", {
                className: "bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden",
                children: [r.jsx("div", {
                    className: "h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500"
                }), r.jsxs("div", {
                    className: "px-7 pt-7 pb-6",
                    children: [r.jsxs("div", {
                        className: "flex items-center gap-3 mb-5",
                        children: [r.jsx("div", {
                            className: "w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200",
                            children: r.jsx(Xi, {
                                size: 24,
                                className: "text-white"
                            })
                        }), r.jsxs("div", {
                            children: [r.jsx("h1", {
                                className: "text-xl font-black text-slate-800 leading-none",
                                children: "AdProfit"
                            }), r.jsx("p", {
                                className: "text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-0.5",
                                children: "Shopee Meta Tracker"
                            })]
                        })]
                    }), r.jsx("h2", {
                        className: "text-[22px] font-black text-slate-800 leading-snug mb-2",
                        children: "Selamat datang! 👋"
                    }), r.jsxs("p", {
                        className: "text-sm text-slate-500 leading-relaxed mb-5",
                        children: ["Dashboard untuk menggabungkan data ", r.jsx("b", {
                            className: "text-orange-500",
                            children: "Shopee Affiliate"
                        }), " dan ", r.jsx("b", {
                            className: "text-blue-600",
                            children: "Meta Ads"
                        }), "-mu dalam satu tampilan — Profit, ROI, ROAS, dan performa per tag, semuanya terpadu."]
                    }), r.jsx("div", {
                        className: "space-y-2.5 mb-6",
                        children: [{
                            icon: "📂",
                            text: "Upload CSV/Excel Meta Ads & Shopee Affiliate"
                        }, {
                            icon: "📊",
                            text: "Analisis Profit, ROI, ROAS per tag & per hari"
                        }, {
                            icon: "🎯",
                            text: "Target KPI otomatis dengan indikator warna"
                        }, {
                            icon: "📄",
                            text: "Export laporan PDF profesional langsung download"
                        }].map((i, u) => r.jsxs("div", {
                            className: "flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-2.5",
                            children: [r.jsx("span", {
                                className: "text-base flex-shrink-0",
                                children: i.icon
                            }), r.jsx("span", {
                                className: "text-[12.5px] font-medium text-slate-600",
                                children: i.text
                            })]
                        }, u))
                    }), r.jsxs("div", {
                        className: "flex flex-col sm:flex-row gap-2.5",
                        children: [r.jsxs("button", {
                            onClick: () => {
                                localStorage.setItem("adprofit_welcomed", "1"), localStorage.setItem("shomet_welcomed", "1"), ws(!1), Vr()
                            },
                            className: "flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-200 hover:-translate-y-px",
                            children: [r.jsx(ju, {
                                size: 16
                            }), " Mulai Panduan"]
                        }), r.jsx("button", {
                            onClick: () => {
                                localStorage.setItem("adprofit_welcomed", "1"), localStorage.setItem("shomet_welcomed", "1"), ws(!1)
                            },
                            className: "flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors",
                            children: "Langsung Pakai →"
                        })]
                    }), r.jsxs("p", {
                        className: "text-center text-[10.5px] text-slate-400 mt-3",
                        children: ["Panduan bisa dibuka kapan saja lewat tombol ", r.jsx("b", {
                            children: "Panduan"
                        }), " di header."]
                    })]
                })]
            })
        }), ul && r.jsx("div", {
            className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            style: {
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)"
            },
            onClick: () => pr(!1),
            children: r.jsxs("div", {
                className: "bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center",
                onClick: i => i.stopPropagation(),
                children: [r.jsx("div", {
                    className: "text-4xl mb-4",
                    children: "🤲"
                }), r.jsx("p", {
                    className: "text-slate-500 text-sm mb-3",
                    children: "Jika tools ini bermanfaat untuk mu tolong bantu doakan saya ya"
                }), r.jsx("p", {
                    className: "text-slate-700 text-base font-medium leading-relaxed",
                    children: "Semoga Allah mudahkan yang bikin tools ini dapat ROI 300% setiap hari"
                }), r.jsx("button", {
                    onClick: () => pr(!1),
                    className: "mt-6 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-base transition-colors shadow-md",
                    children: "Aamiin 🤲"
                })]
            })
        }), Br && r.jsx("div", {
            className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            style: {
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)"
            },
            onClick: () => fr(!1),
            children: r.jsxs("div", {
                className: "bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center relative",
                onClick: i => i.stopPropagation(),
                children: [r.jsx("button", {
                    onClick: () => fr(!1),
                    className: "absolute top-3 right-3 text-slate-400 hover:text-slate-600 focus:outline-none",
                    children: r.jsx(It, {
                        size: 18
                    })
                }), r.jsx("div", {
                    className: "text-4xl mb-4",
                    children: "🎁"
                }), r.jsx("p", {
                    className: "text-slate-700 text-base font-medium leading-relaxed",
                    children: "Kalau merasa terbantu dengan AdProfit dan berkenan traktir AdProfit, silahkan ya.."
                }), r.jsxs("a", {
                    href: "https://lynk.id/rizkanyazid/zx88gognlz8e/checkout",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    onClick: () => fr(!1),
                    className: "mt-6 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-base transition-colors shadow-md flex items-center gap-2",
                    children: [r.jsx(Cu, {
                        size: 18
                    }), " Traktir AdProfit"]
                })]
            })
        }), Dt.show && r.jsx("div", {
            className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            style: {
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)"
            },
            onClick: () => xr({
                show: !1,
                title: "",
                message: "",
                suggestion: ""
            }),
            children: r.jsxs("div", {
                className: "bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden",
                onClick: i => i.stopPropagation(),
                children: [r.jsxs("div", {
                    className: "bg-red-500 px-6 py-4 flex items-start gap-3",
                    children: [r.jsx("div", {
                        className: "mt-0.5 flex-shrink-0 bg-white/20 rounded-full p-2",
                        children: r.jsx(Ji, {
                            className: "w-6 h-6 text-white"
                        })
                    }), r.jsx("div", {
                        className: "flex-1 min-w-0",
                        children: r.jsx("h3", {
                            className: "text-white font-bold text-lg leading-tight",
                            children: Dt.title
                        })
                    }), r.jsx("button", {
                        onClick: () => xr({
                            show: !1,
                            title: "",
                            message: "",
                            suggestion: ""
                        }),
                        className: "flex-shrink-0 text-white/70 hover:text-white transition-colors ml-2",
                        children: r.jsx(It, {
                            className: "w-5 h-5"
                        })
                    })]
                }), r.jsxs("div", {
                    className: "px-6 py-5 space-y-4",
                    children: [r.jsxs("div", {
                        className: "flex gap-3 items-start",
                        children: [r.jsx(Zi, {
                            className: "w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                        }), r.jsx("p", {
                            className: "text-slate-700 text-sm leading-relaxed",
                            children: Dt.message
                        })]
                    }), Dt.suggestion && r.jsxs("div", {
                        className: "bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start",
                        children: [r.jsx(Tu, {
                            className: "w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                        }), r.jsxs("div", {
                            children: [r.jsx("p", {
                                className: "text-amber-800 font-semibold text-xs uppercase tracking-wide mb-1",
                                children: "Solusi"
                            }), r.jsx("p", {
                                className: "text-amber-700 text-sm leading-relaxed",
                                children: Dt.suggestion
                            })]
                        })]
                    }), r.jsxs("div", {
                        className: `border rounded-xl p-4 ${Dt.uploadType==="meta"?"bg-indigo-50 border-indigo-200":Dt.uploadType==="click"?"bg-orange-50 border-orange-200":Dt.uploadType==="commission"?"bg-emerald-50 border-emerald-200":"bg-slate-50 border-slate-200"}`,
                        children: [r.jsx("p", {
                            className: "font-semibold text-xs uppercase tracking-wide mb-2 text-slate-500",
                            children: "File yang seharusnya masuk di sini"
                        }), Dt.uploadType === "meta" && r.jsxs("div", {
                            className: "text-sm text-indigo-800 space-y-1",
                            children: [r.jsx("p", {
                                className: "font-bold text-indigo-700",
                                children: "File Meta Ads (Facebook Ads Manager)"
                            }), r.jsxs("p", {
                                children: ["Export dari ", r.jsx("b", {
                                    children: "Ads Manager → Reports"
                                })]
                            }), r.jsxs("p", {
                                children: ["Wajib aktifkan: ", r.jsx("b", {
                                    children: "Breakdown → By Time → Day"
                                })]
                            }), r.jsx("p", {
                                className: "text-indigo-500 text-xs",
                                children: "Kolom wajib: Campaign name, Amount spent, Reporting starts/ends"
                            })]
                        }), Dt.uploadType === "click" && r.jsxs("div", {
                            className: "text-sm text-orange-800 space-y-1",
                            children: [r.jsx("p", {
                                className: "font-bold text-orange-700",
                                children: "File Laporan Klik Shopee"
                            }), r.jsxs("p", {
                                children: ["Download dari ", r.jsx("b", {
                                    children: "Shopee Affiliate → Laporan → Laporan Klik"
                                })]
                            }), r.jsxs("p", {
                                children: ["Nama file biasanya: ", r.jsx("b", {
                                    children: "WebsiteClickReport_..."
                                })]
                            }), r.jsx("p", {
                                className: "text-orange-500 text-xs",
                                children: "Kolom wajib: Klik ID, Waktu Klik, Tag_link"
                            })]
                        }), Dt.uploadType === "commission" && r.jsxs("div", {
                            className: "text-sm text-emerald-800 space-y-1",
                            children: [r.jsx("p", {
                                className: "font-bold text-emerald-700",
                                children: "File Laporan Pesanan Affiliate"
                            }), r.jsxs("p", {
                                children: ["Download dari ", r.jsx("b", {
                                    children: "Shopee Affiliate → Laporan → Laporan Pesanan Affiliate"
                                })]
                            }), r.jsxs("p", {
                                children: ["Filter berdasarkan ", r.jsx("b", {
                                    children: "Waktu Pemesanan"
                                }), ", pastikan bahasa ", r.jsx("b", {
                                    children: "Bahasa Indonesia"
                                }), ", lalu Export."]
                            }), r.jsxs("p", {
                                children: ["Nama file biasanya: ", r.jsx("b", {
                                    children: "AffiliateCommissionReport_..."
                                })]
                            }), r.jsx("p", {
                                className: "text-emerald-500 text-xs",
                                children: "Kolom wajib: ID Pemesanan, Total Komisi per Pesanan"
                            })]
                        }), !Dt.uploadType && r.jsxs("div", {
                            className: "space-y-2 text-xs text-slate-600",
                            children: [r.jsxs("div", {
                                className: "flex items-start gap-2",
                                children: [r.jsx("span", {
                                    className: "font-bold text-indigo-600 flex-shrink-0",
                                    children: "Meta Ads"
                                }), r.jsxs("span", {
                                    children: ["— Export dari Ads Manager, aktifkan ", r.jsx("b", {
                                        children: "Breakdown → By Time → Day"
                                    })]
                                })]
                            }), r.jsxs("div", {
                                className: "flex items-start gap-2",
                                children: [r.jsx("span", {
                                    className: "font-bold text-orange-500 flex-shrink-0",
                                    children: "Klik Shopee"
                                }), r.jsxs("span", {
                                    children: ["— File ", r.jsx("b", {
                                        children: "WebsiteClickReport"
                                    }), " dari Shopee Affiliate"]
                                })]
                            }), r.jsxs("div", {
                                className: "flex items-start gap-2",
                                children: [r.jsx("span", {
                                    className: "font-bold text-emerald-600 flex-shrink-0",
                                    children: "Laporan Pesanan Affiliate"
                                }), r.jsxs("span", {
                                    children: ["— File ", r.jsx("b", {
                                        children: "AffiliateCommissionReport"
                                    }), " dari Shopee Affiliate (menu Laporan → Laporan Pesanan Affiliate)"]
                                })]
                            })]
                        })]
                    })]
                }), r.jsx("div", {
                    className: "px-6 pb-5",
                    children: r.jsx("button", {
                        onClick: () => xr({
                            show: !1,
                            title: "",
                            message: "",
                            suggestion: ""
                        }),
                        className: "w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors",
                        children: "Mengerti, Coba Lagi"
                    })
                })]
            })
        }), placementDrilldownTag && (() => {
            const allLinkedItems = placementDrilldownTag.linkedCampaigns || [];
            const activeSub = (modalSubItemFilter && (modalSubItemFilter === 'all' || allLinkedItems.includes(modalSubItemFilter))) ? modalSubItemFilter : 'all';

            // Meta rows based on activeSub filter
            const activeMetaRows = activeSub === 'all'
                ? Qe.filter(row => allLinkedItems.some(link => matchesMetaRow(link, row)))
                : Qe.filter(row => matchesMetaRow(activeSub, row));

            // Tag-level Shopee data
            const tagShopeeClicksRaw = _.filter(r => Tn(r.Tag_link) === placementDrilldownTag.tag);
            const tagShopeeOrdersRaw = be.filter(r => (r.Tag_link1 || '').replace(/-+$/, '') === placementDrilldownTag.tag);

            // Proportional allocation if checking individual linked item
            let activeShopeeClicks = placementDrilldownTag.shopeeClicks || 0;
            let activeShopeeComm = placementDrilldownTag.shopeeCommission || 0;
            let activeShopeeOrders = placementDrilldownTag.pesanan || placementDrilldownTag.shopeeOrders || 0;

            if (activeSub !== 'all' && allLinkedItems.length > 1) {
                const allTagMetaClicks = Qe.filter(row => allLinkedItems.some(link => matchesMetaRow(link, row))).reduce((sum, r) => sum + extractMetaClicks(r), 0);
                const subMetaClicks = activeMetaRows.reduce((sum, r) => sum + extractMetaClicks(r), 0);
                const ratio = allTagMetaClicks > 0 ? (subMetaClicks / allTagMetaClicks) : (1 / Math.max(1, allLinkedItems.length));
                activeShopeeClicks = Math.round((placementDrilldownTag.shopeeClicks || 0) * ratio);
                activeShopeeComm = (placementDrilldownTag.shopeeCommission || 0) * ratio;
                activeShopeeOrders = Math.round(((placementDrilldownTag.pesanan || placementDrilldownTag.shopeeOrders || 0)) * ratio);
            }

            const drilldown = calculateTagPlacementLeakage(activeMetaRows, activeShopeeClicks, Ne, activeShopeeComm);
            const dailyRows = calculateDailyBreakdownForRows(activeMetaRows, tagShopeeClicksRaw, tagShopeeOrdersRaw, Ne, _e);

            const totalSpent = drilldown.totalSpentWithPpn;
            const totalMetaClicks = drilldown.totalMetaClicks;
            const roas = totalSpent > 0 ? activeShopeeComm / totalSpent : 0;
            const cpr = totalMetaClicks > 0 ? totalSpent / totalMetaClicks : 0;
            const cprc = drilldown.cprc;
            const epc = drilldown.epc;
            const leakagePct = Math.round(drilldown.overallLeakagePct || 0);

            const modalInsight = getAffiliateInsight({
                roas,
                cpr,
                cprc,
                epc,
                leakage: leakagePct,
                spend: totalSpent,
                clicks: totalMetaClicks,
                shopeeClicks: activeShopeeClicks,
                commission: activeShopeeComm,
                profit: activeShopeeComm - totalSpent
            });

            const activeSubName = activeSub === 'all' ? 'Semua Terkait' : getMetaItemName(activeSub);
            const activeSubType = activeSub === 'all' ? 'ALL' : getMetaItemType(activeSub).toUpperCase();

            return r.jsx("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden",
                onClick: () => setPlacementDrilldownTag(null),
                children: r.jsxs("div", {
                    className: "bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[88vh] max-h-[88vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 relative",
                    onClick: g => g.stopPropagation(),
                    children: [
                        // MODAL HEADER
                        r.jsxs("div", {
                            className: "px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 flex-shrink-0",
                            children: [
                                r.jsxs("div", {
                                    className: "flex items-start gap-3.5",
                                    children: [
                                        r.jsx("div", {
                                            className: "w-11 h-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5",
                                            children: r.jsx(Pu, { size: 22 })
                                        }),
                                        r.jsxs("div", {
                                            children: [
                                                r.jsxs("div", {
                                                    className: "flex flex-wrap items-center gap-2",
                                                    children: [
                                                        r.jsx("h3", {
                                                            className: "text-base font-extrabold text-slate-900 dark:text-white tracking-tight",
                                                            children: "Detail Performa Harian & Placement Iklan"
                                                        }),
                                                        r.jsxs("span", {
                                                            className: "text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs",
                                                            children: ["🏷️ Tag: ", placementDrilldownTag.tag]
                                                        }),
                                                        activeSub !== 'all' && r.jsxs("span", {
                                                            className: `text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                                                                activeSubType === 'ADSET'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                                                    : activeSubType === 'AD'
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                                                    : 'bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950 dark:text-violet-300'
                                                            }`,
                                                            children: [activeSubType, ": ", activeSubName]
                                                        })
                                                    ]
                                                }),
                                                r.jsx("p", {
                                                    className: "text-xs text-slate-500 dark:text-slate-400 mt-1",
                                                    children: "Inspeksi mendalam performa per iklan atau keseluruhan kaitan tag, mencakup Rincian Harian, Konversi, dan Multi-Breakdown Placement Meta Ads."
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                r.jsxs("div", {
                                    className: "flex items-center gap-2 flex-shrink-0",
                                    children: [
                                        r.jsxs("button", {
                                            type: "button",
                                            onClick: () => {
                                                if (activeSub !== 'all') {
                                                    const st = getMetaItemType(activeSub);
                                                    const sn = getMetaItemName(activeSub);
                                                    setBreakdownScopeType(st);
                                                    setBreakdownSelectedKey(sn);
                                                } else {
                                                    setBreakdownScopeType('tag');
                                                    setBreakdownSelectedKey(placementDrilldownTag.tag);
                                                }
                                                De('dashboard');
                                                setPlacementDrilldownTag(null);
                                                setTimeout(() => {
                                                    const el = document.getElementById("dashboard-breakdown-section");
                                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }, 150);
                                            },
                                            className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 hover:bg-indigo-200/80 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-2xs",
                                            title: "Buka filter iklan ini langsung di Dashboard Utama",
                                            children: [
                                                r.jsx(wm, { size: 13 }),
                                                r.jsx("span", { className: "hidden sm:inline", children: "Buka di Dashboard Utama" })
                                            ]
                                        }),
                                        r.jsx("button", {
                                            type: "button",
                                            onClick: () => setPlacementDrilldownTag(null),
                                            className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer",
                                            title: "Tutup",
                                            children: r.jsx(It, { size: 16 })
                                        })
                                    ]
                                })
                            ]
                        }),

                        // MODAL BODY SCROLLABLE
                        r.jsxs("div", {
                            className: "p-4 sm:p-6 overflow-y-auto min-h-0 flex-1 space-y-5 overscroll-contain",
                            children: [
                                // SUB-ITEM FILTER BAR (INDIVIDUAL AD INSPECTION)
                                r.jsxs("div", {
                                    className: "p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5",
                                    children: [
                                        r.jsxs("div", {
                                            className: "flex items-center gap-2 flex-shrink-0",
                                            children: [
                                                r.jsx(Lu, { size: 14, className: "text-indigo-500" }),
                                                r.jsx("span", {
                                                    className: "text-xs font-bold text-slate-700 dark:text-slate-300",
                                                    children: "Pilih Iklan untuk Dicek Satu per Satu:"
                                                })
                                            ]
                                        }),
                                        allLinkedItems.length > 0 ? (
                                            r.jsxs("div", {
                                                className: "flex flex-wrap items-center gap-1.5 flex-1 justify-start sm:justify-end",
                                                children: [
                                                    r.jsxs("button", {
                                                        type: "button",
                                                        onClick: () => setModalSubItemFilter('all'),
                                                        className: `text-[10.5px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                                                            activeSub === 'all'
                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                                        }`,
                                                        children: ["⭐ Semua Terkait (", allLinkedItems.length, ")"]
                                                    }),
                                                    allLinkedItems.map(link => {
                                                        const isAdset = link.startsWith('adset:');
                                                        const isAd = link.startsWith('ad:');
                                                        const name = getMetaItemName(link);
                                                        const isSelected = activeSub === link;
                                                        const typeBadge = isAdset ? 'SET' : isAd ? 'ADS' : 'CAMP';
                                                        return r.jsxs("button", {
                                                            type: "button",
                                                            onClick: () => setModalSubItemFilter(link),
                                                            className: `inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer border max-w-[200px] truncate ${
                                                                isSelected
                                                                    ? isAdset
                                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                                        : isAd
                                                                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                                                        : 'bg-violet-600 text-white border-violet-600 shadow-xs'
                                                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                                            }`,
                                                            title: `${typeBadge}: ${name}`,
                                                            children: [
                                                                r.jsx("span", { className: "opacity-75 font-mono text-[9px]", children: typeBadge }),
                                                                r.jsx("span", { className: "truncate", children: name })
                                                            ]
                                                        }, link);
                                                    })
                                                ]
                                            })
                                        ) : (
                                            r.jsx("div", {
                                                className: "text-xs text-amber-600 dark:text-amber-400 italic",
                                                children: "⚠️ Belum ada kampanye/adset/ad yang dikaitkan ke tag ini."
                                            })
                                        )
                                    ]
                                }),

                                // ACTIONABLE INSIGHT BANNER
                                r.jsxs("div", {
                                    className: `p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${modalInsight.badgeCls}`,
                                    children: [
                                        r.jsxs("div", {
                                            className: "flex items-start gap-2.5",
                                            children: [
                                                r.jsx("span", {
                                                    className: "text-base mt-0.5",
                                                    children: modalInsight.label.split(" ")[0]
                                                }),
                                                r.jsxs("div", {
                                                    children: [
                                                        r.jsxs("div", {
                                                            className: "font-black text-xs tracking-wide uppercase",
                                                            children: ["Rekomendasi Tindakan: ", modalInsight.label]
                                                        }),
                                                        r.jsx("div", {
                                                            className: "text-[11px] opacity-90 mt-0.5 leading-snug font-medium",
                                                            children: modalInsight.description
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        r.jsx("div", {
                                            className: "text-xs font-bold px-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/30 border border-current flex-shrink-0 self-stretch sm:self-auto text-center",
                                            children: modalInsight.action
                                        })
                                    ]
                                }),

                                // KPI STAT CARDS GRID
                                r.jsxs("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3",
                                    children: [
                                        r.jsxs("div", {
                                            className: "p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800",
                                            children: [
                                                r.jsx("div", { className: "text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1", children: "Spent (+PPN)" }),
                                                r.jsx("div", { className: "text-base font-black text-violet-600 dark:text-violet-400 font-mono", children: J(drilldown.totalSpentWithPpn) }),
                                                r.jsx("div", { className: "text-[9px] text-slate-400 mt-0.5", children: `${activeMetaRows.length} baris Meta` })
                                            ]
                                        }),
                                        r.jsxs("div", {
                                            className: "p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800",
                                            children: [
                                                r.jsx("div", { className: "text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1", children: "Meta Clicks" }),
                                                r.jsx("div", { className: "text-base font-black text-indigo-600 dark:text-indigo-400 font-mono", children: ke(drilldown.totalMetaClicks) }),
                                                r.jsx("div", { className: "text-[9px] text-slate-400 mt-0.5", children: "Klik iklan Meta" })
                                            ]
                                        }),
                                        r.jsxs("div", {
                                            className: "p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800",
                                            children: [
                                                r.jsx("div", { className: "text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1", children: "Shopee Clicks" }),
                                                r.jsx("div", { className: "text-base font-black text-amber-600 dark:text-amber-400 font-mono", children: ke(drilldown.totalShopeeClicks) }),
                                                r.jsx("div", { className: "text-[9px] text-slate-400 mt-0.5", children: activeSub === 'all' ? 'Klik mendarat' : 'Estimasi alokasi' })
                                            ]
                                        }),
                                        r.jsxs(`div`, {
                                            className: `p-3 rounded-2xl border ${
                                                drilldown.overallLeakagePct > 40
                                                    ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300"
                                                    : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                                            }`,
                                            children: [
                                                r.jsx("div", { className: "text-[10px] font-bold mb-1", children: "Kebocoran Klik" }),
                                                r.jsxs("div", {
                                                    className: "text-base font-black font-mono flex items-baseline gap-1",
                                                    children: [
                                                        ke(drilldown.totalKebocoran),
                                                        r.jsxs("span", {
                                                            className: "text-[10px] font-bold",
                                                            children: ["(", drilldown.overallLeakagePct.toFixed(1), "%)"]
                                                        })
                                                    ]
                                                }),
                                                r.jsx("div", {
                                                    className: "text-[9px] font-semibold mt-0.5 truncate",
                                                    children: drilldown.overallLeakagePct > 40 ? "⚠️ Tinggi (>40%)" : "✓ Normal (≤40%)"
                                                })
                                            ]
                                        }),
                                        r.jsxs("div", {
                                            className: "p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800",
                                            children: [
                                                r.jsx("div", { className: "text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1", children: "ROAS & Profit" }),
                                                r.jsxs("div", {
                                                    className: `text-base font-black font-mono ${roas >= 2 ? 'text-emerald-600 dark:text-emerald-400' : roas >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`,
                                                    children: [roas.toFixed(2), "x"]
                                                }),
                                                r.jsx("div", {
                                                    className: `text-[9px] font-bold font-mono mt-0.5 ${activeShopeeComm - totalSpent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`,
                                                    children: J(Math.round(activeShopeeComm - totalSpent))
                                                })
                                            ]
                                        }),
                                        r.jsxs("div", {
                                            className: "p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800",
                                            children: [
                                                r.jsx("div", { className: "text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1", children: "CPRC vs EPC" }),
                                                r.jsxs("div", {
                                                    className: "text-xs font-black font-mono text-slate-800 dark:text-slate-200",
                                                    children: [J(Math.round(drilldown.cprc)), " / ", J(Math.round(drilldown.epc))]
                                                }),
                                                r.jsxs("div", {
                                                    className: `text-[9px] font-bold mt-0.5 ${drilldown.cookieMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`,
                                                    children: [drilldown.cookieMargin >= 0 ? "+ " : "", J(Math.round(drilldown.cookieMargin)), " margin"]
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // TAB SELECTOR: PLACEMENT vs DAILY BREAKDOWN
                                r.jsxs("div", {
                                    className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2",
                                    children: [
                                        r.jsxs("div", {
                                            className: "flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl",
                                            children: [
                                                r.jsxs("button", {
                                                    type: "button",
                                                    onClick: () => setModalDrilldownTab('placement'),
                                                    className: `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                        modalDrilldownTab === 'placement'
                                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                    }`,
                                                    children: [
                                                        r.jsx(ol, { size: 14 }),
                                                        "Analisis Placement Meta Ads",
                                                        r.jsxs("span", {
                                                            className: "text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold",
                                                            children: [drilldown.placements.length]
                                                        })
                                                    ]
                                                }),
                                                r.jsxs("button", {
                                                    type: "button",
                                                    onClick: () => setModalDrilldownTab('daily'),
                                                    className: `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                        modalDrilldownTab === 'daily'
                                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                    }`,
                                                    children: [
                                                        r.jsx(ma, { size: 14 }),
                                                        "Tabel Rincian Performa Harian",
                                                        r.jsxs("span", {
                                                            className: "text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold",
                                                            children: [dailyRows.length]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        r.jsxs("div", {
                                            className: "hidden md:flex items-center gap-2 text-xs text-slate-400",
                                            children: [
                                                r.jsx("span", { children: "Sedang melihat:" }),
                                                r.jsx("span", { className: "font-bold text-slate-700 dark:text-slate-300", children: activeSub === 'all' ? `Semua Iklan (${allLinkedItems.length})` : activeSubName })
                                            ]
                                        })
                                    ]
                                }),

                                // TAB 1: PLACEMENT BREAKDOWN
                                modalDrilldownTab === 'placement' && (
                                    drilldown.placements.length > 0 ? (
                                        r.jsxs("div", {
                                            className: "border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs",
                                            children: [
                                                r.jsxs("div", {
                                                    className: "px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between",
                                                    children: [
                                                        r.jsxs("h4", {
                                                            className: "text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2",
                                                            children: [
                                                                r.jsx(ol, { size: 14, className: "text-indigo-500" }),
                                                                "Tabel Rincian Penempatan & Estimasi Kebocoran"
                                                            ]
                                                        }),
                                                        r.jsxs("span", {
                                                            className: "text-[10px] font-bold text-slate-500 dark:text-slate-400",
                                                            children: [drilldown.placements.length, " Penempatan Terdeteksi"]
                                                        })
                                                    ]
                                                }),
                                                r.jsx("div", {
                                                    className: "overflow-x-auto",
                                                    children: r.jsxs("table", {
                                                        className: "min-w-full text-[11px] text-left",
                                                        children: [
                                                            r.jsx("thead", {
                                                                className: "bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800",
                                                                children: r.jsxs("tr", {
                                                                    children: [
                                                                        r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap", children: "Nama Placement" }),
                                                                        r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right", children: "Spend Placement" }),
                                                                        r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right", children: "Meta Clicks" }),
                                                                        r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right text-amber-600 dark:text-amber-400", children: "Est. Shopee Clicks" }),
                                                                        r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right text-indigo-700 dark:text-indigo-300", children: "CPRC (Biaya/Cookie)" }),
                                                                        r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap text-right", children: "Estimasi Kebocoran" })
                                                                    ]
                                                                })
                                                            }),
                                                            r.jsx("tbody", {
                                                                className: "divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40",
                                                                children: drilldown.placements.map((p, idx) => {
                                                                    return r.jsxs("tr", {
                                                                        className: "hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors",
                                                                        children: [
                                                                            r.jsx("td", {
                                                                                className: "px-4 py-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap",
                                                                                children: r.jsxs("div", {
                                                                                    className: "flex items-center gap-2",
                                                                                    children: [
                                                                                        r.jsx("span", {
                                                                                            className: `w-2 h-2 rounded-full ${
                                                                                                p.placement.toLowerCase().includes("reels")
                                                                                                    ? "bg-pink-500"
                                                                                                    : p.placement.toLowerCase().includes("stories")
                                                                                                    ? "bg-purple-500"
                                                                                                    : p.placement.toLowerCase().includes("feed")
                                                                                                    ? "bg-blue-500"
                                                                                                    : "bg-indigo-500"
                                                                                            }`
                                                                                        }),
                                                                                        p.placement
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-4 py-3 text-right whitespace-nowrap",
                                                                                children: r.jsxs("div", {
                                                                                    children: [
                                                                                        r.jsx("span", { className: "font-black text-violet-700 dark:text-violet-400 font-mono", children: J(p.amountSpentWithPpn) }),
                                                                                        r.jsx("div", { className: "text-[9.5px] font-semibold text-slate-400", children: `${p.spendSharePct.toFixed(1)}% porsi spend` })
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-4 py-3 text-right whitespace-nowrap",
                                                                                children: r.jsxs("div", {
                                                                                    children: [
                                                                                        r.jsx("span", { className: "font-black text-indigo-700 dark:text-indigo-400 font-mono", children: ke(p.metaClicks) }),
                                                                                        r.jsx("div", { className: "text-[9.5px] text-slate-400", children: `${p.clickSharePct.toFixed(1)}% klik` })
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-4 py-3 text-right whitespace-nowrap",
                                                                                children: r.jsxs("div", {
                                                                                    children: [
                                                                                        r.jsx("span", { className: "font-black text-amber-700 dark:text-amber-400 font-mono", children: ke(p.estimatedShopeeClicks) }),
                                                                                        r.jsx("div", { className: "text-[9.5px] text-slate-400", children: "klik mendarat" })
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-4 py-3 text-right whitespace-nowrap",
                                                                                children: r.jsxs("div", {
                                                                                    children: [
                                                                                        r.jsx("span", {
                                                                                            className: `font-black font-mono ${p.cprc <= 400 ? "text-emerald-600 dark:text-emerald-400" : p.cprc <= 800 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`,
                                                                                            children: p.cprc > 0 ? J(Math.round(p.cprc)) : "—"
                                                                                        }),
                                                                                        r.jsx("div", {
                                                                                            className: "text-[9.5px] text-slate-400",
                                                                                            children: p.cprc <= 400 ? "✓ Murah" : p.cprc <= 800 ? "Sedang" : "⚠️ Mahal"
                                                                                        })
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-4 py-3 text-right whitespace-nowrap",
                                                                                children: r.jsxs("div", {
                                                                                    className: "inline-flex flex-col items-end",
                                                                                    children: [
                                                                                        r.jsxs("span", {
                                                                                            className: `font-black font-mono ${p.isHighLeakage ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-emerald-600 dark:text-emerald-400"}`,
                                                                                            children: [ke(p.estimatedKebocoran), " klik"]
                                                                                        }),
                                                                                        r.jsx("span", {
                                                                                            className: `text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                                                                                                p.isHighLeakage
                                                                                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                                                                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                                                                            }`,
                                                                                            children: `${p.estimatedLeakagePct.toFixed(1)}% bocor`
                                                                                        })
                                                                                    ]
                                                                                })
                                                                            })
                                                                        ]
                                                                    }, p.placement || idx);
                                                                })
                                                            })
                                                        ]
                                                    })
                                                })
                                            ]
                                        })
                                    ) : (
                                        r.jsxs("div", {
                                            className: "p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800",
                                            children: [
                                                r.jsx(Pu, { size: 36, className: "mx-auto text-slate-300 dark:text-slate-600 mb-2" }),
                                                r.jsx("h4", { className: "text-sm font-bold text-slate-700 dark:text-slate-300", children: "Belum Ada Data Penempatan Terkait" }),
                                                r.jsx("p", { className: "text-xs text-slate-400 max-w-md mx-auto mt-1", children: "Pastikan Anda mengunggah file Meta Ads dengan opsi Breakdown By Delivery (Placement), serta mengaitkan Campaign/Ad Set/Ads yang aktif ke tag ini." })
                                            ]
                                        })
                                    )
                                ),

                                // TAB 2: DAILY BREAKDOWN TABLE
                                modalDrilldownTab === 'daily' && (
                                    dailyRows.length > 0 ? (
                                        r.jsxs("div", {
                                            className: "border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-0",
                                            children: [
                                                r.jsxs("div", {
                                                    className: "px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between",
                                                    children: [
                                                        r.jsxs("h4", {
                                                            className: "text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2",
                                                            children: [
                                                                r.jsx(ma, { size: 14, className: "text-indigo-500" }),
                                                                "Rincian Performa Harian untuk: ",
                                                                r.jsx("span", { className: "text-indigo-600 dark:text-indigo-400 font-bold normal-case", children: activeSub === 'all' ? `Tag ${placementDrilldownTag.tag}` : activeSubName })
                                                            ]
                                                        }),
                                                        r.jsxs("span", {
                                                            className: "text-[10px] font-bold text-slate-500 dark:text-slate-400",
                                                            children: [dailyRows.length, " Hari Tercatat"]
                                                        })
                                                    ]
                                                }),
                                                r.jsx("div", {
                                                    className: "overflow-x-auto rounded-xl",
                                                    children: r.jsxs("table", {
                                                        className: "min-w-full text-[11px] text-left",
                                                        children: [
                                                            r.jsx("thead", {
                                                                className: "bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10",
                                                                children: r.jsxs("tr", {
                                                                    children: [
                                                                        r.jsx("th", { className: "px-3.5 py-2.5 whitespace-nowrap", children: "Tanggal" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right", children: "Meta Clicks" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right text-amber-600 dark:text-amber-400", children: "Shopee Clicks" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right", children: "Kebocoran Klik" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right", children: "Pesanan" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right text-emerald-600 dark:text-emerald-400", children: "Komisi Shopee" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right text-violet-600 dark:text-violet-400", children: "Spend (+PPN)" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right", children: "Laba Bersih" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right", children: "ROAS" }),
                                                                        r.jsx("th", { className: "px-3 py-2.5 whitespace-nowrap text-right text-indigo-600 dark:text-indigo-400", children: "CPRC" }),
                                                                        r.jsx("th", { className: "px-4 py-2.5 whitespace-nowrap", children: "Detail Konversi" })
                                                                    ]
                                                                })
                                                            }),
                                                            r.jsx("tbody", {
                                                                className: "divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40",
                                                                children: [...dailyRows].reverse().map((dRow, idx) => {
                                                                    const bStyle = getLeakageBadgeStyle(dRow.leakagePct);
                                                                    return r.jsxs("tr", {
                                                                        className: "hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors",
                                                                        children: [
                                                                            r.jsx("td", {
                                                                                className: "px-3.5 py-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap font-mono",
                                                                                children: dRow.date
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right font-black font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap",
                                                                                children: ke(dRow.metaClicks)
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right font-black font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap",
                                                                                children: ke(dRow.shopeeClicks)
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right whitespace-nowrap",
                                                                                children: r.jsxs("div", {
                                                                                    className: "inline-flex items-center gap-1.5",
                                                                                    children: [
                                                                                        r.jsx("span", { className: "font-mono font-bold text-slate-700 dark:text-slate-300", children: ke(dRow.kebocoran) }),
                                                                                        r.jsxs("span", {
                                                                                            className: `text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${bStyle.badgeCls}`,
                                                                                            children: [dRow.leakagePct.toFixed(1), "%"]
                                                                                        })
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap font-mono",
                                                                                children: dRow.orders > 0 ? ke(dRow.orders) : "—"
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap",
                                                                                children: dRow.commission > 0 ? J(dRow.commission) : "—"
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right font-mono font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap",
                                                                                children: dRow.spend > 0 ? J(dRow.spend) : "—"
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: `px-3 py-2.5 text-right font-mono font-bold whitespace-nowrap ${dRow.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`,
                                                                                children: J(dRow.profit)
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right font-mono font-bold whitespace-nowrap",
                                                                                children: dRow.spend > 0 ? (
                                                                                    r.jsxs("span", {
                                                                                        className: `px-1.5 py-0.5 rounded text-[10px] ${dRow.roas >= 2 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black' : dRow.roas >= 1 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`,
                                                                                        children: [dRow.roas.toFixed(2), "x"]
                                                                                    })
                                                                                ) : "—"
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-3 py-2.5 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap",
                                                                                children: dRow.cprc > 0 ? J(Math.round(dRow.cprc)) : "—"
                                                                            }),
                                                                            r.jsx("td", {
                                                                                className: "px-4 py-2.5 whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400",
                                                                                children: dRow.clickDates && dRow.clickDates.length > 0 ? (
                                                                                    r.jsx("div", {
                                                                                        className: "flex flex-wrap gap-1",
                                                                                        children: dRow.clickDates.map((cd, cIdx) => (
                                                                                            r.jsxs("span", {
                                                                                                className: "px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[9px]",
                                                                                                children: [cd.date, " (", cd.count, " order)"]
                                                                                            }, cd.date || cIdx)
                                                                                        ))
                                                                                    })
                                                                                ) : (
                                                                                    r.jsx("span", { className: "text-slate-300 dark:text-slate-600 italic", children: "-" })
                                                                                )
                                                                            })
                                                                        ]
                                                                    }, dRow.date || idx);
                                                                })
                                                            }),
                                                            r.jsx("tfoot", {
                                                                className: "bg-slate-100/90 dark:bg-slate-800/90 font-bold border-t border-slate-200 dark:border-slate-800 text-[10.5px] sticky bottom-0 z-10",
                                                                children: r.jsxs("tr", {
                                                                    children: [
                                                                        r.jsx("td", { className: "px-3.5 py-2.5 text-slate-700 dark:text-slate-200 font-black", children: "TOTAL" }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black text-indigo-600 dark:text-indigo-400", children: ke(dailyRows.reduce((s, r) => s + r.metaClicks, 0)) }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black text-amber-600 dark:text-amber-400", children: ke(dailyRows.reduce((s, r) => s + r.shopeeClicks, 0)) }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black text-rose-600 dark:text-rose-400", children: ke(dailyRows.reduce((s, r) => s + r.kebocoran, 0)) }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black", children: ke(dailyRows.reduce((s, r) => s + r.orders, 0)) }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400", children: J(dailyRows.reduce((s, r) => s + r.commission, 0)) }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black text-violet-600 dark:text-violet-400", children: J(dailyRows.reduce((s, r) => s + r.spend, 0)) }),
                                                                        r.jsx("td", { className: `px-3 py-2.5 text-right font-mono font-black ${dailyRows.reduce((s, r) => s + r.profit, 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`, children: J(dailyRows.reduce((s, r) => s + r.profit, 0)) }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black", children: `${(dailyRows.reduce((s, r) => s + r.spend, 0) > 0 ? dailyRows.reduce((s, r) => s + r.commission, 0) / dailyRows.reduce((s, r) => s + r.spend, 0) : 0).toFixed(2)}x` }),
                                                                        r.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-black text-indigo-600 dark:text-indigo-400", children: J(Math.round(dailyRows.reduce((s, r) => s + r.shopeeClicks, 0) > 0 ? dailyRows.reduce((s, r) => s + r.spend, 0) / dailyRows.reduce((s, r) => s + r.shopeeClicks, 0) : 0)) }),
                                                                        r.jsx("td", { className: "px-4 py-2.5" })
                                                                    ]
                                                                })
                                                            })
                                                        ]
                                                    })
                                                })
                                            ]
                                        })
                                    ) : (
                                        r.jsxs("div", {
                                            className: "p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800",
                                            children: [
                                                r.jsx(ma, { size: 36, className: "mx-auto text-slate-300 dark:text-slate-600 mb-2" }),
                                                r.jsx("h4", { className: "text-sm font-bold text-slate-700 dark:text-slate-300", children: "Tidak Ada Data Harian di Rentang Tanggal Ini" }),
                                                r.jsx("p", { className: "text-xs text-slate-400 max-w-md mx-auto mt-1", children: "Pastikan rentang tanggal di filter atas mencakup periode saat iklan Meta ini berjalan atau klik Shopee terjadi." })
                                            ]
                                        })
                                    )
                                ),

                                // METHODOLOGY EXPLANATION NOTE
                                r.jsxs("div", {
                                    className: "p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400",
                                    children: [
                                        r.jsx(Zi, { size: 16, className: "text-indigo-500 flex-shrink-0 mt-0.5" }),
                                        r.jsxs("div", {
                                            children: [
                                                r.jsx("p", {
                                                    className: "font-semibold text-slate-700 dark:text-slate-200",
                                                    children: "Metodologi Analisis Performa Iklan & Penempatan (Multi-Breakdown):"
                                                }),
                                                r.jsx("p", {
                                                    className: "mt-0.5 leading-relaxed",
                                                    children: "Rincian Harian menghitung klik Meta keluar, klik Shopee yang berhasil mendarat, kebocoran klik, dan konversi aktual per tanggal. Untuk penempatan (Placement), estimasi klik Shopee dihitung proporsional terhadap kontribusi link clicks Meta di placement bersangkutan: (Meta Clicks Placement / Total Meta Clicks) × Total Shopee Clicks."
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            });
        })(), Ie && (() => {
            const i = 1 + Ne / 100,
                u = va.map(k => {
                    const D = k.mSpent * i,
                        R = k.mClicks > 0 ? D / k.mClicks : 0,
                        O = k.mImpressions > 0 ? k.mClicks / k.mImpressions * 100 : 0,
                        v = k.sComm - D;
                    return {
                        ...k,
                        spent: D,
                        cpr: R,
                        ctr: O,
                        profit: v
                    }
                }),
                o = u.reduce((k, D) => ({
                    mClicks: k.mClicks + D.mClicks,
                    mImpressions: k.mImpressions + D.mImpressions,
                    sClicks: k.sClicks + D.sClicks,
                    sOrders: k.sOrders + D.sOrders,
                    sComm: k.sComm + D.sComm,
                    spent: k.spent + D.spent,
                    profit: k.profit + D.profit
                }), {
                    mClicks: 0,
                    mImpressions: 0,
                    sClicks: 0,
                    sOrders: 0,
                    sComm: 0,
                    spent: 0,
                    profit: 0
                }),
                d = o.mClicks > 0 ? o.spent / o.mClicks : 0,
                p = o.mImpressions > 0 ? o.mClicks / o.mImpressions * 100 : 0,
                g = ({
                    children: k,
                    color: D
                }) => {
                    const R = {
                        violet: "bg-violet-50 text-violet-600 ring-violet-200",
                        blue: "bg-blue-50 text-blue-600 ring-blue-200",
                        indigo: "bg-indigo-50 text-indigo-600 ring-indigo-200",
                        sky: "bg-sky-50 text-sky-600 ring-sky-200",
                        orange: "bg-orange-50 text-orange-600 ring-orange-200",
                        slate: "bg-slate-100 text-slate-600 ring-slate-200",
                        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200"
                    };
                    return r.jsx("span", {
                        className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${R[D]||R.slate}`,
                        children: k
                    })
                };
            return r.jsx("div", {
                className: "fixed inset-0 z-[9998] flex items-center justify-center p-4",
                style: {
                    backgroundColor: "rgba(99,102,241,0.12)",
                    backdropFilter: "blur(8px)"
                },
                onClick: () => {
                    Ee(null), at(null), Z(null)
                },
                children: r.jsxs("div", {
                    id: "step-tag-modal",
                    className: "bg-white rounded-3xl shadow-xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden border border-indigo-100",
                    onClick: k => k.stopPropagation(),
                    children: [r.jsxs("div", {
                        className: "px-7 pt-6 pb-4 flex items-start justify-between flex-shrink-0 border-b border-slate-100",
                        children: [r.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [r.jsx("div", {
                                className: "w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0",
                                children: r.jsx(cr, {
                                    className: "w-5 h-5 text-indigo-500"
                                })
                            }), r.jsxs("div", {
                                children: [r.jsx("p", {
                                    className: "text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5",
                                    children: "Rincian Performa Harian"
                                }), r.jsx("h3", {
                                    className: "text-slate-800 font-black text-base leading-tight",
                                    children: Ie
                                })]
                            })]
                        }), r.jsx("button", {
                            onClick: () => {
                                Ee(null), at(null), Z(null)
                            },
                            className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all mt-0.5",
                            children: r.jsx(It, {
                                className: "w-4 h-4"
                            })
                        })]
                    }), r.jsx("div", {
                        className: "overflow-auto flex-1 px-2 py-2",
                        children: u.length === 0 ? r.jsxs("div", {
                            className: "flex flex-col items-center justify-center py-20 text-slate-300",
                            children: [r.jsx(Xi, {
                                className: "w-12 h-12 mb-3"
                            }), r.jsx("p", {
                                className: "font-semibold text-slate-400 text-sm",
                                children: "Tidak ada data harian untuk tag ini"
                            }), r.jsx("p", {
                                className: "text-xs mt-1 text-slate-300",
                                children: "Pastikan data sudah diupload & tag sudah dimapping"
                            })]
                        }) : r.jsxs("table", {
                            className: "w-full text-left text-[11px] border-separate border-spacing-0",
                            children: [r.jsx("thead", {
                                className: "sticky top-0 z-10",
                                children: r.jsx("tr", {
                                    children: [{
                                        label: "Tanggal",
                                        align: "left"
                                    }, {
                                        label: "Spent (+PPN)",
                                        align: "right",
                                        dot: "bg-violet-400"
                                    }, {
                                        label: "Meta Click",
                                        align: "right",
                                        dot: "bg-blue-400"
                                    }, {
                                        label: "CTR%",
                                        align: "right",
                                        dot: "bg-indigo-400"
                                    }, {
                                        label: "AVG CPR",
                                        align: "right",
                                        dot: "bg-sky-400"
                                    }, {
                                        label: "Shopee Clicks",
                                        align: "right",
                                        dot: "bg-orange-400"
                                    }, {
                                        label: "Shopee Order",
                                        align: "right",
                                        dot: "bg-slate-400"
                                    }, {
                                        label: "Komisi",
                                        align: "right",
                                        dot: "bg-emerald-400"
                                    }, {
                                        label: "Profit",
                                        align: "right"
                                    }].map((k, D) => r.jsx("th", {
                                        className: `px-4 py-2.5 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-wider whitespace-nowrap border-b border-slate-200 ${D===0?"rounded-tl-xl":""} ${D===8?"rounded-tr-xl":""} text-${k.align}`,
                                        children: r.jsxs("span", {
                                            className: "flex items-center gap-1.5 justify-end",
                                            children: [k.dot && r.jsx("span", {
                                                className: `inline-block w-1.5 h-1.5 rounded-full ${k.dot}`
                                            }), k.label]
                                        })
                                    }, D))
                                })
                            }), r.jsx("tbody", {
                                children: u.map((k, D) => r.jsxs("tr", {
                                    className: "group hover:bg-indigo-50/60 transition-colors duration-100",
                                    children: [r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 font-semibold text-slate-700",
                                        children: qt(k.date)
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right",
                                        children: k.spent > 0 ? r.jsx(g, {
                                            color: "violet",
                                            children: J(k.spent)
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right",
                                        children: k.mClicks > 0 ? r.jsx(g, {
                                            color: "blue",
                                            children: ke(k.mClicks)
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right",
                                        children: k.ctr > 0 ? r.jsxs(g, {
                                            color: "indigo",
                                            children: [k.ctr.toFixed(2), "%"]
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right text-slate-500 font-medium",
                                        children: k.cpr > 0 ? J(k.cpr) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right",
                                        children: k.sClicks > 0 ? r.jsx(g, {
                                            color: "orange",
                                            children: ke(k.sClicks)
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right",
                                        children: k.sOrders > 0 ? r.jsxs("div", {
                                            className: "inline-flex items-center gap-1 justify-end",
                                            children: [r.jsxs("button", {
                                                onClick: () => at({
                                                    date: k.date,
                                                    orders: k.ordersList
                                                }),
                                                className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ring-1 bg-slate-100 text-slate-600 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:ring-indigo-200 transition-all cursor-pointer",
                                                title: "Klik untuk lihat daftar produk",
                                                children: [ke(k.sOrders), r.jsx(wm, {
                                                    size: 9,
                                                    className: "opacity-60"
                                                })]
                                            }), k.clickDates && k.clickDates.length > 0 && r.jsx("button", {
                                                onClick: () => Z({
                                                    orderDate: k.date,
                                                    tag: Ie,
                                                    clickDates: k.clickDates
                                                }),
                                                className: "inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-amber-50 text-amber-500 ring-1 ring-amber-200 hover:bg-amber-100 hover:text-amber-600 transition-all cursor-pointer flex-shrink-0",
                                                title: "Lihat distribusi tanggal klik",
                                                children: r.jsx(cr, {
                                                    size: 9
                                                })
                                            })]
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right",
                                        children: k.sComm > 0 ? r.jsx(g, {
                                            color: "emerald",
                                            children: J(k.sComm)
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    }), r.jsx("td", {
                                        className: "px-4 py-2.5 whitespace-nowrap border-b border-slate-100 text-right font-bold",
                                        children: k.spent > 0 || k.sComm > 0 ? r.jsx("span", {
                                            className: `px-2.5 py-0.5 rounded-full text-[10px] ring-1 ${k.profit>0?"bg-emerald-50 text-emerald-600 ring-emerald-200":k.profit<0?"bg-rose-50 text-rose-500 ring-rose-200":"bg-slate-100 text-slate-400 ring-slate-200"}`,
                                            children: J(k.profit)
                                        }) : r.jsx("span", {
                                            className: "text-slate-200",
                                            children: "—"
                                        })
                                    })]
                                }, k.date || D))
                            }), r.jsx("tfoot", {
                                children: r.jsxs("tr", {
                                    children: [r.jsxs("td", {
                                        className: "px-4 py-3 rounded-bl-xl border-t-2 border-indigo-100 bg-indigo-50/70 font-black text-indigo-700 text-[11px] uppercase tracking-wider whitespace-nowrap",
                                        children: ["Total · ", u.length, " hari"]
                                    }), r.jsx("td", {
                                        className: "px-4 py-3 border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-bold text-violet-600 whitespace-nowrap",
                                        children: J(o.spent)
                                    }), r.jsx("td", {
                                        className: "px-4 py-3 border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-bold text-blue-600 whitespace-nowrap",
                                        children: ke(o.mClicks)
                                    }), r.jsx("td", {
                                        className: "px-4 py-3 border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-bold text-indigo-600 whitespace-nowrap",
                                        children: p > 0 ? `${p.toFixed(2)}%` : "—"
                                    }), r.jsx("td", {
                                        className: "px-4 py-3 border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-medium text-slate-500 whitespace-nowrap",
                                        children: d > 0 ? J(d) : "—"
                                    }), r.jsx("td", {
                                        className: "px-4 py-3 border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-bold text-orange-500 whitespace-nowrap",
                                        children: ke(o.sClicks)
                                    }), r.jsx("td", {
                                        className: "px-4 py-3 border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-bold text-slate-700 whitespace-nowrap",
                                        children: ke(o.sOrders)
                                    }), r.jsx("td", {
                                        className: "px-4 py-3 border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-bold text-emerald-600 whitespace-nowrap",
                                        children: J(o.sComm)
                                    }), r.jsx("td", {
                                        className: `px-4 py-3 rounded-br-xl border-t-2 border-indigo-100 bg-indigo-50/70 text-right font-black whitespace-nowrap ${o.profit>=0?"text-emerald-600":"text-rose-500"}`,
                                        children: J(o.profit)
                                    })]
                                })
                            })]
                        })
                    }), r.jsxs("div", {
                        className: "px-7 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between flex-shrink-0 rounded-b-3xl",
                        children: [r.jsx("p", {
                            className: "text-[11px] text-slate-400",
                            children: "Klik di luar modal untuk menutup"
                        }), r.jsx("button", {
                            onClick: () => {
                                Ee(null), at(null), Z(null)
                            },
                            className: "text-xs font-bold text-slate-500 hover:text-indigo-600 px-4 py-1.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all shadow-sm",
                            children: "Tutup"
                        })]
                    })]
                })
            })
        })(), Oe && r.jsx("div", {
            className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            style: {
                backgroundColor: "rgba(15,23,42,0.45)",
                backdropFilter: "blur(6px)"
            },
            onClick: () => Z(null),
            children: r.jsxs("div", {
                className: "bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[82vh] flex flex-col overflow-hidden border border-slate-200",
                onClick: i => i.stopPropagation(),
                children: [r.jsxs("div", {
                    className: "px-5 pt-5 pb-4 flex items-start justify-between border-b border-slate-100",
                    children: [r.jsxs("div", {
                        children: [r.jsx("p", {
                            className: "text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5",
                            children: "Distribusi Tanggal Klik"
                        }), r.jsx("h3", {
                            className: "text-sm font-black text-slate-800",
                            children: Oe.label ?? `Pesanan ${qt(Oe.orderDate)}`
                        }), r.jsx("p", {
                            className: "text-[10px] text-slate-400 mt-0.5",
                            children: "Pada tanggal berapa klik yang menghasilkan pesanan?"
                        })]
                    }), r.jsx("button", {
                        onClick: () => Z(null),
                        className: "w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all flex-shrink-0 mt-0.5",
                        children: r.jsx(It, {
                            className: "w-3.5 h-3.5"
                        })
                    })]
                }), r.jsx("div", {
                    className: "overflow-auto flex-1 px-5 py-5",
                    children: (() => {
                        const i = Oe.clickDates,
                            u = Math.max(...i.map(p => p.count), 1),
                            o = i.reduce((p, g) => p + g.count, 0),
                            d = !!Oe.orderDate;
                        return r.jsxs("div", {
                            className: "space-y-3",
                            children: [i.map((p, g) => {
                                const k = p.count / u * 100,
                                    D = d && p.date === Oe.orderDate,
                                    R = d ? Math.round((new Date(Oe.orderDate) - new Date(p.date)) / 864e5) : null;
                                return r.jsxs("div", {
                                    className: "flex items-center gap-3",
                                    children: [r.jsxs("div", {
                                        className: "w-[72px] flex-shrink-0 text-right",
                                        children: [r.jsx("div", {
                                            className: "text-[10px] font-mono font-semibold text-slate-600",
                                            children: xt(p.date)
                                        }), R !== null && R > 0 && r.jsxs("div", {
                                            className: "text-[9px] text-slate-300",
                                            children: ["-", R, "h"]
                                        }), R === 0 && r.jsx("div", {
                                            className: "text-[9px] text-emerald-400 font-semibold",
                                            children: "hari ini"
                                        })]
                                    }), r.jsxs("div", {
                                        className: "flex-1 flex items-center gap-2",
                                        children: [r.jsx("div", {
                                            className: "flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden",
                                            children: r.jsx("div", {
                                                className: `h-full rounded-lg flex items-center justify-end px-2 transition-all duration-500 ${D?"bg-emerald-400":"bg-amber-400"}`,
                                                style: {
                                                    width: `${Math.max(k,4)}%`
                                                },
                                                children: k >= 20 && r.jsx("span", {
                                                    className: "text-white text-[10px] font-bold",
                                                    children: p.count
                                                })
                                            })
                                        }), k < 20 && r.jsx("span", {
                                            className: "text-[10px] font-bold text-slate-600 w-4 flex-shrink-0",
                                            children: p.count
                                        }), r.jsxs("span", {
                                            className: "text-[9px] text-slate-300 w-8 flex-shrink-0 text-right",
                                            children: [Math.round(p.count / o * 100), "%"]
                                        })]
                                    })]
                                }, p.date || g)
                            }), d && r.jsxs("div", {
                                className: "flex items-center gap-4 pt-3 border-t border-slate-100 mt-2",
                                children: [r.jsxs("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [r.jsx("span", {
                                        className: "w-3 h-3 rounded-sm bg-emerald-400 flex-shrink-0"
                                    }), r.jsx("span", {
                                        className: "text-[10px] text-slate-400",
                                        children: "Klik di hari yang sama dengan pesanan"
                                    })]
                                }), r.jsxs("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [r.jsx("span", {
                                        className: "w-3 h-3 rounded-sm bg-amber-400 flex-shrink-0"
                                    }), r.jsx("span", {
                                        className: "text-[10px] text-slate-400",
                                        children: "Klik hari sebelumnya"
                                    })]
                                })]
                            })]
                        })
                    })()
                }), r.jsxs("div", {
                    className: "px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between rounded-b-2xl",
                    children: [r.jsxs("p", {
                        className: "text-[10px] text-slate-400",
                        children: ["Total ", Oe.clickDates.reduce((i, u) => i + u.count, 0), " pesanan dari ", Oe.clickDates.length, " hari klik berbeda"]
                    }), r.jsx("button", {
                        onClick: () => Z(null),
                        className: "text-xs font-bold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all shadow-sm",
                        children: "Tutup"
                    })]
                })]
            })
        }), lt && r.jsx("div", {
            className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            style: {
                backgroundColor: "rgba(15,23,42,0.45)",
                backdropFilter: "blur(6px)"
            },
            onClick: () => at(null),
            children: r.jsxs("div", {
                className: "bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[82vh] flex flex-col overflow-hidden border border-slate-200",
                onClick: i => i.stopPropagation(),
                children: [r.jsxs("div", {
                    className: "px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100",
                    children: [r.jsxs("div", {
                        children: [r.jsx("p", {
                            className: "text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5",
                            children: "Daftar Produk Dipesan"
                        }), r.jsx("h3", {
                            className: "text-sm font-black text-slate-800",
                            children: lt.date
                        })]
                    }), r.jsx("button", {
                        onClick: () => at(null),
                        className: "w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all",
                        children: r.jsx(It, {
                            className: "w-3.5 h-3.5"
                        })
                    })]
                }), r.jsx("div", {
                    className: "overflow-auto flex-1",
                    children: lt.orders.length === 0 ? r.jsxs("div", {
                        className: "py-10 text-center text-slate-400 p-4",
                        children: [r.jsx(fa, {
                            className: "w-8 h-8 mx-auto mb-2 opacity-30"
                        }), r.jsxs("p", {
                            className: "text-xs",
                            children: ["Data produk tidak tersedia.", r.jsx("br", {}), "Pastikan kolom ", r.jsx("b", {
                                children: "Nama Produk"
                            }), " & ", r.jsx("b", {
                                children: "Kategori"
                            }), " ada di CSV."]
                        })]
                    }) : r.jsxs("table", {
                        className: "w-full text-left text-[11px] border-separate border-spacing-0",
                        children: [r.jsx("thead", {
                            className: "sticky top-0 z-10",
                            children: r.jsx("tr", {
                                children: ["No", "Kode Pesanan", "Nama Produk", "Kategori", "Total Komisi"].map((i, u) => r.jsx("th", {
                                    className: `px-3 py-2.5 bg-slate-50 font-bold text-slate-500 text-[10px] uppercase tracking-wider whitespace-nowrap border-b border-slate-200 ${u===0?"text-center":""}`,
                                    children: i
                                }, u))
                            })
                        }), r.jsx("tbody", {
                            children: lt.orders.map((i, u) => r.jsxs("tr", {
                                className: `${u%2===0?"bg-white":"bg-slate-50/50"} hover:bg-indigo-50/40 transition-colors`,
                                children: [r.jsx("td", {
                                    className: "px-3 py-2 text-center text-slate-400 font-bold text-[10px] border-b border-slate-100 whitespace-nowrap",
                                    children: u + 1
                                }), r.jsx("td", {
                                    className: "px-3 py-2 border-b border-slate-100 whitespace-nowrap",
                                    children: r.jsx("span", {
                                        className: "font-mono text-[10px] text-indigo-600 font-semibold",
                                        children: i.orderId
                                    })
                                }), r.jsx("td", {
                                    className: "px-3 py-2 border-b border-slate-100 max-w-[180px]",
                                    children: r.jsx("span", {
                                        className: "text-slate-700 leading-snug line-clamp-2",
                                        children: i.name || r.jsx("span", {
                                            className: "text-slate-300 italic",
                                            children: "—"
                                        })
                                    })
                                }), r.jsx("td", {
                                    className: "px-3 py-2 border-b border-slate-100 whitespace-nowrap",
                                    children: r.jsx("span", {
                                        className: "text-slate-500",
                                        children: i.category || "—"
                                    })
                                }), r.jsx("td", {
                                    className: "px-3 py-2 border-b border-slate-100 whitespace-nowrap text-right",
                                    children: r.jsx("span", {
                                        className: `font-bold ${i.comm>0?"text-emerald-600":"text-slate-300"}`,
                                        children: i.comm > 0 ? J(i.comm) : "—"
                                    })
                                })]
                            }, i.orderId ? `${i.orderId}-${u}` : u))
                        })]
                    })
                }), r.jsxs("div", {
                    className: "px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between rounded-b-2xl",
                    children: [r.jsxs("p", {
                        className: "text-[10px] text-slate-400",
                        children: [lt.orders.length, " produk · Diurutkan dari komisi tertinggi"]
                    }), r.jsx("button", {
                        onClick: () => at(null),
                        className: "text-xs font-bold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all shadow-sm",
                        children: "Tutup"
                    })]
                })]
            })
        })]
    })
}


export default Im;
