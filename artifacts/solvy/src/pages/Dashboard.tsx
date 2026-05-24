import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useDossiers } from "@/hooks/useApi";
import { mockDossiers, DossierStatus } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart
} from "recharts";
import {
  Search, Eye, TrendingUp, FileText, AlertCircle, CheckCircle, Clock,
  Users, ShieldAlert, ArrowUpRight, ArrowDownRight, BarChart3, Plus
} from "lucide-react";

interface DashboardProps { role: string; userName: string; userInitials: string; userEmail?: string; onLogout: () => void; }

const monthlyData = [
  { mois: "Sep", dossiers: 12, decisions: 9, accords: 7 },
  { mois: "Oct", dossiers: 18, decisions: 14, accords: 10 },
  { mois: "Nov", dossiers: 15, decisions: 12, accords: 9 },
  { mois: "Déc", dossiers: 8, decisions: 6, accords: 4 },
  { mois: "Jan", dossiers: 23, decisions: 18, accords: 14 },
];

const statusConfig: Record<DossierStatus, { label: string; color: string; bg: string; dot: string }> = {
  incomplet: { label: "Incomplet", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-400" },
  en_analyse: { label: "En analyse", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  score_calcule: { label: "Score calculé", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  decision_rendue: { label: "Décision rendue", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  archive: { label: "Archivé", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
};

const decisionConfig = {
  accord: { label: "Accord", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  refus: { label: "Refus", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  accord_conditions: { label: "Sous conditions", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";
const light = "hsl(220 12% 58%)";

function ConseillerDashboard({ role, userName, userInitials, userEmail, onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: dossiers = mockDossiers } = useDossiers(userEmail ? { conseiller: userEmail } : undefined);

  const filtered = dossiers.filter(d => {
    const t = `${d.reference} ${d.client?.nom} ${d.client?.prenom}`.toLowerCase();
    return t.includes(search.toLowerCase()) && (statusFilter === "all" || d.status === statusFilter);
  });

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const kpis = [
    { label: "Dossiers actifs", value: String(dossiers.filter(d => d.status !== "archive" && d.status !== "decision_rendue").length), sub: "En cours de traitement", icon: FileText, trend: "up", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Documents manquants", value: String(dossiers.filter(d => d.status === "incomplet").length > 0 ? dossiers.filter(d => d.status === "incomplet").reduce((acc, d) => acc + (d.documents || []).filter((doc: any) => doc.statut === "manquant").length, 0) : 0), sub: `${dossiers.filter(d => d.status === "incomplet").length} dossier(s) incomplet(s)`, icon: AlertCircle, trend: "warn", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "En attente d'analyse", value: String(dossiers.filter(d => d.status === "score_calcule" || d.status === "en_analyse").length), sub: "Transmis au service risque", icon: Clock, trend: "neutral", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Décisions reçues", value: String(dossiers.filter(d => d.status === "decision_rendue").length), sub: "Ce mois-ci", icon: CheckCircle, trend: "up", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title={`Bonjour, ${userName.split(" ")[0]}`} subtitle="Tableau de bord · Conseiller bancaire">
        <button onClick={() => setLocation("/nouveau-dossier")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "hsl(43 60% 46%)" }}>
          <Plus className="w-4 h-4" /> Nouveau dossier
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(({ label, value, sub: s, icon: Icon, trend, color, bg, border }) => (
            <div key={label} className={`bg-white rounded-xl border shadow-sm p-5 ${border}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {trend === "up" && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                {trend === "warn" && <ArrowDownRight className="w-4 h-4 text-orange-400" />}
              </div>
              <div className="text-2xl font-bold" style={{ color: txt }}>{value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: sub }}>{label}</div>
              <div className="text-[11px] mt-1" style={{ color: light }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold" style={{ color: txt }}>Dossiers récents</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                    className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-amber-400 w-44" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none">
                  <option value="all">Tous statuts</option>
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                  {["Référence", "Client", "Montant", "Score", "Statut", ""].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider px-4 py-2.5 font-semibold" style={{ color: sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 8).map((d, i) => {
                  const sc = statusConfig[d.status as DossierStatus] || statusConfig.incomplet;
                  return (
                    <tr key={d.id} className={`border-b border-gray-50 hover:bg-amber-50/40 cursor-pointer transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}
                      onClick={() => setLocation(`/dossier/${d.id}`)}>
                      <td className="px-4 py-3"><span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</span></td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium" style={{ color: txt }}>{d.client?.nom} {d.client?.prenom}</div>
                        <div className="text-[10px]" style={{ color: sub }}>{d.conseiller}</div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm font-semibold" style={{ color: txt }}>{fmt(d.demande?.montant || 0)}</span></td>
                      <td className="px-4 py-3">
                        {d.score ? (
                          <span className={`text-sm font-bold ${d.score >= 700 ? "text-emerald-600" : d.score >= 400 ? "text-amber-600" : "text-red-600"}`}>{d.score}</span>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border w-fit ${sc.bg} ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: txt }}>Activité mensuelle</h2>
            <ResponsiveContainer width="100%" height={155}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43 57% 54%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(43 57% 54%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 93%)" />
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: sub }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: sub }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(220 15% 88%)", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="dossiers" stroke="hsl(43 57% 46%)" fill="url(#goldGrad)" strokeWidth={2} name="Dossiers" />
                <Line type="monotone" dataKey="accords" stroke="hsl(145 60% 40%)" strokeWidth={2} dot={false} name="Accords" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span style={{ color: sub }}>Taux d'accord (Jan)</span>
                <span className="font-semibold text-emerald-600">61%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: sub }}>Score moyen</span>
                <span className="font-semibold" style={{ color: "hsl(43 57% 40%)" }}>
                  {dossiers.filter(d => d.score).length > 0
                    ? Math.round(dossiers.filter(d => d.score).reduce((a, d) => a + (d.score || 0), 0) / dossiers.filter(d => d.score).length)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AnalysteDashboard({ role, userName, userInitials, onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();
  const { data: dossiers = mockDossiers } = useDossiers();
  const aAnalyser = dossiers.filter(d => (d.status === "score_calcule" || d.status === "en_analyse") && (d as any).transmisAt);
  const decisions = dossiers.filter(d => d.decision !== null);
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const kpis = [
    { label: "Dossiers à analyser", value: String(aAnalyser.length), sub: "Nécessitent une décision", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Score moyen", value: dossiers.filter(d => d.score).length > 0 ? String(Math.round(dossiers.filter(d => d.score).reduce((a, d) => a + (d.score || 0), 0) / dossiers.filter(d => d.score).length)) : "—", sub: "Portefeuille actif", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Décisions ce mois", value: String(decisions.length), sub: `Accord: ${decisions.filter(d => d.decision === "accord").length} · Refus: ${decisions.filter(d => d.decision === "refus").length}`, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Alertes conformité", value: String(dossiers.filter(d => d.ppe || d.ficp || d.fcc).length), sub: `${dossiers.filter(d => d.ppe).length} PPE · ${dossiers.filter(d => d.ficp).length} FICP`, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
  ];

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Tableau de bord risque" subtitle="Analyste risque · Décisions et conformité">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
          <ShieldAlert className="w-3.5 h-3.5" />
          {aAnalyser.length} dossier(s) en attente de décision
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(({ label, value, sub: s, icon: Icon, color, bg, border }) => (
            <div key={label} className={`bg-white rounded-xl border shadow-sm p-5 ${border}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div className="text-2xl font-bold" style={{ color: txt }}>{value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: sub }}>{label}</div>
              <div className="text-[11px] mt-1" style={{ color: light }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: txt }}>Dossiers à traiter en priorité</h2>
              <button onClick={() => setLocation("/analyste")} className="text-xs font-medium text-amber-600 hover:text-amber-700">Voir tout →</button>
            </div>
            <div className="divide-y divide-gray-50">
              {aAnalyser.length === 0 && <div className="px-5 py-6 text-center text-xs" style={{ color: sub }}>Aucun dossier en attente</div>}
              {aAnalyser.map(d => {
                const sc = d.score || 0;
                const alerts = [...(d.ppe ? ["PPE"] : []), ...(d.ficp ? ["FICP"] : []), ...(d.tauxEndettement > 35 ? [">35%"] : [])];
                return (
                  <div key={d.id} onClick={() => setLocation("/analyste")}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-amber-50/30 cursor-pointer transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</span>
                        {alerts.map(a => <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-600 font-medium">{a}</span>)}
                      </div>
                      <div className="text-sm font-medium mt-0.5" style={{ color: txt }}>{d.client?.prenom} {d.client?.nom}</div>
                      <div className="text-xs mt-0.5" style={{ color: sub }}>{fmt(d.demande?.montant || 0)} · {d.situationPro?.statut}</div>
                    </div>
                    <div className={`text-lg font-bold ${sc >= 700 ? "text-emerald-600" : sc >= 400 ? "text-amber-600" : "text-red-600"}`}>
                      {sc}<span className="text-xs font-normal text-gray-400">/1000</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold" style={{ color: txt }}>Décisions récentes</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {decisions.length === 0 && <div className="px-5 py-6 text-center text-xs" style={{ color: sub }}>Aucune décision</div>}
              {decisions.map(d => {
                const dc = (decisionConfig as any)[d.decision!] || decisionConfig.accord;
                return (
                  <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</span>
                      <div className="text-sm font-medium mt-0.5" style={{ color: txt }}>{d.client?.prenom} {d.client?.nom}</div>
                      <div className="text-xs mt-0.5" style={{ color: sub }}>{fmt(d.demande?.montant || 0)}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${dc.bg} ${dc.color}`}>{dc.label}</span>
                      <div className="text-[10px] mt-1.5" style={{ color: light }}>Score {d.score}/1000</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: txt }}>Distribution des scores (portefeuille)</h2>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={[
              { range: "0–200", count: dossiers.filter(d => d.score && d.score <= 200).length },
              { range: "200–400", count: dossiers.filter(d => d.score && d.score > 200 && d.score <= 400).length },
              { range: "400–600", count: dossiers.filter(d => d.score && d.score > 400 && d.score <= 600).length },
              { range: "600–800", count: dossiers.filter(d => d.score && d.score > 600 && d.score <= 800).length },
              { range: "800–1000", count: dossiers.filter(d => d.score && d.score > 800).length },
            ]} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 93%)" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: sub }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: sub }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(220 15% 88%)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" name="Dossiers" fill="hsl(43 57% 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}

function AdminDashboard({ role, userName, userInitials, onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();
  const { data: dossiers = mockDossiers } = useDossiers();

  const kpis = [
    { label: "Utilisateurs actifs", value: "4", sub: "/ 5 comptes", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Dossiers total", value: String(dossiers.length), sub: "En base de données", icon: FileText, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Taux d'accord", value: dossiers.filter(d => d.decision).length > 0 ? `${Math.round((dossiers.filter(d => d.decision === "accord").length / dossiers.filter(d => d.decision).length) * 100)}%` : "—", sub: "Décisions rendues", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Alertes système", value: "1", sub: "Timeout FICP (résolu)", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  ];

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Tableau de bord administrateur" subtitle="Supervision · Gouvernance SI · SOLVY v2.3.1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 border border-purple-200 text-purple-700">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          Système opérationnel
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(({ label, value, sub: s, icon: Icon, color, bg, border }) => (
            <div key={label} className={`bg-white rounded-xl border shadow-sm p-5 ${border}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div className="text-2xl font-bold" style={{ color: txt }}>{value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: sub }}>{label}</div>
              <div className="text-[11px] mt-1" style={{ color: light }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: txt }}>Actions d'administration</h2>
            <div className="space-y-2">
              {[
                { label: "Gérer les utilisateurs", href: "/admin", icon: Users, desc: "Ajouter, désactiver, modifier les rôles" },
                { label: "Paramètres scoring", href: "/admin", icon: ShieldAlert, desc: "Modifier les seuils et pondérations" },
                { label: "Audit global", href: "/audit", icon: FileText, desc: "Consulter le journal d'audit complet" },
                { label: "Logs système", href: "/admin", icon: BarChart3, desc: "Monitoring temps réel" },
              ].map(({ label, href, icon: Icon, desc }) => (
                <button key={label} onClick={() => setLocation(href)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all text-left">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: txt }}>{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: sub }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: txt }}>Santé du système</h2>
            <div className="space-y-3">
              {[
                "Moteur de scoring v2.3.1", "Connecteur FICP", "Connecteur LCB-FT",
                "Service de sauvegarde", "Chiffrement AES-256", "Authentification MFA",
              ].map(service => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "hsl(220 25% 20%)" }}>{service}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    opérationnel
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={monthlyData}>
                  <Line type="monotone" dataKey="dossiers" stroke="hsl(43 57% 46%)" strokeWidth={2} dot={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 9, fill: sub }} axisLine={false} tickLine={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-[10px] text-center mt-1" style={{ color: sub }}>Volume de dossiers (5 mois)</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function Dashboard(props: DashboardProps) {
  if (props.role === "analyste") return <AnalysteDashboard {...props} />;
  if (props.role === "admin") return <AdminDashboard {...props} />;
  return <ConseillerDashboard {...props} />;
}
