import Layout, { PageHeader } from "@/components/Layout";

import { Eye, Shield, MessageSquare, FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type EventType = "ouverture" | "score" | "alerte" | "commentaire" | "decision" | "documents";

const eventConf: Record<EventType, { icon: typeof Eye; cls: string; label: string }> = {
  ouverture: { icon: Eye, cls: "bg-blue-50 border-blue-200 text-blue-600", label: "Ouverture dossier" },
  score: { icon: Shield, cls: "bg-purple-50 border-purple-200 text-purple-600", label: "Score consulté" },
  alerte: { icon: AlertTriangle, cls: "bg-red-50 border-red-200 text-red-600", label: "Alerte consultée" },
  commentaire: { icon: MessageSquare, cls: "bg-gray-50 border-gray-200 text-gray-600", label: "Commentaire" },
  decision: { icon: CheckCircle, cls: "bg-emerald-50 border-emerald-200 text-emerald-600", label: "Décision" },
  documents: { icon: FileText, cls: "bg-amber-50 border-amber-200 text-amber-600", label: "Documents" },
};

const events = [
  { type: "decision" as EventType, dossier: "DOS-2024-0147", client: "Martin Dupont", action: "Décision émise : Accord sous conditions", detail: "Taux endettement > 35% — conditions : apport supplémentaire requis", date: "2024-01-18 11:15" },
  { type: "score" as EventType, dossier: "DOS-2024-0155", client: "Isabelle Renaud", action: "Score de solvabilité consulté : 678/1000", detail: "Analyse risque modéré — statut PPE actif", date: "2024-01-18 10:00" },
  { type: "alerte" as EventType, dossier: "DOS-2024-0155", client: "Isabelle Renaud", action: "Alerte PPE consultée", detail: "Vérification LCB-FT renforcée effectuée — conforme sous réserve", date: "2024-01-18 09:45" },
  { type: "ouverture" as EventType, dossier: "DOS-2024-0155", client: "Isabelle Renaud", action: "Ouverture du dossier en session d'analyse", detail: "Début de l'analyse risque par Pierre Durand", date: "2024-01-18 09:30" },
  { type: "ouverture" as EventType, dossier: "DOS-2024-0147", client: "Martin Dupont", action: "Ouverture du dossier en session d'analyse", detail: "Dossier transmis par conseiller Sophie Martin", date: "2024-01-18 09:00" },
  { type: "documents" as EventType, dossier: "DOS-2024-0155", client: "Isabelle Renaud", action: "Demande de documents complémentaires", detail: "Relevés de compte 6 mois demandés — délai 7 jours", date: "2024-01-17 15:00" },
  { type: "commentaire" as EventType, dossier: "DOS-2024-0147", client: "Martin Dupont", action: "Commentaire d'analyse ajouté", detail: "Stabilité professionnelle excellente. Taux endettement limite. Accord sous conditions recommandé.", date: "2024-01-17 14:30" },
  { type: "score" as EventType, dossier: "DOS-2024-0147", client: "Martin Dupont", action: "Score de solvabilité consulté : 742/1000", detail: "Risque modéré-faible — analyse approfondie recommandée", date: "2024-01-17 11:00" },
  { type: "decision" as EventType, dossier: "DOS-2024-0143", client: "Émilie Laurent", action: "Décision émise : Accord", detail: "Score 831/1000 — toutes conditions réunies — accord plein", date: "2024-01-13 14:00" },
  { type: "score" as EventType, dossier: "DOS-2024-0143", client: "Émilie Laurent", action: "Score de solvabilité consulté : 831/1000", detail: "Risque faible — profil excellent", date: "2024-01-12 11:00" },
  { type: "decision" as EventType, dossier: "DOS-2024-0138", client: "Jean-Claude Petit", action: "Décision émise : Refus", detail: "Score 312/1000, FICP inscrit, taux endettement 61.2%", date: "2024-01-08 14:30" },
  { type: "alerte" as EventType, dossier: "DOS-2024-0138", client: "Jean-Claude Petit", action: "Alerte FICP consultée", detail: "Client inscrit FICP — défauts de paiement caractérisés", date: "2024-01-07 10:00" },
];

const byDate = events.reduce((acc, ev) => {
  const day = ev.date.split(" ")[0];
  if (!acc[day]) acc[day] = [];
  acc[day].push(ev);
  return acc;
}, {} as Record<string, typeof events>);

export default function HistoriqueAnalyse({ role, userName, userInitials, onLogout }: Props) {
  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Historique d'analyse" subtitle="Chronologie des activités d'analyse risque · Pierre Durand" />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {Object.entries(eventConf).map(([key, conf]) => {
            const count = events.filter(e => e.type === key as EventType).length;
            const Icon = conf.icon;
            return (
              <div key={key} className={`rounded-xl border p-3 text-center ${conf.cls}`}>
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-bold">{count}</div>
                <div className="text-[10px] font-medium">{conf.label}</div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, evs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold" style={{ color: txt }}>
                  {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs" style={{ color: sub }}>{evs.length} action(s)</span>
              </div>

              <div className="space-y-2 ml-7 relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100" style={{ left: "-16px" }} />
                {evs.map((ev, i) => {
                  const conf = eventConf[ev.type];
                  const Icon = conf.icon;
                  return (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 hover:border-amber-200 hover:bg-amber-50/20 transition-all relative">
                      <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-white" style={{ left: "-22px", top: "18px", background: "hsl(43 57% 54%)" }} />
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${conf.cls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold" style={{ color: txt }}>{ev.action}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: sub }}>
                              <span className="font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{ev.dossier}</span>
                              <span>·</span>
                              <span>{ev.client}</span>
                            </div>
                            <div className="text-xs mt-1.5 leading-relaxed" style={{ color: sub }}>{ev.detail}</div>
                          </div>
                          <span className="text-[11px] flex-shrink-0 font-mono" style={{ color: sub }}>{ev.date.split(" ")[1]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
