import { useState, useEffect, useRef } from "react";

// ─── FONTS ─────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

// ─── MOCK DATA ─────────────────────────────────────────────────
const PORTFOLIO = {
  totalUsd: 284750.00,
  change24h: +1240.33,
  changePct: +0.44,
  accounts: [
    { id: "ba1", label: "USD Checking", type: "bank", balance: 48200.00, routing: "026015422", acct: "****7741", bank: "Cross River Bank", color: "#3b82f6" },
    { id: "ba2", label: "USD Savings", type: "bank", balance: 12500.00, routing: "026015422", acct: "****3382", bank: "Cross River Bank", color: "#6366f1" },
  ],
  stablecoins: [
    { id: "sc1", symbol: "USDB", name: "Bridge Dollar", balance: 186250.00, apy: 5.1, chain: "Base", color: "#f0a500", icon: "◈" },
    { id: "sc2", symbol: "USDC", name: "USD Coin", balance: 28800.00, apy: 0, chain: "Base", color: "#2775ca", icon: "●" },
    { id: "sc3", symbol: "USDT", name: "Tether", balance: 9000.00, apy: 0, chain: "Tron", color: "#26a17b", icon: "◆" },
  ],
  card: { last4: "4829", limit: 50000, spent: 8340.22, available: 41659.78 },
};

const TRANSACTIONS = [
  { id:1, date:"Feb 27",  type:"deposit",   desc:"ACH from Hmart Distribution",      amount:+42000,  currency:"USD",  status:"completed", cat:"receivable" },
  { id:2, date:"Feb 27",  type:"swap",      desc:"USD → USDB (yield conversion)",    amount:-42000,  currency:"USD",  status:"completed", cat:"swap" },
  { id:3, date:"Feb 26",  type:"yield",     desc:"USDB daily yield credit",          amount:+26.11,  currency:"USDB", status:"completed", cat:"yield" },
  { id:4, date:"Feb 25",  type:"wire_out",  desc:"Wire to Napas Furniture Co.",      amount:-18500,  currency:"USD",  status:"completed", cat:"supplier" },
  { id:5, date:"Feb 25",  type:"card",      desc:"Amazon Seller Fees",               amount:-320.00, currency:"USD",  status:"completed", cat:"card" },
  { id:6, date:"Feb 24",  type:"deposit",   desc:"Stripe payout – Shopify store",   amount:+6800,   currency:"USD",  status:"completed", cat:"receivable" },
  { id:7, date:"Feb 24",  type:"card",      desc:"Google Ads",                       amount:-450.00, currency:"USD",  status:"completed", cat:"card" },
  { id:8, date:"Feb 23",  type:"wire_in",   desc:"Wire from IKEA Vietnam Exports",   amount:+95000,  currency:"USD",  status:"completed", cat:"receivable" },
  { id:9, date:"Feb 23",  type:"swap",      desc:"USD → USDB",                       amount:-95000,  currency:"USD",  status:"completed", cat:"swap" },
  { id:10,date:"Feb 22",  type:"card",      desc:"AWS Services",                     amount:-284.00, currency:"USD",  status:"completed", cat:"card" },
  { id:11,date:"Feb 21",  type:"wire_out",  desc:"Wire to Lee & Associates LLC",     amount:-22000,  currency:"USD",  status:"pending",   cat:"supplier" },
  { id:12,date:"Feb 20",  type:"yield",     desc:"USDB daily yield credit",          amount:+24.88,  currency:"USDB", status:"completed", cat:"yield" },
];

const SUPPLIERS = [
  { id:"s1", name:"Lee & Associates LLC",   country:"🇺🇸 New York",   currency:"USD", lastPaid:"Feb 21", amount:22000,  status:"pending",   category:"Legal" },
  { id:"s2", name:"Napas Furniture Co.",    country:"🇺🇸 California", currency:"USD", lastPaid:"Feb 25", amount:18500,  status:"paid",      category:"Supplier" },
  { id:"s3", name:"Pacific Freight Group",  country:"🇺🇸 Los Angeles",currency:"USD", lastPaid:"Feb 18", amount:4200,   status:"paid",      category:"Logistics" },
  { id:"s4", name:"GreenTree Warehousing",  country:"🇺🇸 New Jersey", currency:"USD", lastPaid:"Jan 30", amount:8750,   status:"scheduled", category:"Warehouse" },
];

const RECEIVABLES = [
  { id:"r1", from:"Hmart Distribution",    amount:42000,  due:"Feb 27", status:"received", type:"ACH" },
  { id:"r2", from:"IKEA Vietnam Exports",  amount:95000,  due:"Feb 23", status:"received", type:"Wire" },
  { id:"r3", from:"Amazon Disbursement",   amount:12400,  due:"Mar 01", status:"pending",  type:"ACH" },
  { id:"r4", from:"Costco Wholesale",      amount:67500,  due:"Mar 05", status:"pending",  type:"Wire" },
  { id:"r5", from:"Whole Foods Market",    amount:18200,  due:"Mar 10", status:"pending",  type:"Wire" },
];

