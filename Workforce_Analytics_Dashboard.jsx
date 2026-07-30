import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell, FunnelChart, Funnel, LabelList,
} from "recharts";
import { Users, TrendingDown, Target, Briefcase, AlertTriangle, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------
// DATA (pulled from SQL query results / Python model — see project files)
// ---------------------------------------------------------------
const headcount = [
  { dept: "Engineering", target: 820, current: 744, gap: 76 },
  { dept: "Sales", target: 400, current: 329, gap: 71 },
  { dept: "Operations", target: 400, current: 342, gap: 58 },
  { dept: "Data & Analytics", target: 300, current: 260, gap: 40 },
  { dept: "Finance", target: 220, current: 206, gap: 14 },
  { dept: "Marketing", target: 195, current: 186, gap: 9 },
  { dept: "Human Capital", target: 115, current: 108, gap: 7 },
];

const attritionByDept = [
  { dept: "Human Capital", pct: 13.6 },
  { dept: "Operations", pct: 10.2 },
  { dept: "Sales", pct: 9.6 },
  { dept: "Finance", pct: 9.3 },
  { dept: "Engineering", pct: 9.3 },
  { dept: "Marketing", pct: 8.8 },
  { dept: "Data & Analytics", pct: 6.8 },
];

const attritionByTenure = [
  { band: "0-1 yr", pct: 11.1 },
  { band: "1-2 yrs", pct: 10.4 },
  { band: "2-4 yrs", pct: 11.4 },
  { band: "4+ yrs", pct: 5.7 },
];

const attritionByMgrChanges = [
  { changes: "0", pct: 6.9, n: 1344 },
  { changes: "1", pct: 10.8, n: 757 },
  { changes: "2", pct: 15.7, n: 235 },
  { changes: "3", pct: 24.5, n: 49 },
  { changes: "4+", pct: 3.5, n: 15 },
];

const quarterlyHiring = [
  { quarter: "25-Q1", applied: 1874, hired: 117, conv: 6.24 },
  { quarter: "25-Q2", applied: 1634, hired: 127, conv: 7.77 },
  { quarter: "25-Q3", applied: 2332, hired: 137, conv: 5.87 },
  { quarter: "25-Q4", applied: 2509, hired: 176, conv: 7.01 },
  { quarter: "26-Q1", applied: 2079, hired: 146, conv: 7.02 },
  { quarter: "26-Q2", applied: 2565, hired: 197, conv: 7.68 },
];

const funnelLatest = [
  { name: "Applied", value: 2565 },
  { name: "Screened", value: 1224 },
  { name: "Interviewed", value: 643 },
  { name: "Offered", value: 250 },
  { name: "Hired", value: 197 },
];

const atRisk = [
  { id: "E11092", dept: "Finance", level: "Senior Manager", risk: 87.2, tenure: 2.3, engagement: 2.05, mgrChanges: 4 },
  { id: "E11216", dept: "Engineering", level: "Senior Associate", risk: 86.8, tenure: 0.5, engagement: 3.1, mgrChanges: 3 },
  { id: "E10834", dept: "Sales", level: "Associate", risk: 86.2, tenure: 0.7, engagement: 3.7, mgrChanges: 4 },
  { id: "E11089", dept: "Engineering", level: "Associate", risk: 85.0, tenure: 2.0, engagement: 3.16, mgrChanges: 4 },
  { id: "E10736", dept: "Sales", level: "Manager", risk: 84.3, tenure: 0.5, engagement: 2.7, mgrChanges: 3 },
  { id: "E11832", dept: "Finance", level: "Associate", risk: 84.1, tenure: 3.7, engagement: 3.75, mgrChanges: 5 },
  { id: "E11043", dept: "Finance", level: "VP", risk: 83.6, tenure: 0.1, engagement: 1.86, mgrChanges: 2 },
  { id: "E12186", dept: "Marketing", level: "Associate", risk: 82.3, tenure: 1.9, engagement: 4.2, mgrChanges: 4 },
];

const featureImportance = [
  { feature: "Manager changes", weight: 0.378, direction: "up" },
  { feature: "Tenure", weight: -0.376, direction: "down" },
  { feature: "Engagement score", weight: -0.155, direction: "down" },
  { feature: "Performance rating", weight: -0.145, direction: "down" },
  { feature: "Salary", weight: 0.071, direction: "up" },
];

// ---------------------------------------------------------------
// THEME
// ---------------------------------------------------------------
const INK = "#0B1220";
const PANEL = "#111A2C";
const PANEL_BORDER = "#1F2C44";
const TEAL = "#2DD4BF";
const AMBER = "#F5A524";
const RED = "#F0506E";
const TEXT_MUTE = "#8896AC";
const TEXT_MAIN = "#E7ECF5";

function riskColor(risk) {
  if (risk >= 85) return RED;
  if (risk >= 75) return AMBER;
  return TEAL;
}

function Panel({ title, subtitle, children, className = "", right = null }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: PANEL, borderColor: PANEL_BORDER }}
    >
      <div className="flex items-start justify-between px-5 pt-4 pb-2">
        <div>
          <h3 className="text-[13px] font-semibold tracking-wide" style={{ color: TEXT_MAIN, fontFamily: "'Space Grotesk', sans-serif" }}>
            {title}
          </h3>
          {subtitle && <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ background: PANEL, borderColor: PANEL_BORDER }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: TEXT_MUTE, fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
        <Icon size={16} style={{ color: accent }} />
      </div>
      <div className="text-[26px] font-semibold" style={{ color: TEXT_MAIN, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
      {sub && <div className="text-[11px]" style={{ color: TEXT_MUTE }}>{sub}</div>}
    </div>
  );
}

