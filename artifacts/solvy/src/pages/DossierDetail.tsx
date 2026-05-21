import { useLocation, useParams } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers, DossierStatus } from "@/data/mockData";
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, XCircle, Shield, Clock, FileText, User, Gauge } from "lucide-react";

interface DossierDetailProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const statusConfig: Record<DossierStatus, { label: string; color: string; bg: string }> = {
  incomplet: { label: "Incomplet", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  en_analyse: { label: "En analyse", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  score_calcule: { label: "Score calculé", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  decision_rendue: { label: "Décision rendue", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  archive: { label: "Archivé", color: "text-muted-foreground", bg: "bg-muted/30 border-border" },
};

const docColors = {
  fourni: { text: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: CheckCircle },
  manquant: { text: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: XCircle },
  a_verifier: { text: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: AlertTriangle },
};
const docLabels = { fourni: "Fourni", manquant: "Manquant", a_verifier: "À vérifier" };

export default function DossierDetail({ role, userName, userInitials, onLogout }: DossierDetailProps) {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const dossier = mockDossiers.find(d => d.id === params.id) || mockDossiers[0];

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const sc = statusConfig[dossier.status];

  const InfoCard = ({ title, icon: Icon, children }: any) => (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) => (
    <div className="flex justify-between py-1.5 text-sm border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${color || "text-foreground"}`}>{value}</span>
    </div>
  );

  const BoolBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${ok ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-green-400 bg-green-400/10 border-green-400/20"}`}>
      {ok ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
      {label}: {ok ? "Inscrit" : "Non inscrit"}
    </div>
  );

  const ScoreBadge = () => {
    if (!dossier.score) return <span className="text-xs text-muted-foreground">Non calculé</span>;
    const color = dossier.score >= 700 ? "text-green-400 bg-green-400/10 border-green-400/20" : dossier.score >= 400 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-red-400 bg-red-400/10 border-red-400/20";
    return <span className={`text-sm font-bold px-3 py-1 rounded-full border ${color}`}>{dossier.score}/1000</span>;
  };

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title={`Dossier ${dossier.reference}`} subtitle={`${dossier.client.prenom} ${dossier.client.nom} · Conseiller: ${dossier.conseiller}`}>
        <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
        <ScoreBadge />
        {dossier.score && (
          <button onClick={() => setLocation(`/score/${dossier.id}`)} className="flex items-center gap-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-lg transition-all">
            <Gauge className="w-4 h-4" /> Voir le score
          </button>
        )}
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Col 1 */}
          <div className="space-y-4">
            <InfoCard title="Profil client" icon={User}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">{dossier.client.prenom[0]}{dossier.client.nom[0]}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{dossier.client.prenom} {dossier.client.nom}</div>
                  <div className="text-xs text-muted-foreground">Né(e) le {new Date(dossier.client.dateNaissance).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
              <Row label="Situation familiale" value={dossier.client.situationFamiliale} />
              <Row label="Personnes à charge" value={dossier.client.personnesCharge} />
              <Row label="Adresse" value={`${dossier.client.adresse}, ${dossier.client.codePostal} ${dossier.client.ville}`} />
              <Row label="Téléphone" value={dossier.client.telephone} />
              <Row label="Email" value={dossier.client.email} />
            </InfoCard>

            <InfoCard title="Situation professionnelle" icon={Shield}>
              <Row label="Statut" value={dossier.situationPro.statut} />
              <Row label="Employeur" value={dossier.situationPro.employeur} />
              <Row label="Poste" value={dossier.situationPro.poste} />
              <Row label="Secteur" value={dossier.situationPro.secteur} />
              <Row label="Ancienneté" value={`${dossier.situationPro.anciennete} ans`} />
            </InfoCard>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <InfoCard title="Revenus & charges" icon={TrendingUp}>
              <Row label="Revenus nets" value={fmt(dossier.finances.revenusNets) + "/mois"} color="text-green-400" />
              <Row label="Autres revenus" value={fmt(dossier.finances.autresRevenus) + "/mois"} />
              <Row label="Charges fixes" value={fmt(dossier.finances.chargesFixes) + "/mois"} color="text-red-400" />
              <Row label="Crédits en cours" value={fmt(dossier.finances.creditsEnCours) + "/mois"} color="text-red-400" />
            </InfoCard>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Taux d'endettement", value: `${dossier.tauxEndettement}%`, note: dossier.tauxEndettement > 35 ? "Au-dessus du seuil" : "Conforme", color: dossier.tauxEndettement > 35 ? "text-red-400" : "text-green-400" },
                { label: "Capacité d'emprunt", value: fmt(dossier.capaciteEmprunt) + "/mois", note: "Mensualité max", color: "text-primary" },
                { label: "Reste à vivre", value: fmt(dossier.resteAVivre) + "/mois", note: "Après toutes charges", color: "text-blue-400" },
                { label: "Incidents (24 mois)", value: String(dossier.incidents), note: dossier.incidents > 0 ? "Attention requise" : "Aucun incident", color: dossier.incidents > 0 ? "text-yellow-400" : "text-green-400" },
              ].map(({ label, value, note, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className={`text-lg font-bold ${color}`}>{value}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{note}</div>
                </div>
              ))}
            </div>

            <InfoCard title="Demande de crédit" icon={FileText}>
              <Row label="Montant demandé" value={fmt(dossier.demande.montant)} color="text-primary" />
              <Row label="Durée" value={`${dossier.demande.duree} mois (${(dossier.demande.duree / 12).toFixed(0)} ans)`} />
              <Row label="Objet" value={dossier.demande.objet} />
              <Row label="Apport personnel" value={fmt(dossier.demande.apport)} />
              <Row label="Valeur de l'actif" value={fmt(dossier.demande.valeurActif)} />
              <Row label="Garant" value={dossier.demande.garant ? "Oui" : "Non"} />
            </InfoCard>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <InfoCard title="Contrôles réglementaires" icon={Shield}>
              <div className="flex flex-wrap gap-2">
                <BoolBadge ok={dossier.ficp} label="FICP" />
                <BoolBadge ok={dossier.fcc} label="FCC" />
                <BoolBadge ok={dossier.ppe} label="PPE" />
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${dossier.lcbft ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                  <CheckCircle className="w-3 h-3" />
                  LCB-FT: {dossier.lcbft ? "Conforme" : "Alerte"}
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Documents justificatifs" icon={FileText}>
              <div className="space-y-2">
                {dossier.documents.map((doc, i) => {
                  const { text, bg, icon: Icon } = docColors[doc.statut];
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-foreground truncate flex-1 mr-2">{doc.nom}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${bg} ${text}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {docLabels[doc.statut]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </InfoCard>

            <InfoCard title="Historique du dossier" icon={Clock}>
              <div className="space-y-3">
                {dossier.historique.map((ev, i) => (
                  <div key={i} className="relative pl-4">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary/40 border border-primary/60" />
                    {i < dossier.historique.length - 1 && <div className="absolute left-[3px] top-3 bottom-0 w-0.5 bg-border" />}
                    <div className="text-[10px] text-muted-foreground mb-0.5">{ev.date} · {ev.utilisateur}</div>
                    <div className="text-xs text-foreground">{ev.action}</div>
                    <div className="text-[10px] text-primary/80">{ev.statut}</div>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
