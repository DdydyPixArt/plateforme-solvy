import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers, Dossier, DossierStatus } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FolderOpen, AlertTriangle, CheckCircle, Clock, Plus, Eye, Search, Filter } from "lucide-react";

interface DashboardProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const statusConfig: Record<DossierStatus, { label: string; color: string; bg: string }> = {
  incomplet: { label: "Incomplet", color: "text-orange-400", bg: "bg-orange-400/10 border border-orange-400/20" },
  en_analyse: { label: "En analyse", color: "text-blue-400", bg: "bg-blue-400/10 border border-blue-400/20" },
  score_calcule: { label: "Score calculé", color: "text-purple-400", bg: "bg-purple-400/10 border border-purple-400/20" },
  decision_rendue: { label: "Décision rendue", color: "text-primary", bg: "bg-primary/10 border border-primary/20" },
  archive: { label: "Archivé", color: "text-muted-foreground", bg: "bg-muted/30 border border-border" },
};

const decisionConfig = {
  accord: { label: "Accord", color: "text-green-400" },
  refus: { label: "Refus", color: "text-red-400" },
  accord_conditions: { label: "Sous conditions", color: "text-yellow-400" },
};

const chartData = [
  { mois: "Août", dossiers: 14 },
  { mois: "Sep.", dossiers: 18 },
  { mois: "Oct.", dossiers: 22 },
  { mois: "Nov.", dossiers: 19 },
  { mois: "Déc.", dossiers: 15 },
  { mois: "Jan.", dossiers: 23 },
];

export default function Dashboard({ role, userName, userInitials, onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DossierStatus | "all">("all");

  const filtered = mockDossiers.filter(d => {
    const matchSearch = `${d.client.nom} ${d.client.prenom} ${d.reference}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kpis = [
    { label: "Dossiers en cours", value: 23, icon: FolderOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Dossiers incomplets", value: 7, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Dossiers validés", value: 41, icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Actions requises", value: 5, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  ];

  const formatAmount = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Tableau de bord" subtitle={`Bonjour, ${userName.split(" ")[0]} — Mis à jour le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}>
        <button
          onClick={() => setLocation("/nouveau-dossier")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau dossier
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Table */}
          <div className="col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Derniers dossiers</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 w-40"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as DossierStatus | "all")}
                  className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Référence", "Client", "Montant", "Score", "Statut", ""].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground px-6 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => {
                    const sc = statusConfig[d.status];
                    return (
                      <tr key={d.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-muted/5"}`} onClick={() => setLocation(`/dossier/${d.id}`)}>
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-mono text-primary">{d.reference}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="text-sm font-medium text-foreground">{d.client.nom} {d.client.prenom}</div>
                          <div className="text-xs text-muted-foreground">{d.dateCreation}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-semibold text-foreground">{formatAmount(d.demande.montant)}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          {d.score ? (
                            <span className={`text-sm font-bold ${d.score >= 700 ? "text-green-400" : d.score >= 400 ? "text-yellow-400" : "text-red-400"}`}>
                              {d.score}<span className="text-muted-foreground text-xs font-normal">/1000</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          {d.decision && (
                            <span className={`ml-2 text-xs ${decisionConfig[d.decision].color}`}>· {decisionConfig[d.decision].label}</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            onClick={e => { e.stopPropagation(); setLocation(`/dossier/${d.id}`); }}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-1">Activité mensuelle</h2>
            <p className="text-xs text-muted-foreground mb-5">Dossiers créés ces 6 derniers mois</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={22}>
                <XAxis dataKey="mois" tick={{ fill: "#8b92a5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8b92a5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#12151b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, color: "#e8eaf0", fontSize: 12 }}
                  cursor={{ fill: "rgba(201,168,76,0.05)" }}
                />
                <Bar dataKey="dossiers" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? "#c9a84c" : "rgba(201,168,76,0.3)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Taux de complétion</span>
                <span className="text-green-400 font-medium">76%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Délai moyen</span>
                <span className="text-foreground font-medium">4.2 jours</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Score moyen</span>
                <span className="text-primary font-medium">668/1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
