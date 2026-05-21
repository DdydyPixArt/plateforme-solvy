import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers, scoreDetails } from "@/data/mockData";
import { AlertTriangle, CheckCircle, XCircle, Shield, FileCheck, Eye } from "lucide-react";

interface AnalysteProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const pendingDossiers = mockDossiers.filter(d => d.status === "score_calcule" || d.status === "en_analyse");

export default function Analyste({ role, userName, userInitials, onLogout }: AnalysteProps) {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState(pendingDossiers[0]);
  const [decision, setDecision] = useState<"accord" | "refus" | "accord_conditions">("accord_conditions");
  const [commentaire, setCommentaire] = useState("Le taux d'endettement de 38.6% dépasse le seuil réglementaire de 35%. Cependant, la stabilité professionnelle du client (CDI, 8 ans d'ancienneté) et le reste à vivre satisfaisant permettent d'envisager un accord sous conditions. Exiger un apport supplémentaire de 10 000 € ou une assurance renforcée.");
  const [validated, setValidated] = useState(false);
  const [docRequest, setDocRequest] = useState(false);

  const score = selected.score || 0;
  const scoreColor = score >= 700 ? "text-green-400" : score >= 400 ? "text-yellow-400" : "text-red-400";
  const scoreBg = score >= 700 ? "bg-green-400/10 border-green-400/20" : score >= 400 ? "bg-yellow-400/10 border-yellow-400/20" : "bg-red-400/10 border-red-400/20";

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const alerts = [
    ...(selected.tauxEndettement > 35 ? [{ type: "warning", msg: `Taux d'endettement ${selected.tauxEndettement}% > seuil 35%` }] : []),
    ...(selected.incidents > 0 ? [{ type: "warning", msg: `${selected.incidents} incident(s) de paiement (24 mois)` }] : []),
    ...(selected.ppe ? [{ type: "error", msg: "Statut PPE — Vérification LCB-FT renforcée requise" }] : []),
    ...(selected.ficp ? [{ type: "error", msg: "Client inscrit au FICP — Risque élevé" }] : []),
    ...(!selected.lcbft ? [{ type: "error", msg: "Contrôle LCB-FT non effectué" }] : [{ type: "success", msg: "Contrôle LCB-FT conforme" }]),
  ];

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Dashboard analyste risque" subtitle="Analyse et prise de décision sur les dossiers de crédit" />

      <div className="flex-1 overflow-hidden flex">
        {/* Left: dossier list */}
        <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Dossiers à analyser ({pendingDossiers.length})</div>
          </div>
          <div className="space-y-1 p-2">
            {pendingDossiers.map(d => {
              const sc = d.score || 0;
              const isSelected = selected.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/20 border border-transparent"}`}
                >
                  <div className="text-xs font-mono text-primary mb-0.5">{d.reference}</div>
                  <div className="text-sm font-medium text-foreground">{d.client.nom} {d.client.prenom}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{d.demande.montant.toLocaleString("fr-FR")} €</span>
                    <span className={`text-xs font-bold ${sc >= 700 ? "text-green-400" : sc >= 400 ? "text-yellow-400" : "text-red-400"}`}>{sc}/1000</span>
                  </div>
                  {d.ppe && <span className="text-[10px] text-red-400 mt-1 block">PPE</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: file detail */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">{selected.client.prenom} {selected.client.nom}</h2>
              <div className="text-xs text-muted-foreground">{selected.reference} · Créé le {selected.dateCreation} par {selected.conseiller}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-full border text-sm font-bold ${scoreBg} ${scoreColor}`}>{score}/1000</div>
              <button onClick={() => setLocation(`/score/${selected.id}`)} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Eye className="w-3 h-3" /> Voir le score
              </button>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Alertes réglementaires</div>
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm ${a.type === "error" ? "bg-red-400/10 border-red-400/20 text-red-400" : a.type === "warning" ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400" : "bg-green-400/10 border-green-400/20 text-green-400"}`}>
                  {a.type === "error" ? <XCircle className="w-4 h-4 flex-shrink-0" /> : a.type === "warning" ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                  {a.msg}
                </div>
              ))}
            </div>
          )}

          {/* Financial summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Revenus nets", value: fmt(selected.finances.revenusNets) + "/m", color: "text-green-400" },
              { label: "Taux endettement", value: `${selected.tauxEndettement}%`, color: selected.tauxEndettement > 35 ? "text-red-400" : "text-green-400" },
              { label: "Capacité emprunt", value: fmt(selected.capaciteEmprunt) + "/m", color: "text-primary" },
              { label: "Reste à vivre", value: fmt(selected.resteAVivre) + "/m", color: "text-blue-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className={`text-base font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Contrôles documentaires */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Contrôle documentaire</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selected.documents.map((doc, i) => {
                const colors = { fourni: "text-green-400 bg-green-400/10", manquant: "text-red-400 bg-red-400/10", a_verifier: "text-yellow-400 bg-yellow-400/10" };
                const icons = { fourni: CheckCircle, manquant: XCircle, a_verifier: AlertTriangle };
                const Icon = icons[doc.statut];
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${colors[doc.statut].split(" ")[0]}`} />
                    <span className="text-foreground truncate">{doc.nom}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score breakdown mini */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Critères de score</h3>
            </div>
            <div className="space-y-2">
              {scoreDetails.slice(0, 5).map((item, i) => {
                const pct = (item.score / item.max) * 100;
                const barColor = pct >= 80 ? "bg-green-400" : pct >= 55 ? "bg-yellow-400" : "bg-red-400";
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-40 truncate flex-shrink-0">{item.critere}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-16 text-right">{item.score}/{item.max}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: decision panel */}
        <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Zone de décision</h3>
            <p className="text-xs text-muted-foreground">Analyste: {userName}</p>
          </div>

          {validated ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-14 h-14 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <div className="text-sm font-semibold text-foreground text-center">Décision enregistrée</div>
              <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${decision === "accord" ? "bg-green-400/10 text-green-400" : decision === "refus" ? "bg-red-400/10 text-red-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                {decision === "accord" ? "ACCORD" : decision === "refus" ? "REFUS" : "ACCORD SOUS CONDITIONS"}
              </div>
              <button onClick={() => setValidated(false)} className="text-xs text-muted-foreground hover:text-foreground mt-2">Modifier</button>
            </div>
          ) : (
            <>
              {/* Decision radio */}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Décision</div>
                <div className="space-y-2">
                  {[
                    { value: "accord", label: "Accord", color: "text-green-400 border-green-400/40 bg-green-400/5" },
                    { value: "refus", label: "Refus", color: "text-red-400 border-red-400/40 bg-red-400/5" },
                    { value: "accord_conditions", label: "Accord sous conditions", color: "text-yellow-400 border-yellow-400/40 bg-yellow-400/5" },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${decision === opt.value ? opt.color : "border-border hover:bg-muted/20"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${decision === opt.value ? "border-current" : "border-muted-foreground"}`}>
                        {decision === opt.value && <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <input type="radio" name="decision" value={opt.value} checked={decision === (opt.value as any)} onChange={() => setDecision(opt.value as any)} className="sr-only" />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Commentaire analyste</div>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  rows={6}
                  placeholder="Saisir votre analyse et les motivations de la décision..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setValidated(true)}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2.5 rounded-lg transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Valider la décision
                </button>
                <button
                  onClick={() => setDocRequest(!docRequest)}
                  className={`w-full flex items-center justify-center gap-2 border text-sm font-medium py-2.5 rounded-lg transition-all ${docRequest ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"}`}
                >
                  <FileCheck className="w-4 h-4" />
                  {docRequest ? "Documents demandés" : "Demander des documents"}
                </button>
              </div>

              <div className="text-[10px] text-muted-foreground leading-relaxed pt-2 border-t border-border">
                Toute décision est traçée et archivée conformément aux exigences RGPD et aux obligations de traçabilité bancaire. L'analyste certifie avoir effectué une revue complète du dossier.
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
