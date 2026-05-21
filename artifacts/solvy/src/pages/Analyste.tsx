import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers, scoreDetails } from "@/data/mockData";
import { AlertTriangle, CheckCircle, XCircle, Shield, FileCheck, Eye } from "lucide-react";

interface AnalysteProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const pendingDossiers = mockDossiers.filter(d => d.status === "score_calcule" || d.status === "en_analyse");

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

export default function Analyste({ role, userName, userInitials, onLogout }: AnalysteProps) {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState(pendingDossiers[0]);
  const [decision, setDecision] = useState<"accord" | "refus" | "accord_conditions">("accord_conditions");
  const [commentaire, setCommentaire] = useState("Le taux d'endettement de 38.6% dépasse le seuil réglementaire de 35%. Cependant, la stabilité professionnelle (CDI, 8 ans) et le reste à vivre satisfaisant permettent d'envisager un accord sous conditions. Exiger un apport supplémentaire de 10 000 € ou une assurance renforcée.");
  const [validated, setValidated] = useState(false);
  const [docRequest, setDocRequest] = useState(false);

  const score = selected?.score || 0;
  const scoreCls = score >= 700 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : score >= 400 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const alerts = [
    ...(selected?.tauxEndettement > 35 ? [{ type: "warning" as const, msg: `Taux d'endettement ${selected.tauxEndettement}% > seuil 35%` }] : []),
    ...(selected?.incidents > 0 ? [{ type: "warning" as const, msg: `${selected.incidents} incident(s) de paiement (24 mois)` }] : []),
    ...(selected?.ppe ? [{ type: "error" as const, msg: "Statut PPE — Vérification LCB-FT renforcée requise" }] : []),
    ...(selected?.ficp ? [{ type: "error" as const, msg: "Client inscrit au FICP — Risque élevé" }] : []),
    ...(selected?.lcbft ? [{ type: "success" as const, msg: "Contrôle LCB-FT conforme" }] : [{ type: "error" as const, msg: "Contrôle LCB-FT non effectué" }]),
  ];

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Dossiers à analyser" subtitle="Analyse et prise de décision sur les dossiers de crédit" />

      <div className="flex-1 overflow-hidden flex">
        {/* Left list */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
            <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: sub }}>En attente ({pendingDossiers.length})</div>
          </div>
          <div className="p-2 space-y-1">
            {pendingDossiers.map(d => {
              const sc = d.score || 0;
              const isSelected = selected?.id === d.id;
              const alerts = [...(d.ppe ? ["PPE"] : []), ...(d.ficp ? ["FICP"] : [])];
              return (
                <button key={d.id} onClick={() => setSelected(d)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? "border-amber-300 bg-amber-50" : "border-transparent hover:bg-gray-50"}`}>
                  <div className="text-xs font-mono font-semibold mb-0.5" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</div>
                  <div className="text-sm font-semibold" style={{ color: txt }}>{d.client.nom} {d.client.prenom}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1">
                      {alerts.map(a => <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-600 font-medium">{a}</span>)}
                    </div>
                    <span className={`text-sm font-bold ${sc >= 700 ? "text-emerald-600" : sc >= 400 ? "text-amber-600" : "text-red-600"}`}>{sc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {selected && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{selected.reference}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs" style={{ color: sub }}>Créé le {selected.dateCreation}</span>
                  </div>
                  <h2 className="text-base font-semibold" style={{ color: txt }}>{selected.client.prenom} {selected.client.nom}</h2>
                  <div className="text-sm mt-0.5" style={{ color: sub }}>{fmt(selected.demande.montant)} — {selected.demande.objet}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full border text-sm font-bold ${scoreCls}`}>{score}/1000</span>
                  <button onClick={() => setLocation(`/score/${selected.id}`)}
                    className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
                    <Eye className="w-3.5 h-3.5" /> Voir score
                  </button>
                </div>
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((a, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium ${a.type === "error" ? "bg-red-50 border-red-200 text-red-700" : a.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                      {a.type === "error" ? <XCircle className="w-4 h-4 flex-shrink-0" /> : a.type === "warning" ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                      {a.msg}
                    </div>
                  ))}
                </div>
              )}

              {/* Financial summary */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Revenus nets", value: fmt(selected.finances.revenusNets) + "/m", cls: "text-emerald-600" },
                  { label: "Taux endettement", value: `${selected.tauxEndettement}%`, cls: selected.tauxEndettement > 35 ? "text-red-600" : "text-emerald-600" },
                  { label: "Capacité emprunt", value: fmt(selected.capaciteEmprunt) + "/m", cls: "text-amber-600" },
                  { label: "Reste à vivre", value: fmt(selected.resteAVivre) + "/m", cls: "text-blue-600" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xs mb-1" style={{ color: sub }}>{label}</div>
                    <div className={`text-base font-bold ${cls}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold" style={{ color: txt }}>Contrôle documentaire</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selected.documents.map((doc, i) => {
                    const icons = { fourni: CheckCircle, manquant: XCircle, a_verifier: AlertTriangle };
                    const cls = { fourni: "text-emerald-600", manquant: "text-red-600", a_verifier: "text-amber-600" };
                    const Icon = icons[doc.statut];
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cls[doc.statut]}`} />
                        <span style={{ color: txt }}>{doc.nom}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score breakdown mini */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold" style={{ color: txt }}>Principaux critères de score</h3>
                </div>
                <div className="space-y-2.5">
                  {scoreDetails.slice(0, 5).map((item, i) => {
                    const pct = (item.score / item.max) * 100;
                    const bc = pct >= 80 ? "bg-emerald-500" : pct >= 55 ? "bg-amber-500" : "bg-red-500";
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs w-40 flex-shrink-0 truncate" style={{ color: sub }}>{item.critere}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${bc}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold w-16 text-right" style={{ color: txt }}>{item.score}/{item.max}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: decision panel */}
        <div className="w-72 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: txt }}>Zone de décision</h3>
            <p className="text-xs mt-0.5" style={{ color: sub }}>Analyste : {userName}</p>
          </div>

          {validated ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-sm font-semibold text-center" style={{ color: txt }}>Décision enregistrée</div>
              <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${decision === "accord" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : decision === "refus" ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                {decision === "accord" ? "ACCORD" : decision === "refus" ? "REFUS" : "ACCORD SOUS CONDITIONS"}
              </div>
              <button onClick={() => setValidated(false)} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Modifier</button>
            </div>
          ) : (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: sub }}>Décision</div>
                <div className="space-y-2">
                  {[
                    { value: "accord", label: "Accord", cls: "border-emerald-300 bg-emerald-50 text-emerald-700" },
                    { value: "refus", label: "Refus", cls: "border-red-300 bg-red-50 text-red-700" },
                    { value: "accord_conditions", label: "Accord sous conditions", cls: "border-amber-300 bg-amber-50 text-amber-700" },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${decision === opt.value ? opt.cls : "border-gray-100 hover:bg-gray-50"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${decision === opt.value ? "border-current" : "border-gray-300"}`}>
                        {decision === opt.value && <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <input type="radio" name="decision" value={opt.value} checked={decision === (opt.value as any)} onChange={() => setDecision(opt.value as any)} className="sr-only" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: sub }}>Commentaire analyste</div>
                <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={6} placeholder="Saisir votre analyse..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-300 resize-none"
                  style={{ color: txt }} />
              </div>

              <div className="space-y-2">
                <button onClick={() => setValidated(true)}
                  className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl transition-all hover:opacity-90"
                  style={{ background: "hsl(43 60% 46%)" }}>
                  <CheckCircle className="w-4 h-4" /> Valider la décision
                </button>
                <button onClick={() => setDocRequest(!docRequest)}
                  className={`w-full flex items-center justify-center gap-2 border text-sm font-medium py-2.5 rounded-xl transition-all ${docRequest ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  <FileCheck className="w-4 h-4" />
                  {docRequest ? "Documents demandés ✓" : "Demander des documents"}
                </button>
              </div>

              <div className="text-[10px] leading-relaxed pt-3 border-t border-gray-100" style={{ color: sub }}>
                Toute décision est tracée et archivée. L'analyste certifie avoir effectué une revue complète du dossier (RGPD Art. 22 — décision non automatisée).
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
