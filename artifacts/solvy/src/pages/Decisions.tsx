import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers, DossierStatus } from "@/data/mockData";
import { CheckCircle, XCircle, AlertTriangle, Eye, Filter } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

const decisionConf = {
  accord: { label: "Accord", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle },
  refus: { label: "Refus", cls: "text-red-700 bg-red-50 border-red-200", icon: XCircle },
  accord_conditions: { label: "Accord sous conditions", cls: "text-amber-700 bg-amber-50 border-amber-200", icon: AlertTriangle },
};

const recoLabel = (score: number | null) => {
  if (!score) return { label: "—", cls: "text-gray-400" };
  if (score >= 700) return { label: "Accord possible", cls: "text-emerald-600" };
  if (score >= 400) return { label: "Analyse requise", cls: "text-amber-600" };
  return { label: "Refus recommandé", cls: "text-red-600" };
};

export default function Decisions({ role, userName, userInitials, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const enAttente = mockDossiers.filter(d => (d.status === "score_calcule" || d.status === "en_analyse") && !d.decision);
  const prises = mockDossiers.filter(d => d.decision !== null);

  const filteredPrises = prises.filter(d => {
    const matchDec = decisionFilter === "all" || d.decision === decisionFilter;
    const matchScore = scoreFilter === "all"
      || (scoreFilter === "haut" && (d.score ?? 0) >= 700)
      || (scoreFilter === "moyen" && (d.score ?? 0) >= 400 && (d.score ?? 0) < 700)
      || (scoreFilter === "bas" && (d.score ?? 0) < 400);
    return matchDec && matchScore;
  });

  const accords = prises.filter(d => d.decision === "accord").length;
  const refus = prises.filter(d => d.decision === "refus").length;
  const conditions = prises.filter(d => d.decision === "accord_conditions").length;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Décisions de crédit" subtitle="Validation, suivi et historique des décisions de financement">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
          {enAttente.length} dossier(s) en attente de décision
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-amber-600">{enAttente.length}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>En attente</div>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-emerald-600">{accords}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Accordés</div>
          </div>
          <div className="bg-white border border-red-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-red-600">{refus}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Refusés</div>
          </div>
          <div className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-amber-600">{conditions}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Sous conditions</div>
          </div>
        </div>

        {/* Pending */}
        {enAttente.length > 0 && (
          <div className="bg-white border border-amber-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2" style={{ background: "hsl(43 57% 54% / 0.05)" }}>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-700">Dossiers en attente de décision</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-50" style={{ background: "hsl(43 57% 54% / 0.03)" }}>
                  {["Référence", "Client", "Montant", "Score", "Recommandation", "Action"].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enAttente.map(d => {
                  const reco = recoLabel(d.score);
                  return (
                    <tr key={d.id} className="border-b border-amber-50 hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3.5"><span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-semibold" style={{ color: txt }}>{d.client.prenom} {d.client.nom}</div>
                        <div className="text-[10px]" style={{ color: sub }}>{d.situationPro.statut}</div>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-sm font-semibold" style={{ color: txt }}>{fmt(d.demande.montant)}</span></td>
                      <td className="px-5 py-3.5">
                        {d.score ? <span className={`text-sm font-bold ${d.score >= 700 ? "text-emerald-600" : d.score >= 400 ? "text-amber-600" : "text-red-600"}`}>{d.score}</span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5"><span className={`text-xs font-semibold ${reco.cls}`}>{reco.label}</span></td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setLocation("/analyste")}
                          className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
                          <Eye className="w-3.5 h-3.5" /> Décider
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Past decisions */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: txt }}>Historique des décisions</h2>
            <div className="flex items-center gap-2">
              <select value={decisionFilter} onChange={e => setDecisionFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ color: txt }}>
                <option value="all">Toutes décisions</option>
                <option value="accord">Accord</option>
                <option value="refus">Refus</option>
                <option value="accord_conditions">Sous conditions</option>
              </select>
              <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ color: txt }}>
                <option value="all">Tous scores</option>
                <option value="haut">&gt; 700</option>
                <option value="moyen">400–700</option>
                <option value="bas">&lt; 400</option>
              </select>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                {["Dossier", "Client", "Score", "Recommandation auto.", "Décision finale", "Analyste", "Date", ""].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPrises.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-sm" style={{ color: sub }}>Aucune décision correspondante</td></tr>
              )}
              {filteredPrises.map((d, i) => {
                const dc = decisionConf[d.decision!];
                const DecIcon = dc.icon;
                const reco = recoLabel(d.score);
                return (
                  <tr key={d.id} className={`border-b border-gray-50 hover:bg-amber-50/20 transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                    <td className="px-5 py-3.5"><span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-semibold" style={{ color: txt }}>{d.client.prenom} {d.client.nom}</div>
                      <div className="text-xs" style={{ color: sub }}>{fmt(d.demande.montant)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold ${d.score! >= 700 ? "text-emerald-600" : d.score! >= 400 ? "text-amber-600" : "text-red-600"}`}>{d.score}/1000</span>
                    </td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-semibold ${reco.cls}`}>{reco.label}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${dc.cls}`}>
                        <DecIcon className="w-3 h-3" />{dc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-xs" style={{ color: sub }}>Pierre Durand</span></td>
                    <td className="px-5 py-3.5"><span className="text-xs font-mono" style={{ color: sub }}>{d.historique.at(-1)?.date.split(" ")[0]}</span></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setLocation(`/dossier/${d.id}`)}
                        className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
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
