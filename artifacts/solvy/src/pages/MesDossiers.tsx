import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useDossiers } from "@/hooks/useApi";
import { mockDossiers, DossierStatus } from "@/data/mockData";
import { Search, Plus, Eye, ArrowUpDown, Filter, FileText, Loader2 } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

const statusConfig: Record<DossierStatus, { label: string; color: string; bg: string; dot: string }> = {
  incomplet: { label: "Incomplet", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-400" },
  en_analyse: { label: "En analyse", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  score_calcule: { label: "Score calculé", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  decision_rendue: { label: "Décision rendue", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  archive: { label: "Archivé", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
};

const decisionConf = {
  accord: { label: "Accord", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  refus: { label: "Refus", color: "text-red-700 bg-red-50 border-red-200" },
  accord_conditions: { label: "Sous conditions", color: "text-amber-700 bg-amber-50 border-amber-200" },
};

type SortKey = "dateCreation" | "demande.montant" | "score";

export default function MesDossiers({ role, userName, userInitials, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("dateCreation");
  const [sortAsc, setSortAsc] = useState(false);

  const { data: dossiers = mockDossiers, isLoading } = useDossiers();

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const getType = (objet: string) => {
    const o = objet.toLowerCase();
    if (o.includes("immobilière") || o.includes("immobilier") || o.includes("résidence") || o.includes("immobilier")) return "Immobilier";
    if (o.includes("travaux") || o.includes("rénovation")) return "Travaux";
    if (o.includes("véhicule") || o.includes("voiture") || o.includes("auto")) return "Véhicule";
    return "Autre";
  };

  const types = Array.from(new Set(dossiers.map(d => getType(d.demande?.objet || ""))));

  const getCompletion = (docs: any[]) => {
    if (!docs?.length) return 0;
    const fournis = docs.filter(d => d.statut === "fourni").length;
    return Math.round((fournis / docs.length) * 100);
  };

  const filtered = dossiers
    .filter(d => {
      const t = `${d.reference} ${d.client?.nom} ${d.client?.prenom} ${d.demande?.objet}`.toLowerCase();
      const matchSearch = t.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      const matchType = typeFilter === "all" || getType(d.demande?.objet || "") === typeFilter;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "dateCreation") { va = new Date(a.dateCreation).getTime(); vb = new Date(b.dateCreation).getTime(); }
      else if (sortKey === "demande.montant") { va = a.demande?.montant ?? 0; vb = b.demande?.montant ?? 0; }
      else { va = a.score ?? -1; vb = b.score ?? -1; }
      return sortAsc ? va - vb : vb - va;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortKey === k ? "text-amber-600" : "text-gray-300"}`} />
    </button>
  );

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Mes dossiers" subtitle={`${filtered.length} dossier(s) · Conseiller: ${userName}`}>
        <button onClick={() => setLocation("/nouveau-dossier")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: "hsl(43 60% 46%)" }}>
          <Plus className="w-4 h-4" /> Nouveau dossier
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Total", value: dossiers.length, cls: "text-gray-700" },
            { label: "Incomplets", value: dossiers.filter(d => d.status === "incomplet").length, cls: "text-orange-600" },
            { label: "En analyse", value: dossiers.filter(d => d.status === "en_analyse").length, cls: "text-blue-600" },
            { label: "Score calculé", value: dossiers.filter(d => d.status === "score_calcule").length, cls: "text-purple-600" },
            { label: "Décisions", value: dossiers.filter(d => d.status === "decision_rendue").length, cls: "text-amber-600" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
              <div className={`text-2xl font-bold ${cls}`}>{isLoading ? "—" : value}</div>
              <div className="text-xs mt-0.5" style={{ color: sub }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un dossier, client..."
              className="bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-300 w-64" style={{ color: txt }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300" style={{ color: txt }}>
            <option value="all">Tous les statuts</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300" style={{ color: txt }}>
            <option value="all">Tous types de crédit</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          {(search || statusFilter !== "all" || typeFilter !== "all") && (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Réinitialiser</button>
          )}
          {isLoading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>Référence</th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>Client</th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>Type de crédit</th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>
                  <SortBtn k="demande.montant" label="Montant" />
                </th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>
                  <SortBtn k="score" label="Score" />
                </th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>Statut</th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>Documents</th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>
                  <SortBtn k="dateCreation" label="Date" />
                </th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-sm" style={{ color: sub }}>
                  {isLoading ? "Chargement..." : "Aucun dossier trouvé"}
                </td></tr>
              )}
              {filtered.map((d, i) => {
                const sc = statusConfig[d.status as DossierStatus] || statusConfig.incomplet;
                const completion = getCompletion(d.documents);
                const type = getType(d.demande?.objet || "");
                return (
                  <tr key={d.id} className={`border-b border-gray-50 hover:bg-amber-50/30 cursor-pointer transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}
                    onClick={() => setLocation(`/dossier/${d.id}`)}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-semibold" style={{ color: txt }}>{d.client?.nom} {d.client?.prenom}</div>
                      <div className="text-[10px]" style={{ color: sub }}>{d.situationPro?.statut} · {d.situationPro?.employeur}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-full border bg-gray-50 border-gray-200 text-gray-600">{type}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold" style={{ color: txt }}>{fmt(d.demande?.montant || 0)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {d.score
                        ? <span className={`text-sm font-bold ${d.score >= 700 ? "text-emerald-600" : d.score >= 400 ? "text-amber-600" : "text-red-600"}`}>{d.score}</span>
                        : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border w-fit ${sc.bg} ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                      </span>
                      {d.decision && (decisionConf as any)[d.decision] && (
                        <span className={`flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 w-fit ${(decisionConf as any)[d.decision].color}`}>
                          {(decisionConf as any)[d.decision].label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${completion >= 80 ? "bg-emerald-500" : completion >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${completion}%` }} />
                        </div>
                        <span className="text-[10px]" style={{ color: sub }}>{completion}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px]" style={{ color: sub }}>{new Date(d.dateCreation).toLocaleDateString("fr-FR")}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={e => { e.stopPropagation(); setLocation(`/dossier/${d.id}`); }}
                        className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700">
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