const TooltipStyle = {
  contentStyle: { background: "#0B1220", border: `1px solid ${PANEL_BORDER}`, borderRadius: 8, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  labelStyle: { color: TEXT_MUTE },
  itemStyle: { color: TEXT_MAIN },
};

export default function WorkforceDashboard() {
  const [tab, setTab] = useState("overview");

  const totalCurrent = headcount.reduce((s, d) => s + d.current, 0);
  const totalTarget = headcount.reduce((s, d) => s + d.target, 0);
  const totalGap = totalTarget - totalCurrent;
  const avgAttrition = (attritionByDept.reduce((s, d) => s + d.pct, 0) / attritionByDept.length).toFixed(1);
  const latestConv = quarterlyHiring[quarterlyHiring.length - 1].conv;

  const tabs = [
    { id: "overview", label: "Headcount Overview" },
    { id: "attrition", label: "Attrition Drivers" },
    { id: "recruitment", label: "Recruitment Funnel" },
    { id: "risk", label: "At-Risk Employees" },
  ];

  return (
    <div className="min-h-screen w-full" style={{ background: INK, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      `}</style>

      {/* Header */}
      <div className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: PANEL_BORDER }}>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: TEAL }} />
            <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: TEXT_MUTE, fontFamily: "'Space Grotesk', sans-serif" }}>Human Capital · Global Analytics &amp; Reporting</span>
          </div>
          <h1 className="text-[22px] font-semibold mt-1" style={{ color: TEXT_MAIN, fontFamily: "'Space Grotesk', sans-serif" }}>
            Workforce Analytics &amp; Headcount Planning
          </h1>
        </div>
        <div className="text-right">
          <div className="text-[11px]" style={{ color: TEXT_MUTE }}>Data as of</div>
          <div className="text-[13px]" style={{ color: TEXT_MAIN, fontFamily: "'IBM Plex Mono', monospace" }}>01-Jul-2026</div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 px-8 pt-6">
        <KPI icon={Users} label="Active Headcount" value={totalCurrent.toLocaleString()} sub={`of ${totalTarget.toLocaleString()} target (2026)`} accent={TEAL} />
        <KPI icon={Target} label="Hiring Gap" value={totalGap.toLocaleString()} sub="net new hires needed" accent={AMBER} />
        <KPI icon={TrendingDown} label="Avg. Attrition Rate" value={`${avgAttrition}%`} sub="across departments, all-time" accent={RED} />
        <KPI icon={Briefcase} label="Latest Conversion Rate" value={`${latestConv}%`} sub="applied → hired, 2026-Q2" accent={TEAL} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 pt-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 text-[12px] rounded-t-lg border-b-2 transition-colors"
            style={{
              color: tab === t.id ? TEXT_MAIN : TEXT_MUTE,
              borderColor: tab === t.id ? TEAL : "transparent",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: tab === t.id ? 600 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-8 pt-4">
        {tab === "overview" && (
          <div className="grid grid-cols-3 gap-4">
            <Panel title="Headcount vs. Target by Department" subtitle="Current active headcount against 2026 plan" className="col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={headcount} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PANEL_BORDER} horizontal={false} />
                  <XAxis type="number" tick={{ fill: TEXT_MUTE, fontSize: 11 }} />
                  <YAxis type="category" dataKey="dept" tick={{ fill: TEXT_MAIN, fontSize: 11 }} width={110} />
                  <Tooltip {...TooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: TEXT_MUTE }} />
                  <Bar dataKey="target" fill={PANEL_BORDER} name="Target" radius={[0, 3, 3, 0]} barSize={12} />
                  <Bar dataKey="current" fill={TEAL} name="Current" radius={[0, 3, 3, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Priority Hiring Gaps" subtitle="Departments furthest from target">
              <div className="flex flex-col gap-3 mt-1">
                {[...headcount].sort((a, b) => b.gap - a.gap).slice(0, 5).map((d) => (
                  <div key={d.dept} className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color: TEXT_MAIN }}>{d.dept}</span>
                    <span className="text-[13px] font-semibold px-2 py-0.5 rounded" style={{ color: AMBER, fontFamily: "'IBM Plex Mono', monospace", background: "#2A2110" }}>
                      +{d.gap}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Quarterly Hiring Trend" subtitle="Applications received vs. hires made" className="col-span-3">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={quarterlyHiring}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PANEL_BORDER} />
                  <XAxis dataKey="quarter" tick={{ fill: TEXT_MUTE, fontSize: 11 }} />
                  <YAxis tick={{ fill: TEXT_MUTE, fontSize: 11 }} />
                  <Tooltip {...TooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: TEXT_MUTE }} />
                  <Line type="monotone" dataKey="applied" stroke={TEXT_MUTE} strokeWidth={2} dot={false} name="Applied" />
                  <Line type="monotone" dataKey="hired" stroke={TEAL} strokeWidth={2.5} dot={{ r: 3 }} name="Hired" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        )}

        {tab === "attrition" && (
          <div className="grid grid-cols-2 gap-4">
            <Panel title="Attrition Rate by Department" subtitle="All-time, of everyone ever hired">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={attritionByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PANEL_BORDER} />
                  <XAxis dataKey="dept" tick={{ fill: TEXT_MUTE, fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: TEXT_MUTE, fontSize: 11 }} unit="%" />
                  <Tooltip {...TooltipStyle} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {attritionByDept.map((d, i) => (
                      <Cell key={i} fill={d.pct >= 10 ? RED : d.pct >= 8.5 ? AMBER : TEAL} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Attrition Rate by Tenure Band" subtitle="Early tenure and 2-4yr band show elevated risk">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={attritionByTenure}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PANEL_BORDER} />
                  <XAxis dataKey="band" tick={{ fill: TEXT_MUTE, fontSize: 11 }} />
                  <YAxis tick={{ fill: TEXT_MUTE, fontSize: 11 }} unit="%" />
                  <Tooltip {...TooltipStyle} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {attritionByTenure.map((d, i) => (
                      <Cell key={i} fill={d.pct >= 10 ? RED : TEAL} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Attrition vs. Manager Changes (Last 2 Yrs)" subtitle="Clearest single driver in the model" className="col-span-2">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={attritionByMgrChanges}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PANEL_BORDER} />
                  <XAxis dataKey="changes" tick={{ fill: TEXT_MUTE, fontSize: 11 }} label={{ value: "# Manager Changes", position: "insideBottom", offset: -5, fill: TEXT_MUTE, fontSize: 11 }} />
                  <YAxis tick={{ fill: TEXT_MUTE, fontSize: 11 }} unit="%" />
                  <Tooltip {...TooltipStyle} formatter={(v, n, p) => [`${v}%  (n=${p.payload.n})`, "Attrition"]} />
                  <Bar dataKey="pct" fill={AMBER} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Model Feature Importance" subtitle="Logistic regression coefficients — attrition risk model" className="col-span-2">
              <div className="flex flex-col gap-2 mt-2">
                {featureImportance.map((f) => (
                  <div key={f.feature} className="flex items-center gap-3">
                    <span className="text-[12px] w-40" style={{ color: TEXT_MAIN }}>{f.feature}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: PANEL_BORDER }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.abs(f.weight) * 200}%`,
                          maxWidth: "100%",
                          background: f.direction === "up" ? RED : TEAL,
                          marginLeft: f.direction === "up" ? 0 : "auto",
                        }}
                      />
                    </div>
                    <span className="text-[11px] w-16 text-right" style={{ color: TEXT_MUTE, fontFamily: "'IBM Plex Mono', monospace" }}>{f.weight.toFixed(3)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-3" style={{ color: TEXT_MUTE }}>
                Positive (red) increases risk, negative (teal) decreases it. Manager churn and short tenure dominate the signal.
              </p>
            </Panel>
          </div>
        )}

        {tab === "recruitment" && (
          <div className="grid grid-cols-2 gap-4">
            <Panel title="Hiring Funnel — 2026 Q2" subtitle="Company-wide, applied through hired">
              <div className="flex flex-col gap-2 mt-2">
                {funnelLatest.map((f, i) => {
                  const widthPct = (f.value / funnelLatest[0].value) * 100;
                  return (
                    <div key={f.name} className="flex items-center gap-3">
                      <span className="text-[11px] w-20" style={{ color: TEXT_MUTE }}>{f.name}</span>
                      <div className="flex-1 h-6 rounded" style={{ background: PANEL_BORDER }}>
                        <div
                          className="h-6 rounded flex items-center justify-end pr-2"
                          style={{ width: `${widthPct}%`, background: TEAL, opacity: 1 - i * 0.12 }}
                        >
                          <span className="text-[11px] font-semibold" style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>{f.value}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] mt-3" style={{ color: TEXT_MUTE }}>Overall conversion: 7.68% (applied → hired)</p>
            </Panel>

            <Panel title="Conversion by Department" subtitle="2026-Q2, overall applied → hired %">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[
                  { dept: "Marketing", conv: 10.4 },
                  { dept: "Engineering", conv: 9.9 },
                  { dept: "Human Capital", conv: 8.3 },
                  { dept: "Sales", conv: 7.3 },
                  { dept: "Data & Analytics", conv: 6.6 },
                  { dept: "Operations", conv: 6.4 },
                  { dept: "Finance", conv: 6.2 },
                ]} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PANEL_BORDER} horizontal={false} />
                  <XAxis type="number" tick={{ fill: TEXT_MUTE, fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="dept" tick={{ fill: TEXT_MAIN, fontSize: 11 }} width={110} />
                  <Tooltip {...TooltipStyle} />
                  <Bar dataKey="conv" fill={TEAL} radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Quarterly Conversion Rate Trend" subtitle="Overall applied → hired %, last 6 quarters" className="col-span-2">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={quarterlyHiring}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PANEL_BORDER} />
                  <XAxis dataKey="quarter" tick={{ fill: TEXT_MUTE, fontSize: 11 }} />
                  <YAxis tick={{ fill: TEXT_MUTE, fontSize: 11 }} unit="%" />
                  <Tooltip {...TooltipStyle} />
                  <Line type="monotone" dataKey="conv" stroke={AMBER} strokeWidth={2.5} dot={{ r: 3 }} name="Conversion %" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        )}

        {tab === "risk" && (
          <Panel title="Top At-Risk Employees" subtitle="Logistic regression attrition-risk score, active employees only — for retention outreach prioritization">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PANEL_BORDER}` }}>
                    {["Employee", "Department", "Level", "Tenure (yrs)", "Engagement", "Mgr Changes", "Risk"].map((h) => (
                      <th key={h} className="text-left py-2 px-2 font-medium" style={{ color: TEXT_MUTE, fontFamily: "'Space Grotesk', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atRisk.map((e) => (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${PANEL_BORDER}` }}>
                      <td className="py-2 px-2" style={{ color: TEXT_MAIN, fontFamily: "'IBM Plex Mono', monospace" }}>{e.id}</td>
                      <td className="py-2 px-2" style={{ color: TEXT_MAIN }}>{e.dept}</td>
                      <td className="py-2 px-2" style={{ color: TEXT_MUTE }}>{e.level}</td>
                      <td className="py-2 px-2" style={{ color: TEXT_MUTE, fontFamily: "'IBM Plex Mono', monospace" }}>{e.tenure}</td>
                      <td className="py-2 px-2" style={{ color: TEXT_MUTE, fontFamily: "'IBM Plex Mono', monospace" }}>{e.engagement}</td>
                      <td className="py-2 px-2" style={{ color: TEXT_MUTE, fontFamily: "'IBM Plex Mono', monospace" }}>{e.mgrChanges}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ background: PANEL_BORDER }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${e.risk}%`, background: riskColor(e.risk) }} />
                          </div>
                          <span style={{ color: riskColor(e.risk), fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{e.risk}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-4 px-1">
              <AlertTriangle size={13} style={{ color: AMBER }} />
              <span className="text-[11px]" style={{ color: TEXT_MUTE }}>
                Model ROC-AUC: 0.63 on held-out data. Top drivers: manager changes (↑ risk), tenure (↓ risk), engagement score (↓ risk).
              </span>
            </div>
          </Panel>
        )}
      </div>

      <div className="px-8 pb-6 flex items-center gap-1 text-[11px]" style={{ color: TEXT_MUTE }}>
        <ChevronRight size={12} />
        Built with Python (pandas, scikit-learn) → SQL (SQLite) → this dashboard. See Workforce_Analytics_Report.xlsx for the Excel/formula layer.
      </div>
    </div>
  );
}