const fmt = (n, dec=2) => Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});
const fmtShort = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${fmt(n)}`;

// ─── STYLES ────────────────────────────────────────────────────
const G = {
  bg:      "#0c0f14",
  surf:    "#141920",
  surf2:   "#1a2130",
  surf3:   "#202a3a",
  border:  "#26334a",
  border2: "#2e3f58",
  gold:    "#f0a500",
  goldD:   "#c88800",
  green:   "#22c55e",
  greenD:  "#16a34a",
  blue:    "#3b82f6",
  red:     "#ef4444",
  text:    "#e2eaf4",
  dim:     "#8fa3c0",
  muted:   "#4a5f7a",
};

const css = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${G.bg}; font-family: 'Plus Jakarta Sans', sans-serif; color: ${G.text}; overflow: hidden; height: 100vh; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${G.border2}; border-radius: 2px; }

.app { display: flex; height: 100vh; overflow: hidden; }

/* SIDEBAR */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: ${G.surf};
  border-right: 1px solid ${G.border};
  display: flex; flex-direction: column;
  padding: 24px 0 16px;
}
.logo {
  padding: 0 24px 28px;
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700;
  color: ${G.gold};
  letter-spacing: -0.02em;
  display: flex; align-items: center; gap: 8px;
}
.logo-sub { font-size: 10px; color: ${G.muted}; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
.nav-section { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${G.muted}; padding: 0 24px 8px; margin-top: 8px; }
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 24px; cursor: pointer;
  font-size: 13px; font-weight: 500; color: ${G.dim};
  border-left: 2px solid transparent;
  transition: all 0.15s;
}
.nav-item:hover { color: ${G.text}; background: ${G.surf2}; }
.nav-item.active { color: ${G.gold}; background: rgba(240,165,0,0.07); border-left-color: ${G.gold}; }
.nav-icon { font-size: 15px; width: 18px; text-align: center; }
.nav-badge { margin-left: auto; background: ${G.red}; color: #fff; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 10px; }
.sidebar-footer { margin-top: auto; padding: 16px 24px 0; border-top: 1px solid ${G.border}; }
.user-row { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, ${G.gold}, ${G.goldD}); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #000; }
.user-name { font-size: 12px; font-weight: 600; }
.user-role { font-size: 10px; color: ${G.dim}; }

/* MAIN */
.main { flex: 1; overflow-y: auto; background: ${G.bg}; }
.page { padding: 32px 36px; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
.page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
.page-sub { font-size: 13px; color: ${G.dim}; margin-top: 4px; }
.fx-ticker { display: flex; gap: 20px; }
.fx-item { text-align: right; }
.fx-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: ${G.muted}; font-family: 'JetBrains Mono', monospace; }
.fx-val { font-size: 14px; font-family: 'JetBrains Mono', monospace; color: ${G.text}; }
.fx-chg { font-size: 10px; font-family: 'JetBrains Mono', monospace; }

/* CARDS */
.card { background: ${G.surf}; border: 1px solid ${G.border}; border-radius: 14px; }
.card-sm { border-radius: 12px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

/* STAT CARD */
.stat-card { padding: 20px 22px; position: relative; overflow: hidden; }
.stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: ${G.muted}; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
.stat-val { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
.stat-sub { font-size: 11px; color: ${G.dim}; margin-top: 4px; }
.stat-glow { position: absolute; top: -30px; right: -30px; width: 100px; height: 100px; border-radius: 50%; opacity: 0.08; }

/* SECTION HEADER */
.section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-title { font-size: 13px; font-weight: 700; letter-spacing: 0.02em; }
.section-link { font-size: 11px; color: ${G.gold}; cursor: pointer; font-family: 'JetBrains Mono', monospace; }

/* ACCOUNT ROW */
.account-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid ${G.border};
  cursor: pointer; transition: background 0.1s;
}
.account-row:last-child { border-bottom: none; }
.account-row:hover { background: ${G.surf2}; }
.acc-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.acc-name { font-size: 13px; font-weight: 600; }
.acc-sub { font-size: 11px; color: ${G.dim}; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
.acc-bal { margin-left: auto; text-align: right; }
.acc-bal-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; }
.acc-apy { font-size: 10px; color: ${G.green}; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

/* TXN ROW */
.txn-row { display: flex; align-items: center; gap: 12px; padding: 11px 18px; border-bottom: 1px solid ${G.border}; cursor: pointer; transition: background 0.1s; }
.txn-row:last-child { border-bottom: none; }
.txn-row:hover { background: ${G.surf2}; }
.txn-icon { width: 32px; height: 32px; border-radius: 9px; background: ${G.surf2}; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.txn-desc { font-size: 13px; font-weight: 500; }
.txn-date { font-size: 11px; color: ${G.dim}; margin-top: 1px; }
.txn-amt { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; text-align: right; white-space: nowrap; }
.txn-cur { font-size: 10px; color: ${G.muted}; margin-top: 2px; }

/* BADGE */
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
.badge-green { background: rgba(34,197,94,0.12); color: ${G.green}; border: 1px solid rgba(34,197,94,0.2); }
.badge-gold { background: rgba(240,165,0,0.12); color: ${G.gold}; border: 1px solid rgba(240,165,0,0.2); }
.badge-blue { background: rgba(59,130,246,0.12); color: ${G.blue}; border: 1px solid rgba(59,130,246,0.2); }
.badge-red { background: rgba(239,68,68,0.12); color: ${G.red}; border: 1px solid rgba(239,68,68,0.2); }
.badge-muted { background: rgba(74,95,122,0.2); color: ${G.dim}; border: 1px solid ${G.border}; }

/* BUTTON */
.btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 9px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn-primary { background: ${G.gold}; color: #000; }
.btn-primary:hover { background: #ffc107; transform: translateY(-1px); }
.btn-ghost { background: ${G.surf2}; color: ${G.text}; border: 1px solid ${G.border}; }
.btn-ghost:hover { background: ${G.surf3}; border-color: ${G.border2}; }
.btn-sm { padding: 6px 13px; font-size: 12px; }

/* MODAL */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal { background: ${G.surf}; border: 1px solid ${G.border2}; border-radius: 18px; width: 480px; max-width: calc(100vw - 32px); max-height: calc(100vh - 64px); overflow-y: auto; }
.modal-header { padding: 24px 28px 0; display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-family: 'Playfair Display', serif; font-size: 20px; }
.modal-close { width: 32px; height: 32px; border-radius: 8px; background: ${G.surf2}; border: 1px solid ${G.border}; color: ${G.dim}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.modal-body { padding: 20px 28px 28px; }

/* INPUT */
.inp-group { margin-bottom: 16px; }
.inp-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${G.muted}; margin-bottom: 7px; font-family: 'JetBrains Mono', monospace; }
.inp { width: 100%; background: ${G.surf2}; border: 1px solid ${G.border}; border-radius: 10px; padding: 12px 14px; color: ${G.text}; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s; }
.inp:focus { border-color: ${G.gold}; }
.inp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.amount-inp-wrap { position: relative; }
.amount-inp-wrap .inp { padding-left: 36px; font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; }
.amount-inp-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${G.dim}; font-family: 'JetBrains Mono', monospace; font-size: 18px; }
.select { width: 100%; background: ${G.surf2}; border: 1px solid ${G.border}; border-radius: 10px; padding: 12px 14px; color: ${G.text}; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; outline: none; cursor: pointer; }

/* YIELD COUNTER ANIMATION */
@keyframes tick { from { opacity: 0.7; } to { opacity: 1; } }
.yield-tick { animation: tick 1s ease infinite; }

/* SWAP ARROW */
.swap-arrow { display: flex; justify-content: center; align-items: center; padding: 4px 0; }
.swap-arrow-btn { width: 36px; height: 36px; border-radius: 50%; background: ${G.surf3}; border: 1px solid ${G.border2}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.2s; }
.swap-arrow-btn:hover { background: rgba(240,165,0,0.15); border-color: ${G.gold}; transform: rotate(180deg); }

/* RATE PREVIEW */
.rate-box { background: ${G.surf2}; border: 1px solid ${G.border}; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; }
.rate-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.rate-row:last-child { margin-bottom: 0; }
.rate-label { font-size: 12px; color: ${G.dim}; }
.rate-val { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

/* CARD VISUAL */
.visa-card {
  border-radius: 18px;
  background: linear-gradient(135deg, #1a2038 0%, #0d1525 50%, #1a1508 100%);
  border: 1px solid rgba(240,165,0,0.2);
  padding: 28px 26px;
  position: relative; overflow: hidden;
}
.visa-card::before {
  content: '';
  position: absolute; top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(240,165,0,0.15) 0%, transparent 70%);
}
.visa-card::after {
  content: '';
  position: absolute; bottom: -40px; left: -40px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
}

/* SPEND BAR */
.spend-bar { background: ${G.surf2}; border-radius: 100px; height: 6px; overflow: hidden; }
.spend-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, ${G.gold}, #fbbf24); transition: width 0.6s ease; }

/* PROGRESS */
.progress-ring { display: inline-flex; align-items: center; justify-content: center; }

/* TABS */
.tabs { display: flex; gap: 4px; background: ${G.surf2}; border-radius: 10px; padding: 4px; margin-bottom: 20px; }
.tab { padding: 7px 16px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; color: ${G.dim}; }
.tab.active { background: ${G.surf}; color: ${G.text}; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }

/* EMPTY */
.empty-state { text-align: center; padding: 48px; color: ${G.dim}; font-size: 14px; }

/* INFO ROW */
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid ${G.border}; font-size: 13px; }
.info-row:last-child { border-bottom: none; }
.info-label { color: ${G.dim}; }
.info-val { font-family: 'JetBrains Mono', monospace; font-weight: 500; }

/* ALERT BOX */
.alert { display: flex; gap: 12px; background: rgba(240,165,0,0.07); border: 1px solid rgba(240,165,0,0.2); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 12px; color: ${G.dim}; }
.alert-icon { font-size: 16px; flex-shrink: 0; }

/* DIVIDER */
.divider { border: none; border-top: 1px solid ${G.border}; margin: 20px 0; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.fade-up { animation: fadeUp 0.3s ease both; }

/* TOOLTIP-LIKE hover */
.copy-btn { font-size: 11px; color: ${G.muted}; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: color 0.1s; }
.copy-btn:hover { color: ${G.gold}; }
`;

