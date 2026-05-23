import { useLocation, useParams } from "wouter";
import { useRef } from "react";
import Layout, { PageHeader } from "@/components/Layout";
import { scoreDetails, mockDossiers } from "@/data/mockData";
import { useDossier } from "@/hooks/useApi";
import { ArrowLeft, Printer, Download, CheckCircle, XCircle, AlertTriangle, Shield, FileText } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

function SemiGaugeMini({ score }: { score: number }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = 82;
  const sw = 16;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const pt = (d: number, rr: number) => ({ x: cx + rr * Math.cos(toRad(d)), y: cy + rr * Math.sin(toRad(d)) });
  const arc = (from: number, to: number, rr: number) => {
    const p1 = pt(from, rr); const p2 = pt(to, rr);
    return `M ${p1.x} ${p1.y} A ${rr} ${rr} 0 0 1 ${p2.x} ${p2.y}`;
  };
  const zones = [{ f: 180, t: 108, c: "#e74c3c" }, { f: 108, t: 54, c: "#e67e22" }, { f: 54, t: 0, c: "#2ecc71" }];
  const needleA = 180 - (score / 1000) * 180;
  const nTip = pt(needleA, r - 6);
  const sc = score >= 700 ? "#2ecc71" : score >= 400 ? "#e67e22" : "#e74c3c";
  return (
    <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`} className="overflow-visible">
      <path d={arc(180, 0, r)} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={sw} strokeLinecap="round" />
      {zones.map((z, i) => <path key={i} d={arc(z.f, z.t, r)} fill="none" stroke={z.c} strokeWidth={sw} strokeLinecap={i === 0 || i === 2 ? "round" : "butt"} />)}
      <line x1={cx} y1={cy} x2={nTip.x} y2={nTip.y} stroke={sc} strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="white" stroke={sc} strokeWidth={2} />
      <text x={cx} y={cy - 24} textAnchor="middle" fill={sc} fontSize={30} fontWeight="800">{score}</text>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#888" fontSize={10}>/1000</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill={sc} fontSize={11} fontWeight="600">
        {score >= 700 ? "Risque faible" : score >= 400 ? "Risque modéré" : "Risque élevé"}
      </text>
    </svg>
  );
}

const fmtE = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function ExportPDF({ role, userName, userInitials, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { data: dossierData } = useDossier(params.id);
  const dossier = dossierData || mockDossiers.find(d => d.id === params.id) || mockDossiers[0];
  const printRef = useRef<HTMLDivElement>(null);
  const score = dossier?.score || 742;

  const recoLabel = score >= 700 ? "ACCORD POSSIBLE" : score >= 400 ? "ACCORD SOUS CONDITIONS" : "REFUS RECOMMANDÉ";
  const recoBg = score >= 700 ? "#d1fae5" : score >= 400 ? "#fef3c7" : "#fee2e2";
  const recoColor = score >= 700 ? "#065f46" : score >= 400 ? "#78350f" : "#991b1b";

  const handlePrint = () => window.print();

  const Row = ({ l, v }: { l: string; v: string }) => (
    <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
      <span style={{ color: sub }}>{l}</span>
      <span className="font-medium" style={{ color: txt }}>{v}</span>
    </div>
  );

  const BoolBadge = ({ ok, label }: { ok: boolean; label: string }) => {
    const Icon = ok ? XCircle : CheckCircle;
    return (
      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${ok ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}: {ok ? "Inscrit" : "Non inscrit"}
      </span>
    );
  };

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title={`Export / Impression — ${dossier.reference}`} subtitle="Rapport complet de solvabilité client">
        <button onClick={() => setLocation(`/dossier/${dossier.id}`)}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 no-print" style={{ color: sub }}>
          <ArrowLeft className="w-4 h-4" /> Retour au dossier
        </button>
        <button onClick={handlePrint}
          className="no-print flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "hsl(43 60% 46%)" }}>
          <Printer className="w-4 h-4" /> Imprimer / PDF
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Print-ready document */}
        <div ref={printRef} className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
          {/* Doc header */}
          <div className="flex items-center justify-between px-8 py-6" style={{ background: "hsl(222 30% 10%)" }}>
            <div>
              <div className="text-2xl font-bold tracking-widest" style={{ color: "white" }}>SOLVY</div>
              <div className="text-xs mt-1" style={{ color: "hsl(43 57% 60%)" }}>Plateforme d'aide à la décision — Solvabilité client</div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: "hsl(220 20% 60%)" }}>Rapport de solvabilité</div>
              <div className="text-sm font-mono font-bold mt-1" style={{ color: "hsl(43 57% 60%)" }}>{dossier.reference}</div>
              <div className="text-xs mt-0.5" style={{ color: "hsl(220 20% 50%)" }}>Modèle v2.3.1 · {new Date().toLocaleDateString("fr-FR")}</div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-7">
            {/* Banner */}
            <div className="flex items-center gap-4 px-5 py-4 rounded-xl border"
              style={{ background: recoBg, borderColor: recoColor + "30" }}>
              <FileText className="w-6 h-6 flex-shrink-0" style={{ color: recoColor }} />
              <div>
                <div className="text-sm font-bold" style={{ color: recoColor }}>RECOMMANDATION SYSTÈME : {recoLabel}</div>
                <div className="text-xs mt-0.5" style={{ color: recoColor + "aa" }}>
                  Ce score est un outil d'aide à la décision. Toute décision finale requiert une validation humaine par un analyste risque habilité (RGPD Art. 22).
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left: gauge + identité */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: sub }}>Score de solvabilité</h3>
                <div className="flex justify-center mb-4">
                  <SemiGaugeMini score={score} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-xs" style={{ color: sub }}>Probabilité défaut</div>
                    <div className="text-lg font-bold text-amber-600 mt-1">12.4%</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-xs" style={{ color: sub }}>Taux endettement</div>
                    <div className={`text-lg font-bold mt-1 ${dossier.tauxEndettement > 35 ? "text-red-600" : "text-emerald-600"}`}>{dossier.tauxEndettement}%</div>
                  </div>
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: sub }}>Identité du client</h3>
                <div className="space-y-0">
                  <Row l="Nom complet" v={`${dossier.client.prenom} ${dossier.client.nom}`} />
                  <Row l="Date de naissance" v={new Date(dossier.client.dateNaissance).toLocaleDateString("fr-FR")} />
                  <Row l="Situation familiale" v={dossier.client.situationFamiliale} />
                  <Row l="Personnes à charge" v={String(dossier.client.personnesCharge)} />
                  <Row l="Adresse" v={`${dossier.client.adresse}, ${dossier.client.codePostal} ${dossier.client.ville}`} />
                </div>
              </div>

              {/* Right: finances + demande */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: sub }}>Situation professionnelle</h3>
                  <Row l="Statut" v={dossier.situationPro.statut} />
                  <Row l="Employeur" v={dossier.situationPro.employeur} />
                  <Row l="Poste" v={dossier.situationPro.poste} />
                  <Row l="Ancienneté" v={`${dossier.situationPro.anciennete} ans`} />
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: sub }}>Revenus & charges</h3>
                  <Row l="Revenus nets mensuels" v={fmtE(dossier.finances.revenusNets) + "/mois"} />
                  <Row l="Autres revenus" v={fmtE(dossier.finances.autresRevenus) + "/mois"} />
                  <Row l="Charges fixes" v={fmtE(dossier.finances.chargesFixes) + "/mois"} />
                  <Row l="Crédits en cours" v={fmtE(dossier.finances.creditsEnCours) + "/mois"} />
                  <Row l="Reste à vivre" v={fmtE(dossier.resteAVivre) + "/mois"} />
                  <Row l="Capacité de remboursement" v={fmtE(dossier.capaciteEmprunt) + "/mois"} />
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: sub }}>Demande de crédit</h3>
                  <Row l="Montant demandé" v={fmtE(dossier.demande.montant)} />
                  <Row l="Durée" v={`${dossier.demande.duree} mois`} />
                  <Row l="Objet" v={dossier.demande.objet} />
                  <Row l="Apport personnel" v={fmtE(dossier.demande.apport)} />
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: sub }}>Détail du calcul de score</h3>
              <div className="grid grid-cols-2 gap-3">
                {scoreDetails.map((item, i) => {
                  const pct = (item.score / item.max) * 100;
                  const bc = pct >= 80 ? "bg-emerald-500" : pct >= 55 ? "bg-amber-500" : "bg-red-500";
                  const tc = pct >= 80 ? "text-emerald-700" : pct >= 55 ? "text-amber-700" : "text-red-700";
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: txt }}>{item.critere}</span>
                        <span className={`text-xs font-bold ${tc}`}>{item.score}/{item.max}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                        <div className={`h-full rounded-full ${bc}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px]" style={{ color: sub }}>{item.valeur} — {item.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regulatory checks */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: sub }}>Contrôles réglementaires</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <BoolBadge ok={dossier.ficp} label="FICP" />
                <BoolBadge ok={dossier.fcc} label="FCC" />
                <BoolBadge ok={dossier.ppe} label="PPE" />
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${dossier.lcbft ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  LCB-FT: {dossier.lcbft ? "Conforme" : "Alerte"}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                  <Shield className="w-3.5 h-3.5" />
                  KYC: Validé
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-5 border-t border-gray-100 flex items-start justify-between gap-6">
              <div className="text-[10px] leading-relaxed" style={{ color: sub }}>
                <strong style={{ color: txt }}>Avertissement légal :</strong> Ce rapport est généré automatiquement par le système SOLVY à titre d'aide à la décision. 
                Il ne constitue pas une décision de crédit. Conformément au RGPD Art. 22, toute décision finale doit être 
                prise par un analyste risque habilité après revue complète du dossier. Les données sont confidentielles — niveau C2.
              </div>
              <div className="text-right text-[10px] flex-shrink-0" style={{ color: sub }}>
                <div>Émis le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                <div className="mt-0.5">Par : {userName}</div>
                <div className="mt-0.5">SOLVY — Moteur v2.3.1</div>
              </div>
            </div>

            {/* Signature zones */}
            <div className="grid grid-cols-2 gap-8 mt-4">
              {["Conseiller bancaire", "Analyste risque habilité"].map(role => (
                <div key={role} className="border border-gray-200 rounded-xl p-4">
                  <div className="text-xs font-semibold mb-1" style={{ color: txt }}>{role}</div>
                  <div className="text-[10px] mb-8" style={{ color: sub }}>Date et signature :</div>
                  <div className="border-t border-gray-200 pt-1 text-[10px]" style={{ color: sub }}>Visa obligatoire avant transmission</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
