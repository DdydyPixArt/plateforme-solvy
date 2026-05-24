import { useState } from "react";
import { useLocation, useParams } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useDossier, useTransmettreDossier } from "@/hooks/useApi";
import { mockDossiers, DossierStatus } from "@/data/mockData";
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, XCircle, Shield, Clock, FileText, User, Gauge, Printer, Send, Loader2, Edit } from "lucide-react";

interface DossierDetailProps { role: string; userName: string; userInitials: string; userEmail?: string; onLogout: () => void; }

function formatAnciennete(sp: any): string {
  if (!sp) return "—";
  let totalMois: number;
  if (sp.ancienneteMois !== undefined && sp.ancienneteMois >= 0) {
    totalMois = Math.round(Number(sp.ancienneteMois));
  } else if (sp.anciennete) {
    totalMois = Math.round(Number(sp.anciennete) * 12);
  } else {
    return "—";
  }
  const ans = Math.floor(totalMois / 12);
  const mois = totalMois % 12;
  if (ans === 0 && mois === 0) return "0 mois";
  if (ans === 0) return `${mois} mois`;
  if (mois === 0) return `${ans} an${ans > 1 ? "s" : ""}`;
  return `${ans} an${ans > 1 ? "s" : ""} et ${mois} mois`;
}

const statusConfig: Record<DossierStatus, { label: string; color: string; bg: string; border: string }> = {
  incomplet: { label: "Incomplet", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  en_analyse: { label: "En analyse", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  score_calcule: { label: "Score calculé", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  decision_rendue: { label: "Décision rendue", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  archive: { label: "Archivé", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
};

const docColors = {
  fourni: { text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  manquant: { text: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
  a_verifier: { text: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
};
const docLabels = { fourni: "Fourni", manquant: "Manquant", a_verifier: "À vérifier" };

const decisionConf = {
  accord: { label: "Accord", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  refus: { label: "Refus", cls: "text-red-700 bg-red-50 border-red-200" },
  accord_conditions: { label: "Accord sous conditions", cls: "text-amber-700 bg-amber-50 border-amber-200" },
};

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

export default function DossierDetail({ role, userName, userInitials, userEmail = "", onLogout }: DossierDetailProps) {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { data: dossier, isLoading } = useDossier(params.id);
  const transmettreM = useTransmettreDossier();
  const [transmitting, setTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);

  const handleTransmettre = async () => {
    if (!dossier) return;
    setTransmitting(true);
    try {
      await transmettreM.mutateAsync(dossier.id);
      setTransmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setTransmitting(false);
    }
  };

  if (isLoading || !dossier) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </Layout>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const sc = statusConfig[dossier.status as DossierStatus] || statusConfig.incomplet;

  const isTransmis = !!(dossier as any).transmisAt || transmitted;
  const canTransmettre = role === "conseiller" && !isTransmis && dossier.status !== "decision_rendue";

  const InfoCard = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold" style={{ color: txt }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) => (
    <div className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
      <span style={{ color: sub }}>{label}</span>
      <span className={`font-medium ${color || ""}`} style={!color ? { color: txt } : {}}>{value}</span>
    </div>
  );

  const BoolBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${ok ? "text-red-700 bg-red-50 border-red-200" : "text-emerald-700 bg-emerald-50 border-emerald-200"}`}>
      {ok ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
      {label}: {ok ? "Inscrit" : "Non inscrit"}
    </div>
  );

  const ScoreBadge = () => {
    if (!dossier.score) return <span className="text-xs text-gray-400">Non calculé</span>;
    const cls = dossier.score >= 700 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : dossier.score >= 400 ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-red-700 bg-red-50 border-red-200";
    return <span className={`text-sm font-bold px-3 py-1 rounded-full border ${cls}`}>{dossier.score}/1000</span>;
  };

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title={`Dossier ${dossier.reference}`} subtitle={`${dossier.client?.prenom} ${dossier.client?.nom} · Conseiller: ${dossier.conseiller}`}>
        <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: sub }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${sc.bg} ${sc.border} ${sc.color}`}>{sc.label}</span>
        {dossier.decision && (decisionConf as any)[dossier.decision] && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${(decisionConf as any)[dossier.decision].cls}`}>
            {(decisionConf as any)[dossier.decision].label}
          </span>
        )}
        <ScoreBadge />
        {dossier.score && (
          <button onClick={() => setLocation(`/score/${dossier.id}`)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all">
            <Gauge className="w-4 h-4" /> Score
          </button>
        )}
        {canTransmettre && (
          <button onClick={handleTransmettre} disabled={transmitting}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "hsl(220 70% 50%)" }}>
            {transmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Transmettre à l'analyse risque
          </button>
        )}
        {isTransmis && dossier.status !== "decision_rendue" && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
            <CheckCircle className="w-3.5 h-3.5" /> Transmis à l'analyse
          </span>
        )}
        {role === "conseiller" && !dossier.decision && (
          <button onClick={() => setLocation(`/dossier/${dossier.id}/modifier`)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all">
            <Edit className="w-4 h-4" /> Modifier
          </button>
        )}
        <button onClick={() => setLocation(`/export/${dossier.id}`)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
          <Printer className="w-4 h-4" /> Export PDF
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Regulatory quick strip */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-white rounded-xl border border-gray-200 shadow-sm flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: sub }}>Contrôles réglementaires</span>
          <BoolBadge ok={dossier.ficp} label="FICP" />
          <BoolBadge ok={dossier.fcc} label="FCC" />
          <BoolBadge ok={dossier.ppe} label="PPE" />
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${dossier.lcbft ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-700 bg-red-50 border-red-200"}`}>
            <CheckCircle className="w-3 h-3" />
            LCB-FT: {dossier.lcbft ? "Conforme" : "Alerte"}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
            <Shield className="w-3 h-3" />
            KYC: Validé · Niveau C2 — Confidentiel
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Col 1 */}
          <div className="space-y-4">
            <InfoCard title="Profil client" icon={User}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(43 57% 54% / 0.15)", border: "1px solid hsl(43 57% 54% / 0.3)" }}>
                  <span className="text-lg font-bold" style={{ color: "hsl(43 57% 42%)" }}>
                    {dossier.client?.prenom?.[0]}{dossier.client?.nom?.[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: txt }}>{dossier.client?.prenom} {dossier.client?.nom}</div>
                  <div className="text-xs" style={{ color: sub }}>
                    {dossier.client?.dateNaissance ? `Né(e) le ${new Date(dossier.client.dateNaissance).toLocaleDateString("fr-FR")}` : ""}
                  </div>
                </div>
              </div>
              <Row label="Situation familiale" value={dossier.client?.situationFamiliale || "—"} />
              <Row label="Personnes à charge" value={String(dossier.client?.personnesCharge ?? "—")} />
              <Row label="Adresse" value={`${dossier.client?.adresse}, ${dossier.client?.codePostal} ${dossier.client?.ville}`} />
              <Row label="Téléphone" value={dossier.client?.telephone || "—"} />
              <Row label="Email" value={dossier.client?.email || "—"} />
            </InfoCard>

            <InfoCard title="Situation professionnelle" icon={Shield}>
              <Row label="Statut" value={dossier.situationPro?.statut || "—"} />
              <Row label="Employeur" value={dossier.situationPro?.employeur || "—"} />
              <Row label="Poste" value={dossier.situationPro?.poste || "—"} />
              <Row label="Secteur" value={dossier.situationPro?.secteur || "—"} />
              <Row label="Ancienneté" value={formatAnciennete(dossier.situationPro)} />
            </InfoCard>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <InfoCard title="Revenus & charges" icon={TrendingUp}>
              <Row label="Revenus nets" value={fmt(dossier.finances?.revenusNets || 0) + "/mois"} color="text-emerald-600" />
              <Row label="Autres revenus" value={fmt(dossier.finances?.autresRevenus || 0) + "/mois"} />
              <Row label="Charges fixes" value={fmt(dossier.finances?.chargesFixes || 0) + "/mois"} color="text-red-600" />
              <Row label="Crédits en cours" value={fmt(dossier.finances?.creditsEnCours || 0) + "/mois"} color="text-red-600" />
            </InfoCard>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Taux d'endettement", value: `${dossier.tauxEndettement}%`, note: dossier.tauxEndettement > 35 ? "⚠ Au-dessus du seuil" : "✓ Conforme", cls: dossier.tauxEndettement > 35 ? "text-red-600" : "text-emerald-600" },
                { label: "Capacité d'emprunt", value: fmt(dossier.capaciteEmprunt) + "/m", note: "Mensualité max", cls: "text-amber-600" },
                { label: "Reste à vivre", value: fmt(dossier.resteAVivre) + "/m", note: "Après charges", cls: "text-blue-600" },
                { label: "Incidents (24 mois)", value: String(dossier.incidents), note: dossier.incidents > 0 ? "Attention" : "Aucun", cls: dossier.incidents > 0 ? "text-amber-600" : "text-emerald-600" },
              ].map(({ label, value, note, cls }) => (
                <div key={label} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                  <div className="text-xs mb-1" style={{ color: sub }}>{label}</div>
                  <div className={`text-base font-bold ${cls}`}>{value}</div>
                  <div className="text-[10px] mt-1" style={{ color: sub }}>{note}</div>
                </div>
              ))}
            </div>

            <InfoCard title="Demande de crédit" icon={FileText}>
              <Row label="Montant demandé" value={<span className="font-bold" style={{ color: "hsl(43 57% 38%)" }}>{fmt(dossier.demande?.montant || 0)}</span>} />
              <Row label="Durée" value={`${dossier.demande?.duree} mois (${((dossier.demande?.duree || 0) / 12).toFixed(0)} ans)`} />
              <Row label="Objet" value={dossier.demande?.objet || "—"} />
              <Row label="Apport personnel" value={fmt(dossier.demande?.apport || 0)} />
              <Row label="Valeur de l'actif" value={fmt(dossier.demande?.valeurActif || 0)} />
              <Row label="Garant" value={dossier.demande?.garant ? "Oui" : "Non"} />
            </InfoCard>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <InfoCard title="Documents justificatifs" icon={FileText}>
              <div className="space-y-2">
                {(dossier.documents || []).map((doc: any, i: number) => {
                  const dc = docColors[doc.statut as keyof typeof docColors] || docColors.manquant;
                  const Icon = dc.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${dc.text}`} />
                        <span className="text-xs truncate" style={{ color: txt }}>{doc.nom}</span>
                      </div>
                      <span className={`flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${dc.bg} ${dc.text}`}>
                        {docLabels[doc.statut as keyof typeof docLabels] || doc.statut}
                      </span>
                    </div>
                  );
                })}
              </div>
            </InfoCard>

            <InfoCard title="Historique du dossier" icon={Clock}>
              <div className="space-y-3">
                {(dossier.historique || []).map((ev: any, i: number) => (
                  <div key={i} className="relative pl-4">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full" style={{ background: "hsl(43 57% 54%)", border: "1px solid hsl(43 57% 42%)" }} />
                    {i < dossier.historique.length - 1 && (
                      <div className="absolute left-[3px] top-3 bottom-0 w-0.5 bg-gray-100" />
                    )}
                    <div className="text-[10px] mb-0.5" style={{ color: sub }}>{ev.date} · {ev.utilisateur}</div>
                    <div className="text-xs font-medium" style={{ color: txt }}>{ev.action}</div>
                    <div className="text-[10px]" style={{ color: "hsl(43 57% 46%)" }}>{ev.statut}</div>
                  </div>
                ))}
              </div>
            </InfoCard>

            {dossier.analysteCommentaire && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-blue-700 mb-1">Commentaire analyste
                  {(dossier as any).analysteAssigne && <span className="ml-2 font-normal text-blue-600">— {(dossier as any).analysteAssigne}</span>}
                </div>
                <div className="text-xs text-blue-800">{dossier.analysteCommentaire}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