// ─── ICON MAP ────────────────────────────────────────────────
const txnIcon = { deposit:"⬇️", wire_in:"🏦", wire_out:"⬆️", swap:"↔️", card:"💳", yield:"📈", withdrawal:"⬆️" };
const txnColor = (t) => ["deposit","wire_in","yield"].includes(t) ? G.green : t==="swap" ? G.blue : G.red;
const statusBadge = (s) => s==="completed" ? "badge-green" : s==="pending" ? "badge-gold" : s==="scheduled" ? "badge-blue" : "badge-muted";

// ─── LIVE YIELD HOOK ─────────────────────────────────────────
function useLiveYield(principal, apy) {
  const [earned, setEarned] = useState((principal * apy / 100 / 365 * 58) / 1440);
  useEffect(() => {
    const perSecond = principal * apy / 100 / 365 / 86400;
    const id = setInterval(() => setEarned(v => v + perSecond * 2), 2000);
    return () => clearInterval(id);
  }, [principal, apy]);
  return earned;
}

// ─────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────

function Dashboard({ setScreen }) {
  const totalUSDB = PORTFOLIO.stablecoins.find(s=>s.symbol==="USDB").balance;
  const earned = useLiveYield(totalUSDB, 5.1);
  const total = PORTFOLIO.accounts.reduce((s,a)=>s+a.balance,0) + PORTFOLIO.stablecoins.reduce((s,a)=>s+a.balance,0);
  const pendingIn = RECEIVABLES.filter(r=>r.status==="pending").reduce((s,r)=>s+r.amount,0);

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div>
          <div className="page-title">Treasury Dashboard</div>
          <div className="page-sub">Good morning, Minh Tuan · Friday, Feb 27, 2026</div>
        </div>
        <div className="fx-ticker">
          {[["USD/VND","25,428","+0.12%","#22c55e"],["BTC/USD","89,241","-0.8%","#ef4444"],["USDT/VND","25,410","+0.08%","#22c55e"]].map(([lbl,v,c,col])=>(
            <div key={lbl} className="fx-item">
              <div className="fx-label">{lbl}</div>
              <div className="fx-val">{v}</div>
              <div className="fx-chg" style={{color:col}}>{c}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid-4" style={{marginBottom:20}}>
        {[
          { label:"Total Holdings (USD)", val:`$${fmt(total)}`, sub:"Across all accounts", color:G.gold, glow:G.gold },
          { label:"Yield Today", val:`+$${fmt(earned,4)}`, sub:"5.1% APY on USDB", color:G.green, glow:G.green, tick:true },
          { label:"Pending Receivables", val:fmtShort(pendingIn), sub:`${RECEIVABLES.filter(r=>r.status==="pending").length} invoices due`, color:G.blue, glow:G.blue },
          { label:"Card Available", val:`$${fmt(PORTFOLIO.card.available)}`, sub:`$${fmt(PORTFOLIO.card.spent)} spent this month`, color:"#e2eaf4", glow:"#3b82f6" },
        ].map(({label,val,sub,color,glow,tick})=>(
          <div key={label} className="card stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-val" style={{color}} className={`stat-val ${tick?"yield-tick":""}`}>{val}</div>
            <div className="stat-sub">{sub}</div>
            <div className="stat-glow" style={{background:glow}} />
          </div>
        ))}
      </div>

      <div className="grid-2" style={{marginBottom:20}}>
        {/* ACCOUNTS */}
        <div className="card">
          <div style={{padding:"16px 18px 0"}}>
            <div className="section-hdr">
              <div className="section-title">💵 USD Bank Accounts</div>
              <div className="section-link" onClick={()=>setScreen("accounts")}>Manage →</div>
            </div>
          </div>
          {PORTFOLIO.accounts.map(a=>(
            <div key={a.id} className="account-row" onClick={()=>setScreen("accounts")}>
              <div className="acc-icon" style={{background:`${a.color}18`}}>🏦</div>
              <div><div className="acc-name">{a.label}</div><div className="acc-sub">{a.acct} · {a.bank}</div></div>
              <div className="acc-bal">
                <div className="acc-bal-val">${fmt(a.balance)}</div>
                <div style={{fontSize:10,color:G.muted,marginTop:2}}>ACH/Wire ready</div>
              </div>
            </div>
          ))}
          <div style={{padding:"12px 18px"}}>
            <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={()=>setScreen("accounts")}>
              + Add Account / Deposit
            </button>
          </div>
        </div>

        {/* STABLECOINS */}
        <div className="card">
          <div style={{padding:"16px 18px 0"}}>
            <div className="section-hdr">
              <div className="section-title">🪙 Stablecoin Wallets</div>
              <div className="section-link" onClick={()=>setScreen("stablecoin")}>Manage →</div>
            </div>
          </div>
          {PORTFOLIO.stablecoins.map(s=>(
            <div key={s.id} className="account-row" onClick={()=>setScreen("stablecoin")}>
              <div className="acc-icon" style={{background:`${s.color}18`,color:s.color,fontFamily:"JetBrains Mono",fontSize:18}}>{s.icon}</div>
              <div><div className="acc-name">{s.symbol}</div><div className="acc-sub">{s.chain} · {s.name}</div></div>
              <div className="acc-bal">
                <div className="acc-bal-val">${fmt(s.balance)}</div>
                {s.apy > 0 ? <div className="acc-apy">+{s.apy}% APY ✦</div> : <div style={{fontSize:10,color:G.muted,marginTop:2}}>No yield</div>}
              </div>
            </div>
          ))}
          <div style={{padding:"12px 18px"}}>
            <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={()=>setScreen("swap")}>
              ↔ Swap Stablecoins
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* RECENT ACTIVITY */}
        <div className="card">
          <div style={{padding:"16px 18px 0"}}>
            <div className="section-hdr">
              <div className="section-title">⚡ Recent Activity</div>
              <div className="section-link" onClick={()=>setScreen("transactions")}>All →</div>
            </div>
          </div>
          {TRANSACTIONS.slice(0,6).map(t=>(
            <div key={t.id} className="txn-row">
              <div className="txn-icon">{txnIcon[t.type]||"💱"}</div>
              <div><div className="txn-desc">{t.desc}</div><div className="txn-date">{t.date}</div></div>
              <div className="txn-amt">
                <div style={{color:t.amount>0?G.green:G.text}}>{t.amount>0?"+":"-"}${fmt(Math.abs(t.amount))}</div>
                <div className="txn-cur">{t.currency}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RECEIVABLES SNAPSHOT */}
        <div className="card">
          <div style={{padding:"16px 18px 0"}}>
            <div className="section-hdr">
              <div className="section-title">📥 Pending Receivables</div>
              <div className="section-link" onClick={()=>setScreen("receivables")}>View all →</div>
            </div>
          </div>
          {RECEIVABLES.filter(r=>r.status==="pending").map(r=>(
            <div key={r.id} className="txn-row">
              <div className="txn-icon">📄</div>
              <div>
                <div className="txn-desc">{r.from}</div>
                <div className="txn-date">Due {r.due} · {r.type}</div>
              </div>
              <div className="txn-amt">
                <div style={{color:G.blue}}>+${fmt(r.amount)}</div>
                <span className={`badge ${statusBadge(r.status)}`} style={{marginTop:3}}>{r.status}</span>
              </div>
            </div>
          ))}
          <div style={{padding:"10px 18px 14px",display:"flex",gap:8,borderTop:`1px solid ${G.border}`,marginTop:2}}>
            <div style={{fontSize:12,color:G.dim}}>Expected this week:</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:12,color:G.green,fontWeight:600}}>${fmt(RECEIVABLES.filter(r=>r.status==="pending").reduce((s,r)=>s+r.amount,0))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Accounts({ openModal }) {
  return (
    <div className="page fade-up">
      <div className="page-header">
        <div><div className="page-title">Bank Accounts</div><div className="page-sub">USD virtual accounts with ACH & wire capabilities</div></div>
        <button className="btn btn-primary" onClick={()=>openModal("deposit")}>+ Deposit Funds</button>
      </div>

      <div className="alert"><div className="alert-icon">💡</div><div>Your USD accounts are issued in your name by Cross River Bank, FDIC insured up to $250,000. Share your routing and account numbers with US partners to receive ACH or wire transfers directly.</div></div>

      {PORTFOLIO.accounts.map(a=>(
        <div key={a.id} className="card" style={{marginBottom:14}}>
          <div style={{padding:"20px 22px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div>
                <div style={{fontSize:11,fontFamily:"JetBrains Mono",letterSpacing:"0.1em",textTransform:"uppercase",color:G.muted,marginBottom:4}}>{a.bank}</div>
                <div style={{fontFamily:"Playfair Display, serif",fontSize:20,fontWeight:600}}>{a.label}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"JetBrains Mono",fontSize:24,fontWeight:600,color:G.gold}}>${fmt(a.balance)}</div>
                <div style={{fontSize:11,color:G.muted,marginTop:2}}>Available balance</div>
              </div>
            </div>
            <div style={{background:G.surf2,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
              <div className="info-row"><div className="info-label">Routing Number</div><div className="info-val" style={{display:"flex",gap:6,alignItems:"center"}}>{a.routing} <span className="copy-btn">⧉</span></div></div>
              <div className="info-row"><div className="info-label">Account Number</div><div className="info-val" style={{display:"flex",gap:6,alignItems:"center"}}>{a.acct} <span className="copy-btn">⧉</span></div></div>
              <div className="info-row"><div className="info-label">Account Type</div><div className="info-val">Checking</div></div>
              <div className="info-row"><div className="info-label">Beneficiary</div><div className="info-val">Nguyen Trading Co. LLC</div></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-primary btn-sm" onClick={()=>openModal("deposit")}>⬇ Receive</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>openModal("wire")}>⬆ Send Wire</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>openModal("ach")}>⬆ ACH Transfer</button>
              <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto"}} onClick={()=>openModal("swap")}>↔ Convert to USDB</button>
            </div>
          </div>
        </div>
      ))}

      <div className="card">
        <div style={{padding:"20px 22px"}}>
          <div className="section-hdr"><div className="section-title">📊 Monthly Flow</div></div>
          <div className="grid-3" style={{gap:12}}>
            {[["💚 Received (Feb)","$137,800","ACH + Wire in"],["🔴 Sent (Feb)","$40,500","Wires + ACH out"],["🔄 Net (Feb)","+$97,300","Converted to USDB"]].map(([icon,val,sub])=>(
              <div key={icon} style={{background:G.surf2,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:11,color:G.muted,marginBottom:6}}>{icon}</div>
                <div style={{fontFamily:"JetBrains Mono",fontSize:18,fontWeight:600}}>{val}</div>
                <div style={{fontSize:11,color:G.dim,marginTop:3}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stablecoin({ openModal }) {
  const usdb = PORTFOLIO.stablecoins.find(s=>s.symbol==="USDB");
  const earned = useLiveYield(usdb.balance, usdb.apy);
  const monthlyYield = usdb.balance * usdb.apy / 100 / 12;

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div><div className="page-title">Stablecoin Wallets</div><div className="page-sub">Hold, earn, and move stablecoins globally</div></div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-ghost" onClick={()=>openModal("deposit_crypto")}>⬇ Deposit Crypto</button>
          <button className="btn btn-primary" onClick={()=>openModal("swap")}>↔ Swap</button>
        </div>
      </div>

      {/* YIELD HERO */}
      <div className="card" style={{marginBottom:16,padding:"24px 26px",background:"linear-gradient(135deg, #071a10, #0d1f14, #071608)",borderColor:"rgba(34,197,94,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,fontFamily:"JetBrains Mono",letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(34,197,94,0.6)",marginBottom:6}}>USDB Yield Earning</div>
            <div style={{fontFamily:"Playfair Display, serif",fontSize:40,color:G.green,letterSpacing:"-0.03em"}}>5.1% <span style={{fontSize:18,color:"rgba(34,197,94,0.6)"}}>APY</span></div>
            <div style={{fontSize:12,color:"rgba(34,197,94,0.5)",marginTop:4,fontFamily:"JetBrains Mono"}}>T-Bill backed via Bridge · No lock-up · Daily accrual</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,fontFamily:"JetBrains Mono",letterSpacing:"0.12em",textTransform:"uppercase",color:G.muted,marginBottom:6}}>Earned Today</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:28,fontWeight:600,color:G.green}} className="yield-tick">+${fmt(earned,4)}</div>
            <div style={{fontSize:11,color:G.dim,marginTop:4}}>≈ ${fmt(monthlyYield)}/month</div>
          </div>
        </div>
        <div style={{background:"rgba(34,197,94,0.08)",borderRadius:8,padding:"10px 14px",marginTop:16,display:"flex",justifyContent:"space-between"}}>
          {[["Principal","$"+fmt(usdb.balance)],["Annual Yield","$"+fmt(usdb.balance*usdb.apy/100)],["Monthly","$"+fmt(monthlyYield)],["Daily","$"+fmt(usdb.balance*usdb.apy/100/365)]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:10,color:"rgba(34,197,94,0.5)",fontFamily:"JetBrains Mono",marginBottom:3}}>{l}</div><div style={{fontFamily:"JetBrains Mono",fontSize:13,color:G.green,fontWeight:600}}>{v}</div></div>
          ))}
        </div>
      </div>

      {PORTFOLIO.stablecoins.map(s=>(
        <div key={s.id} className="card" style={{marginBottom:12}}>
          <div style={{padding:"18px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:s.color,fontFamily:"JetBrains Mono"}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"JetBrains Mono",fontSize:16,fontWeight:600}}>{s.symbol}</div>
                <div style={{fontSize:12,color:G.dim,marginTop:2}}>{s.name} · {s.chain}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"JetBrains Mono",fontSize:20,fontWeight:600}}>${fmt(s.balance)}</div>
                {s.apy>0 ? <div style={{fontSize:11,color:G.green,marginTop:3,fontFamily:"JetBrains Mono"}}>+{s.apy}% APY · earning now</div> : <div style={{fontSize:11,color:G.muted,marginTop:3}}>0% yield · <span style={{color:G.gold,cursor:"pointer"}} onClick={()=>openModal("swap")}>Convert to USDB →</span></div>}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>openModal("send_crypto")}>⬆ Send</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>openModal("deposit_crypto")}>⬇ Receive</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>openModal("swap")}>↔ Swap</button>
              {s.apy===0&&<button className="btn btn-primary btn-sm" onClick={()=>openModal("swap")}>Convert → USDB</button>}
            </div>
          </div>
        </div>
      ))}

      <div className="card" style={{padding:"18px 20px"}}>
        <div className="section-title" style={{marginBottom:14}}>❓ How USDB Yield Works</div>
        {[["1","Your USDB is deployed into short-term US Treasury Bills via Bridge's regulated infrastructure."],["2","Yield accrues every second — visible in real time on your dashboard."],["3","Bridge yields ~5.1% gross. Dola passes through the full yield with a 0.75% spread retained."],["4","No lock-up. Withdraw or spend at any time. Daily auto-compounding."]].map(([n,t])=>(
          <div key={n} style={{display:"flex",gap:12,paddingBottom:12,marginBottom:12,borderBottom:`1px solid ${G.border}`}}>
            <div style={{width:24,height:24,borderRadius:7,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",color:G.green,fontFamily:"JetBrains Mono",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{n}</div>
            <div style={{fontSize:13,color:G.dim,paddingTop:3}}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Swap({ openModal }) {
  const [from, setFrom] = useState("usd");
  const [to, setTo] = useState("usdb");
  const [amount, setAmount] = useState("10000");
  const [flipped, setFlipped] = useState(false);
  const assets = [
    {id:"usd",label:"USD (Bank)",icon:"🏦",bal:60700},{id:"usdb",label:"USDB",icon:"◈",bal:186250},{id:"usdc",label:"USDC",icon:"●",bal:28800},{id:"usdt",label:"USDT",icon:"◆",bal:9000}
  ];
  const fromAsset = assets.find(a=>a.id===from);
  const toAsset   = assets.find(a=>a.id===to);
  const numAmount = parseFloat(amount)||0;
  const fee = numAmount * 0.0005;
  const received = numAmount - fee;

  function flip() { setFlipped(v=>!v); const t=from; setFrom(to); setTo(t); }

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div><div className="page-title">Swap</div><div className="page-sub">Convert between USD and stablecoins instantly</div></div>
      </div>

      <div className="grid-2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{padding:"24px"}}>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontFamily:"JetBrains Mono",letterSpacing:"0.1em",textTransform:"uppercase",color:G.muted,marginBottom:8}}>FROM</div>
              <select className="select" value={from} onChange={e=>{setFrom(e.target.value);if(e.target.value===to)setTo(from);}} style={{marginBottom:10}}>
                {assets.filter(a=>a.id!==to).map(a=><option key={a.id} value={a.id}>{a.icon} {a.label} — ${fmt(a.bal)} available</option>)}
              </select>
              <div className="amount-inp-wrap">
                <div className="amount-inp-prefix">$</div>
                <input className="inp" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" type="number" />
              </div>
              <div style={{fontSize:11,color:G.dim,marginTop:6,fontFamily:"JetBrains Mono"}}>Balance: ${fmt(fromAsset.bal)} · <span style={{color:G.gold,cursor:"pointer"}} onClick={()=>setAmount(String(fromAsset.bal))}>Max</span></div>
            </div>

            <div className="swap-arrow"><div className="swap-arrow-btn" onClick={flip}>⇅</div></div>

            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontFamily:"JetBrains Mono",letterSpacing:"0.1em",textTransform:"uppercase",color:G.muted,marginBottom:8}}>TO</div>
              <select className="select" value={to} onChange={e=>setTo(e.target.value)} style={{marginBottom:10}}>
                {assets.filter(a=>a.id!==from).map(a=><option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
              </select>
              <div style={{background:G.surf2,border:`1px solid ${G.border}`,borderRadius:10,padding:"13px 14px",fontFamily:"JetBrains Mono",fontSize:20,fontWeight:600,color:G.gold}}>
                {received > 0 ? `$${fmt(received)}` : "0.00"}
              </div>
            </div>

            <div className="rate-box">
              <div className="rate-row"><div className="rate-label">Exchange Rate</div><div className="rate-val">1 {from.toUpperCase()} = 1.00 {to.toUpperCase()}</div></div>
              <div className="rate-row"><div className="rate-label">Transaction Fee</div><div className="rate-val" style={{color:G.gold}}>${fmt(fee)} (0.05%)</div></div>
              <div className="rate-row"><div className="rate-label">You Receive</div><div className="rate-val" style={{color:G.green}}>${fmt(received)} {to.toUpperCase()}</div></div>
              <div className="rate-row"><div className="rate-label">Settlement</div><div className="rate-val">Instant</div></div>
            </div>

            {to==="usdb" && <div className="alert"><div className="alert-icon">✦</div><div>USDB earns <strong style={{color:G.gold}}>5.1% APY</strong> automatically. Your {fmt(received)} USDB will start generating yield immediately after conversion.</div></div>}

            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}} onClick={()=>openModal("confirm_swap",{from,to,amount,received})}>
              Swap {from.toUpperCase()} → {to.toUpperCase()}
            </button>
          </div>
        </div>

        <div>
          <div className="card" style={{padding:"20px",marginBottom:14}}>
            <div className="section-title" style={{marginBottom:14}}>💡 Why Swap to USDB?</div>
            {[["📈","Earn 5.1% APY","Your dollars work for you. Vietnamese banks offer 0% on USD."],["⚡","Instant settlement","No waiting, no wire delays. Swaps settle in seconds."],["🔓","No lock-up","Spend or withdraw USDB anytime via your Visa card or bank transfer."],["🛡️","T-Bill backed","Reserves are invested in US Treasuries. Same safety as a money market fund."]].map(([icon,title,text])=>(
              <div key={title} style={{display:"flex",gap:12,marginBottom:14}}>
                <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                <div><div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{title}</div><div style={{fontSize:12,color:G.dim}}>{text}</div></div>
              </div>
            ))}
          </div>

          <div className="card" style={{padding:"20px"}}>
            <div className="section-title" style={{marginBottom:14}}>📊 Recent Swaps</div>
            {TRANSACTIONS.filter(t=>t.type==="swap").map(t=>(
              <div key={t.id} className="txn-row" style={{padding:"9px 0",borderColor:G.border}}>
                <div className="txn-icon" style={{background:"rgba(59,130,246,0.1)"}}>↔️</div>
                <div><div className="txn-desc">{t.desc}</div><div className="txn-date">{t.date}</div></div>
                <div className="txn-amt"><div style={{color:G.blue}}>${fmt(Math.abs(t.amount))}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardScreen({ openModal }) {
  const { last4, limit, spent, available } = PORTFOLIO.card;
  const pct = (spent/limit*100).toFixed(0);
  const cardTxns = TRANSACTIONS.filter(t=>t.type==="card");

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div><div className="page-title">Visa Business Card</div><div className="page-sub">Spend your stablecoin balance globally</div></div>
        <button className="btn btn-ghost" onClick={()=>openModal("freeze_card")}>🔒 Freeze Card</button>
      </div>

      <div className="grid-2" style={{alignItems:"start",marginBottom:16}}>
        <div className="visa-card">
          <div style={{position:"relative",zIndex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
              <div style={{fontFamily:"Playfair Display, serif",fontSize:20,color:G.gold}}>Dola</div>
              <div style={{fontSize:11,color:"rgba(240,165,0,0.5)",fontStyle:"italic",fontWeight:800,letterSpacing:"-0.02em"}}>VISA Business</div>
            </div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:15,letterSpacing:"0.25em",color:"rgba(226,234,244,0.6)",marginBottom:20}}>4829 •••• •••• {last4}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <div style={{fontSize:10,color:"rgba(226,234,244,0.4)",fontFamily:"JetBrains Mono",letterSpacing:"0.1em",marginBottom:3}}>CARDHOLDER</div>
                <div style={{fontSize:13,fontWeight:600,letterSpacing:"0.05em"}}>NGUYEN MINH TUAN</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,color:"rgba(226,234,244,0.4)",fontFamily:"JetBrains Mono",letterSpacing:"0.1em",marginBottom:3}}>VALID THRU</div>
                <div style={{fontSize:13,fontFamily:"JetBrains Mono"}}>09 / 28</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card stat-card" style={{marginBottom:12}}>
            <div className="stat-label">Monthly Spend</div>
            <div className="stat-val">${fmt(spent)} <span style={{fontSize:13,color:G.dim}}>/ ${fmt(limit)}</span></div>
            <div className="spend-bar" style={{marginTop:10,marginBottom:6}}>
              <div className="spend-fill" style={{width:`${pct}%`}} />
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:G.dim}}>
              <span>{pct}% used</span><span style={{color:G.green}}>${fmt(available)} available</span>
            </div>
          </div>
          <div className="grid-2" style={{gap:10}}>
            {[["Settled from","USDB Wallet"],["Network","Visa Global"],["Card Type","Virtual + Physical"],["Cashback","0.5% on all spend"]].map(([l,v])=>(
              <div key={l} className="card" style={{padding:"14px 16px"}}>
                <div style={{fontSize:10,color:G.muted,fontFamily:"JetBrains Mono",marginBottom:4}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{padding:"16px 18px 0"}}><div className="section-hdr"><div className="section-title">Recent Charges</div><div className="section-link">Export →</div></div></div>
          {cardTxns.map(t=>(
            <div key={t.id} className="txn-row">
              <div className="txn-icon">💳</div>
              <div><div className="txn-desc">{t.desc}</div><div className="txn-date">{t.date}</div></div>
              <div className="txn-amt"><div style={{color:G.red}}>-${fmt(Math.abs(t.amount))}</div><div className="txn-cur">USD</div></div>
            </div>
          ))}
        </div>

        <div className="card" style={{padding:"20px"}}>
          <div className="section-title" style={{marginBottom:16}}>📊 Spend by Category</div>
          {[["☁️ Cloud & SaaS","$604",28],["📣 Advertising","$450",21],["🚚 Logistics","$320",15],["🛒 Platform Fees","$320",15],["🏢 Office & Admin","$200",9],["🔧 Tools & Software","$284",12]].map(([cat,amt,pct])=>(
            <div key={cat} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontSize:12}}>{cat}</div>
                <div style={{fontFamily:"JetBrains Mono",fontSize:12}}>{amt}</div>
              </div>
              <div className="spend-bar">
                <div className="spend-fill" style={{width:`${pct}%`,background:`linear-gradient(90deg, ${G.blue}, #818cf8)`}} />
              </div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:12,justifyContent:"center"}} onClick={()=>openModal("request_physical")}>Request Physical Card</button>
        </div>
      </div>
    </div>
  );
}

function Transactions() {
  const [filter, setFilter] = useState("all");
  const cats = ["all","deposit","withdrawal","swap","card","yield"];
  const filtered = filter==="all" ? TRANSACTIONS : TRANSACTIONS.filter(t=>t.type.includes(filter)||t.cat===filter);

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div><div className="page-title">Transactions</div><div className="page-sub">Full activity history</div></div>
        <button className="btn btn-ghost">⬇ Export CSV</button>
      </div>
      <div className="tabs">
        {cats.map(c=><div key={c} className={`tab ${filter===c?"active":""}`} onClick={()=>setFilter(c)} style={{textTransform:"capitalize"}}>{c}</div>)}
      </div>
      <div className="card">
        {filtered.length===0 ? <div className="empty-state">No transactions found</div> :
          filtered.map(t=>(
            <div key={t.id} className="txn-row">
              <div className="txn-icon" style={{background:`${txnColor(t.type)}18`}}>{txnIcon[t.type]||"💱"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div className="txn-desc">{t.desc}</div><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></div>
                <div className="txn-date">{t.date} · {t.type.replace("_"," ")}</div>
              </div>
              <div className="txn-amt" style={{minWidth:100}}>
                <div style={{color:t.amount>0?G.green:G.text}}>{t.amount>0?"+":"-"}${fmt(Math.abs(t.amount))}</div>
                <div className="txn-cur">{t.currency}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function Suppliers({ openModal }) {
  return (
    <div className="page fade-up">
      <div className="page-header">
        <div><div className="page-title">Pay Suppliers</div><div className="page-sub">Send USD to US partners, vendors, and service providers</div></div>
        <button className="btn btn-primary" onClick={()=>openModal("new_supplier")}>+ Add Supplier</button>
      </div>
      <div className="alert"><div className="alert-icon">🇻🇳→🇺🇸</div><div>Pay your US partners directly from your USD balance. Wire transfers arrive same-day for most US banks. No intermediary conversions — your funds stay in USD the whole time.</div></div>
      <div className="card">
        {SUPPLIERS.map(s=>(
          <div key={s.id} className="account-row">
            <div className="acc-icon" style={{background:G.surf3}}>🏢</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><div className="acc-name">{s.name}</div><span className={`badge ${s.category==="Legal"?"badge-blue":s.category==="Logistics"?"badge-muted":"badge-green"}`}>{s.category}</span></div>
              <div className="acc-sub">{s.country}</div>
            </div>
            <div style={{textAlign:"right",marginRight:14}}>
              <div style={{fontFamily:"JetBrains Mono",fontSize:13}}>${fmt(s.amount)}</div>
              <div style={{fontSize:11,color:G.dim,marginTop:2}}>Last: {s.lastPaid}</div>
            </div>
            <span className={`badge ${statusBadge(s.status)}`} style={{marginRight:12}}>{s.status}</span>
            <button className="btn btn-primary btn-sm" onClick={()=>openModal("pay_supplier",s)}>Pay</button>
          </div>
        ))}
      </div>
      <div style={{marginTop:16}} className="card" style={{padding:"20px"}}>
        <div className="section-title" style={{marginBottom:14}}>⚡ Scheduled Payments</div>
        <div style={{textAlign:"center",padding:"24px",color:G.dim,fontSize:13}}>
          <div style={{fontSize:28,marginBottom:8}}>🗓️</div>
          Set up recurring payments to your US suppliers — weekly, monthly, or on custom schedules.<br/>
          <button className="btn btn-ghost btn-sm" style={{marginTop:12}}>Schedule a Payment</button>
        </div>
      </div>
    </div>
  );
}

function Receivables({ openModal }) {
  const totalPending = RECEIVABLES.filter(r=>r.status==="pending").reduce((s,r)=>s+r.amount,0);
  return (
    <div className="page fade-up">
      <div className="page-header">
        <div><div className="page-title">Receivables</div><div className="page-sub">Track incoming payments from US buyers</div></div>
        <button className="btn btn-primary" onClick={()=>openModal("share_bank")}>📋 Share Bank Details</button>
      </div>
      <div className="grid-3" style={{marginBottom:16}}>
        {[["Pending","$"+fmt(totalPending),G.blue],["Due This Week","$"+fmt(79900),G.gold],["Received Feb","$"+fmt(137000),G.green]].map(([l,v,c])=>(
          <div key={l} className="card stat-card">
            <div className="stat-label">{l}</div>
            <div className="stat-val" style={{color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div className="card">
        {RECEIVABLES.map(r=>(
          <div key={r.id} className="account-row">
            <div className="acc-icon" style={{background:"rgba(59,130,246,0.1)"}}>📄</div>
            <div style={{flex:1}}>
              <div className="acc-name">{r.from}</div>
              <div className="acc-sub">Due {r.due} · {r.type}</div>
            </div>
            <div style={{textAlign:"right",marginRight:14}}>
              <div style={{fontFamily:"JetBrains Mono",fontSize:14,fontWeight:600,color:G.blue}}>+${fmt(r.amount)}</div>
            </div>
            <span className={`badge ${r.status==="received"?"badge-green":"badge-gold"}`}>{r.status}</span>
          </div>
        ))}
      </div>
      <div className="card" style={{padding:"20px",marginTop:14}}>
        <div className="section-title" style={{marginBottom:10}}>💡 Share with US Buyers</div>
        <div style={{background:G.surf2,borderRadius:10,padding:"14px 16px"}}>
          <div className="info-row"><div className="info-label">Beneficiary Name</div><div className="info-val">Nguyen Trading Co. LLC</div></div>
          <div className="info-row"><div className="info-label">Bank Name</div><div className="info-val">Cross River Bank</div></div>
          <div className="info-row"><div className="info-label">Routing Number</div><div className="info-val" style={{display:"flex",gap:6}}>026015422 <span className="copy-btn">⧉ Copy</span></div></div>
          <div className="info-row"><div className="info-label">Account Number</div><div className="info-val" style={{display:"flex",gap:6}}>****7741 <span className="copy-btn">⧉ Copy</span></div></div>
          <div className="info-row"><div className="info-label">Account Type</div><div className="info-val">Business Checking</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── MODALS ─────────────────────────────────────────────────
function Modal({ modal, closeModal }) {
  if (!modal) return null;

  const content = {
    deposit: {
      title: "Receive Funds",
      body: (
        <div>
          <div className="alert"><div className="alert-icon">📋</div><div>Share these details with your US client or partner to receive ACH or wire transfer.</div></div>
          <div style={{background:G.surf2,borderRadius:10,padding:"16px"}}>
            {[["Routing Number","026015422"],["Account Number","****7741"],["Account Name","Nguyen Trading Co. LLC"],["Bank","Cross River Bank, NJ"],["ACH Timeline","1-2 business days"],["Wire Timeline","Same day"]].map(([l,v])=>(
              <div key={l} className="info-row"><div className="info-label">{l}</div><div className="info-val">{v}</div></div>
            ))}
          </div>
          <div style={{marginTop:16,display:"flex",gap:10}}>
            <button className="btn btn-primary" style={{flex:1,justifyContent:"center"}}>⧉ Copy All Details</button>
            <button className="btn btn-ghost" style={{flex:1,justifyContent:"center"}}>📧 Email to Client</button>
          </div>
        </div>
      )
    },
    wire: {
      title: "Send Wire Transfer",
      body: (
        <div>
          <div className="inp-group"><div className="inp-label">Beneficiary Name</div><input className="inp" defaultValue="Lee & Associates LLC" /></div>
          <div className="inp-row">
            <div className="inp-group"><div className="inp-label">Routing Number</div><input className="inp" placeholder="9-digit ABA" /></div>
            <div className="inp-group"><div className="inp-label">Account Number</div><input className="inp" placeholder="Account #" /></div>
          </div>
          <div className="inp-group"><div className="inp-label">Amount (USD)</div><div className="amount-inp-wrap"><div className="amount-inp-prefix">$</div><input className="inp" defaultValue="22000" type="number" /></div></div>
          <div className="inp-group"><div className="inp-label">Memo / Purpose</div><input className="inp" defaultValue="Invoice #INV-2026-041" /></div>
          <div className="rate-box">
            <div className="rate-row"><div className="rate-label">Wire Fee</div><div className="rate-val">$25.00</div></div>
            <div className="rate-row"><div className="rate-label">Settlement</div><div className="rate-val">Same business day (if before 3pm ET)</div></div>
            <div className="rate-row"><div className="rate-label">Source</div><div className="rate-val">USD Checking ****7741</div></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>Send Wire $22,000.00</button>
        </div>
      )
    },
    swap: {
      title: "Quick Swap",
      body: (
        <div>
          <div className="inp-group"><div className="inp-label">From</div><select className="select"><option>USD Bank Account — $60,700 available</option><option>USDC — $28,800</option><option>USDT — $9,000</option></select></div>
          <div className="swap-arrow"><div className="swap-arrow-btn">⇅</div></div>
          <div className="inp-group" style={{marginTop:8}}><div className="inp-label">To</div><select className="select"><option>USDB (earns 5.1% APY) — Recommended</option><option>USDC</option><option>USD Bank Account</option></select></div>
          <div className="inp-group"><div className="inp-label">Amount</div><div className="amount-inp-wrap"><div className="amount-inp-prefix">$</div><input className="inp" defaultValue="10000" type="number" /></div></div>
          <div className="rate-box">
            <div className="rate-row"><div className="rate-label">You receive</div><div className="rate-val" style={{color:G.green}}>$9,995.00 USDB</div></div>
            <div className="rate-row"><div className="rate-label">Fee</div><div className="rate-val">$5.00 (0.05%)</div></div>
            <div className="rate-row"><div className="rate-label">New USDB yield (monthly)</div><div className="rate-val" style={{color:G.gold}}>+$42.47/month</div></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>Swap Now → USDB</button>
        </div>
      )
    },
    pay_supplier: {
      title: `Pay ${modal.data?.name || "Supplier"}`,
      body: (
        <div>
          <div className="inp-group"><div className="inp-label">Amount (USD)</div><div className="amount-inp-wrap"><div className="amount-inp-prefix">$</div><input className="inp" defaultValue={modal.data?.amount || "0"} type="number" /></div></div>
          <div className="inp-group"><div className="inp-label">Payment Method</div><select className="select"><option>ACH Transfer (2-3 days, free)</option><option>Wire Transfer (same day, $25 fee)</option></select></div>
          <div className="inp-group"><div className="inp-label">Source Account</div><select className="select"><option>USD Checking ****7741 — $48,200</option><option>USDB Wallet (auto-convert) — $186,250</option></select></div>
          <div className="inp-group"><div className="inp-label">Reference / Invoice #</div><input className="inp" placeholder="INV-2026-..." /></div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>Confirm Payment</button>
        </div>
      )
    },
    share_bank: {
      title: "Share Bank Details",
      body: (
        <div>
          <div style={{background:G.surf2,borderRadius:10,padding:"16px",marginBottom:16}}>
            {[["Beneficiary","Nguyen Trading Co. LLC"],["Bank","Cross River Bank"],["Routing","026015422"],["Account","****7741"],["Type","Business Checking"]].map(([l,v])=>(
              <div key={l} className="info-row"><div className="info-label">{l}</div><div className="info-val">{v}</div></div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="btn btn-primary btn-sm">⧉ Copy</button>
            <button className="btn btn-ghost btn-sm">📧 Email</button>
            <button className="btn btn-ghost btn-sm">📎 PDF</button>
            <button className="btn btn-ghost btn-sm">📱 WhatsApp</button>
          </div>
        </div>
      )
    },
    confirm_swap: {
      title: "Confirm Swap",
      body: (
        <div>
          <div style={{textAlign:"center",padding:"24px 0 16px"}}>
            <div style={{fontSize:36,marginBottom:8}}>↔️</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:28,fontWeight:600,marginBottom:4}}>${fmt(modal.data?.amount||0)}</div>
            <div style={{fontSize:13,color:G.dim}}>{(modal.data?.from||"").toUpperCase()} → {(modal.data?.to||"").toUpperCase()}</div>
          </div>
          <div className="rate-box">
            <div className="rate-row"><div className="rate-label">You receive</div><div className="rate-val" style={{color:G.green}}>${fmt(modal.data?.received||0)} {(modal.data?.to||"").toUpperCase()}</div></div>
            <div className="rate-row"><div className="rate-label">Rate</div><div className="rate-val">1:1</div></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>✓ Confirm Swap</button>
        </div>
      )
    },
    freeze_card: {
      title: "Freeze Card",
      body: (
        <div style={{textAlign:"center",padding:"16px 0"}}>
          <div style={{fontSize:48,marginBottom:12}}>🔒</div>
          <div style={{fontSize:14,color:G.dim,marginBottom:20}}>Freezing your card will instantly block all new transactions. Existing charges will still settle. You can unfreeze at any time.</div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px",background:G.red}}>Freeze Card ****4829</button>
          <button className="btn btn-ghost" style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:10}} onClick={closeModal}>Cancel</button>
        </div>
      )
    },
    request_physical: {
      title: "Request Physical Card",
      body: (
        <div>
          <div className="alert"><div className="alert-icon">🚚</div><div>Physical card ships to a US address or Vietnam via international courier (DHL). Estimated delivery: 5-10 business days.</div></div>
          <div className="inp-group"><div className="inp-label">Shipping Address</div><input className="inp" placeholder="Street address" /></div>
          <div className="inp-row">
            <div className="inp-group"><div className="inp-label">City</div><input className="inp" placeholder="Ho Chi Minh City" /></div>
            <div className="inp-group"><div className="inp-label">Country</div><select className="select"><option>Vietnam</option><option>USA</option></select></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>Request Card — Free</button>
        </div>
      )
    },
    new_supplier: {
      title: "Add Supplier",
      body: (
        <div>
          <div className="inp-group"><div className="inp-label">Company / Name</div><input className="inp" placeholder="Lee & Associates LLC" /></div>
          <div className="inp-group"><div className="inp-label">Category</div><select className="select"><option>Supplier</option><option>Legal</option><option>Logistics</option><option>Warehouse</option><option>Service</option></select></div>
          <div className="inp-row">
            <div className="inp-group"><div className="inp-label">Routing Number</div><input className="inp" placeholder="9-digit ABA" /></div>
            <div className="inp-group"><div className="inp-label">Account Number</div><input className="inp" placeholder="Account #" /></div>
          </div>
          <div className="inp-group"><div className="inp-label">Account Owner Name</div><input className="inp" placeholder="Full legal name" /></div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>Save Supplier</button>
        </div>
      )
    },
    deposit_crypto: {
      title: "Receive Crypto",
      body: (
        <div>
          <div className="inp-group"><div className="inp-label">Asset</div><select className="select"><option>USDT (Tron TRC-20)</option><option>USDC (Base)</option><option>USDT (Ethereum)</option></select></div>
          <div style={{background:G.surf2,borderRadius:10,padding:"16px",textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:10,fontFamily:"JetBrains Mono",color:G.muted,marginBottom:10,letterSpacing:"0.1em"}}>DEPOSIT ADDRESS</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:12,color:G.gold,wordBreak:"break-all"}}>TKbJ8wL4aXQzN8vP3mFxH2rRsYuCdE7gW</div>
            <div style={{fontSize:11,color:G.dim,marginTop:10}}>Only send USDT (TRC-20) to this address</div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}}>⧉ Copy Address</button>
        </div>
      )
    },
    send_crypto: {
      title: "Send Crypto",
      body: (
        <div>
          <div className="inp-group"><div className="inp-label">Asset</div><select className="select"><option>USDB — $186,250</option><option>USDC — $28,800</option><option>USDT — $9,000</option></select></div>
          <div className="inp-group"><div className="inp-label">Recipient Address</div><input className="inp" placeholder="0x... or TK..." /></div>
          <div className="inp-group"><div className="inp-label">Network</div><select className="select"><option>Base (recommended, low fees)</option><option>Ethereum</option><option>Tron (USDT)</option></select></div>
          <div className="inp-group"><div className="inp-label">Amount</div><div className="amount-inp-wrap"><div className="amount-inp-prefix">$</div><input className="inp" placeholder="0.00" type="number" /></div></div>
          <div className="rate-box">
            <div className="rate-row"><div className="rate-label">Network Fee</div><div className="rate-val">~$0.01 (Base)</div></div>
            <div className="rate-row"><div className="rate-label">Estimated arrival</div><div className="rate-val">~10 seconds</div></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>Send Crypto</button>
        </div>
      )
    },
    ach: {
      title: "ACH Transfer",
      body: (
        <div>
          <div className="inp-group"><div className="inp-label">Recipient Account</div><select className="select"><option>Select saved account...</option><option>Lee & Associates — ****8821</option><option>Pacific Freight — ****4411</option></select></div>
          <div className="inp-group"><div className="inp-label">Amount (USD)</div><div className="amount-inp-wrap"><div className="amount-inp-prefix">$</div><input className="inp" placeholder="0.00" type="number" /></div></div>
          <div className="inp-group"><div className="inp-label">Memo</div><input className="inp" placeholder="Invoice reference" /></div>
          <div className="rate-box">
            <div className="rate-row"><div className="rate-label">ACH Fee</div><div className="rate-val">Free</div></div>
            <div className="rate-row"><div className="rate-label">Settlement</div><div className="rate-val">2-3 business days</div></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}}>Send ACH</button>
        </div>
      )
    },
  };

  const m = content[modal.type];
  if (!m) return null;

  return (
    <div className="overlay" onClick={closeModal}>
      <div className="modal fade-up" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{m.title}</div>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-body">{m.body}</div>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ──────────────────────────────────────────────
const NAV = [
  { id:"dashboard",   icon:"◉", label:"Dashboard" },
  { id:"accounts",    icon:"🏦", label:"Bank Accounts" },
  { id:"stablecoin",  icon:"◈", label:"Stablecoins" },
  { id:"swap",        icon:"↔", label:"Swap" },
  { id:"card",        icon:"▣", label:"Visa Card" },
  { id:"transactions",icon:"≡", label:"Transactions" },
  { id:"suppliers",   icon:"⬆", label:"Pay Suppliers" },
  { id:"receivables", icon:"⬇", label:"Receivables", badge:3 },
];

// ─── APP ROOT ────────────────────────────────────────────────
export default function DolaApp() {
  const [screen, setScreen] = useState("dashboard");
  const [modal, setModal] = useState(null);

  const openModal = (type, data={}) => setModal({ type, data });
  const closeModal = () => setModal(null);

  const screens = { dashboard:<Dashboard setScreen={setScreen}/>, accounts:<Accounts openModal={openModal}/>, stablecoin:<Stablecoin openModal={openModal}/>, swap:<Swap openModal={openModal}/>, card:<CardScreen openModal={openModal}/>, transactions:<Transactions/>, suppliers:<Suppliers openModal={openModal}/>, receivables:<Receivables openModal={openModal}/> };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <span>Dola</span>
            <div>
              <div style={{fontSize:9,color:G.muted,fontFamily:"Plus Jakarta Sans",fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase"}}>Treasury</div>
            </div>
          </div>

          <div className="nav-section">Overview</div>
          {NAV.slice(0,1).map(n=>(
            <div key={n.id} className={`nav-item ${screen===n.id?"active":""}`} onClick={()=>setScreen(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}

          <div className="nav-section" style={{marginTop:8}}>Money</div>
          {NAV.slice(1,5).map(n=>(
            <div key={n.id} className={`nav-item ${screen===n.id?"active":""}`} onClick={()=>setScreen(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}

          <div className="nav-section" style={{marginTop:8}}>Business</div>
          {NAV.slice(5).map(n=>(
            <div key={n.id} className={`nav-item ${screen===n.id?"active":""}`} onClick={()=>setScreen(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
              {n.badge&&<span className="nav-badge">{n.badge}</span>}
            </div>
          ))}

          <div className="sidebar-footer">
            <div className="user-row">
              <div className="avatar">MT</div>
              <div><div className="user-name">Minh Tuan Nguyen</div><div className="user-role">Nguyen Trading Co.</div></div>
            </div>
          </div>
        </aside>

        <main className="main">
          {screens[screen]}
        </main>

        <Modal modal={modal} closeModal={closeModal} />
      </div>
    </>
  );
}
