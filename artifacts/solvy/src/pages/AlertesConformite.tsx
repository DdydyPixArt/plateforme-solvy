import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers } from "@/data/mockData";
import { useDossiers } from "@/hooks/useApi";
import { AlertTriangle, XCircle, Shield, Eye, CheckCircle, MessageSquare } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type Niveau = "critique" | "eleve" | "moyen" | "faible";

interface Alerte {
  id: string;
  dossierId: string;
  dossierRef: string;
  client: string;
  motif: string;
  type: string;
  niveau: Niveau;
  date: string;
  traitee: boolean;
  details: string;
}

const niveauConf: Record<Niveau, { label: string; cls: string; dot: string }> = {
  critique: { label: "Critique", cls: "text-red-800 bg-red-100 border-red-300", dot: "bg-red-600" },
  eleve: { label: "Élevé", cls: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500" },
  moyen: { label: "Moyen", cls: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  faible: { label: "Faible", cls: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-400" },
};

function buildAlertes(): Alerte[] {
  const list: Alerte[] = [];
  mockDossiers.forEach(d => {
    if (d.ficp) list.push({ id: `${d.id}-ficp`, dossierId: d.id, dossierRef: d.reference, client: `${d.client.prenom} ${d.client.nom}`, motif: "Inscription au FICP", type: "FICP", niveau: "critique", date: d.dateCreation, traitee: false, details: "Client inscrit au Fichier des Incidents de remboursement des Crédits aux Particuliers. Présence de défauts de paiement caractérisés." });
    if (d.fcc) list.push({ id: `${d.id}-fcc`, dossierId: d.id, dossierRef: d.reference, client: `${d.client.prenom} ${d.client.nom}`, motif: "Inscription au FCC", type: "FCC", niveau: "eleve", date: d.dateCreation, traitee: false, details: "Client inscrit au Fichier Central des Chèques. Incident de paiement par chèque détecté." });
    if (d.ppe) list.push({ id: `${d.id}-ppe`, dossierId: d.id, dossierRef: d.reference, client: `${d.client.prenom} ${d.client.nom}`, motif: "Statut PPE détecté", type: "PPE", niveau: "eleve", date: d.dateCreation, traitee: false, details: "Le client est identifié comme Personne Politiquement Exposée. Vérification LCB-FT renforcée obligatoire selon directive (UE) 2015/849." });
    if (d.tauxEndettement > 35) list.push({ id: `${d.id}-taux`, dossierId: d.id, dossierRef: d.reference, client: `${d.client.prenom} ${d.client.nom}`, motif: `Taux d'endettement ${d.tauxEndettement}% > 35%`, type: "Endettement", niveau: d.tauxEndettement > 50 ? "eleve" : "moyen", date: d.dateCreation, traitee: false, details: `Le taux d'endettement de ${d.tauxEndettement}% dépasse le seuil réglementaire de 35% fixé par le HCSF. Analyse approfondie requise.` });
    if (d.incidents > 3) list.push({ id: `${d.id}-inc`, dossierId: d.id, dossierRef: d.reference, client: `${d.client.prenom} ${d.client.nom}`, motif: `${d.incidents} incidents de paiement`, type: "Incidents", niveau: d.incidents > 5 ? "eleve" : "moyen", date: d.dateCreation, traitee: false, details: `${d.incidents} incidents de paiement constatés sur les 24 derniers mois. Risque de défaillance significatif.` });
    if (!d.lcbft) list.push({ id: `${d.id}-lcbft`, dossierId: d.id, dossierRef: d.reference, client: `${d.client.prenom} ${d.client.nom}`, motif: "Contrôle LCB-FT non effectué", type: "LCB-FT", niveau: "moyen", date: d.dateCreation, traitee: false, details: "Le contrôle anti-blanchiment et financement du terrorisme n'a pas été effectué ou est en attente de résultat." });
  });
  return list;
}

export default function AlertesConformite({ role, userName, userInitials, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const { data: liveDossiers = mockDossiers } = useDossiers();
  const [alertes, setAlertes] = useState<Alerte[]>(() => buildAlertes());
  const [niveauFilter, setNiveauFilter] = useState("all");
  const [showTraitees, setShowTraitees] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const liveAlertes = [...alertes, ...buildAlertes().filter(a => !alertes.find(e => e.id === a.id) && liveDossiers.find((d: any) => d.id === a.dossierId))];

  const markTraitee = (id: string) => setAlertes(as => as.map(a => a.id === id ? { ...a, traitee: true } : a));

  const filtered = alertes.filter(a =>
    (showTraitees ? true : !a.traitee) && (niveauFilter === "all" || a.niveau === niveauFilter)
  );

  const critiques = alertes.filter(a => a.niveau === "critique" && !a.traitee).length;
  const elevees = alertes.filter(a => a.niveau === "eleve" && !a.traitee).length;
  const moyennes = alertes.filter(a => a.niveau === "moyen" && !a.traitee).length;
  const traitees = alertes.filter(a => a.traitee).length;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Alertes conformité" subtitle="Surveillance réglementaire — FICP · FCC · PPE · LCB-FT · Endettement">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-3.5 h-3.5" />
          {critiques + elevees} alerte(s) non traitée(s)
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-red-700">{critiques}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Critiques</div>
          </div>
          <div className="bg-white border border-red-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-red-500">{elevees}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Élevées</div>
          </div>
          <div className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-amber-600">{moyennes}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Moyennes</div>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-emerald-600">{traitees}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Traitées</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select value={niveauFilter} onChange={e => setNiveauFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ color: txt }}>
            <option value="all">Tous niveaux</option>
            <option value="critique">Critique</option>
            <option value="eleve">Élevé</option>
            <option value="moyen">Moyen</option>
            <option value="faible">Faible</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" checked={showTraitees} onChange={e => setShowTraitees(e.target.checked)} className="rounded" />
            Afficher les alertes traitées
          </label>
          <span className="text-xs ml-auto" style={{ color: sub }}>{filtered.length} alerte(s)</span>
        </div>

        {/* Alerts list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-600">Aucune alerte active</p>
            </div>
          )}
          {filtered.map(a => {
            const nc = niveauConf[a.niveau];
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${a.traitee ? "opacity-60 border-gray-100" : "border-gray-200"}`}>
                <div className="flex items-start gap-4 p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${nc.cls}`}>
                    {a.traitee ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: txt }}>{a.motif}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nc.cls}`}>{nc.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">{a.type}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: sub }}>
                          <span className="font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{a.dossierRef}</span>
                          <span>·</span>
                          <span>{a.client}</span>
                          <span>·</span>
                          <span>{a.date}</span>
                        </div>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs leading-relaxed" style={{ color: sub }}>
                        {a.details}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => setLocation(`/dossier/${a.dossierId}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700">
                        <Eye className="w-3.5 h-3.5" /> Ouvrir dossier
                      </button>
                      <button onClick={() => setExpanded(isOpen ? null : a.id)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {isOpen ? "Réduire" : "Détails"}
                      </button>
                      {!a.traitee && (
                        <button onClick={() => markTraitee(a.id)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 ml-auto">
                          <CheckCircle className="w-3.5 h-3.5" /> Marquer traitée
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
