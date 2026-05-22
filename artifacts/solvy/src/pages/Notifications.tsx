import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { CheckCircle, AlertTriangle, FileText, Bell, Shield, ChevronRight, Check } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type NotifType = "document_recu" | "score_calcule" | "decision" | "dossier_incomplet" | "demande_doc" | "alerte_conformite";

interface Notif {
  id: string;
  type: NotifType;
  titre: string;
  message: string;
  dossier: string;
  dossierId: string;
  date: string;
  lue: boolean;
}

const typeConf: Record<NotifType, { icon: typeof Bell; cls: string; badge: string }> = {
  document_recu: { icon: FileText, cls: "bg-emerald-50 border-emerald-200 text-emerald-600", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  score_calcule: { icon: Shield, cls: "bg-purple-50 border-purple-200 text-purple-600", badge: "bg-purple-50 border-purple-200 text-purple-700" },
  decision: { icon: CheckCircle, cls: "bg-amber-50 border-amber-200 text-amber-600", badge: "bg-amber-50 border-amber-200 text-amber-700" },
  dossier_incomplet: { icon: AlertTriangle, cls: "bg-orange-50 border-orange-200 text-orange-600", badge: "bg-orange-50 border-orange-200 text-orange-700" },
  demande_doc: { icon: FileText, cls: "bg-blue-50 border-blue-200 text-blue-600", badge: "bg-blue-50 border-blue-200 text-blue-700" },
  alerte_conformite: { icon: Shield, cls: "bg-red-50 border-red-200 text-red-600", badge: "bg-red-50 border-red-200 text-red-700" },
};

const typeLabels: Record<NotifType, string> = {
  document_recu: "Document reçu",
  score_calcule: "Score calculé",
  decision: "Décision analyste",
  dossier_incomplet: "Dossier incomplet",
  demande_doc: "Documents demandés",
  alerte_conformite: "Alerte conformité",
};

const initialNotifs: Notif[] = [
  { id: "n1", type: "decision", titre: "Décision reçue — Accord sous conditions", message: "L'analyste Pierre Durand a émis une décision sur le dossier DOS-2024-0147. Accord sous conditions : apport supplémentaire de 10 000 € requis.", dossier: "DOS-2024-0147", dossierId: "d1", date: "2024-01-18 11:15", lue: false },
  { id: "n2", type: "score_calcule", titre: "Score de solvabilité calculé", message: "Le score de solvabilité pour le dossier DOS-2024-0147 (Martin Dupont) a été calculé automatiquement par le moteur SOLVY v2.3.1 : 742/1000.", dossier: "DOS-2024-0147", dossierId: "d1", date: "2024-01-17 10:05", lue: false },
  { id: "n3", type: "alerte_conformite", titre: "Alerte PPE détectée — DOS-2024-0155", message: "Un statut PPE (Personne Politiquement Exposée) a été détecté pour Isabelle Renaud. Une vérification LCB-FT renforcée est requise.", dossier: "DOS-2024-0155", dossierId: "d5", date: "2024-01-17 09:00", lue: false },
  { id: "n4", type: "dossier_incomplet", titre: "Dossier incomplet — Thomas Moreau", message: "Le dossier DOS-2024-0151 est incomplet. Documents manquants : justificatif de domicile, bulletins de paie, avis d'imposition, relevés de compte (4 documents).", dossier: "DOS-2024-0151", dossierId: "d3", date: "2024-01-18 14:00", lue: false },
  { id: "n5", type: "document_recu", titre: "Documents reçus — DOS-2024-0147", message: "Sophie Martin a ajouté 4 documents justificatifs au dossier de Martin Dupont : pièce d'identité, justificatif de domicile, 3 bulletins de paie, IBAN.", dossier: "DOS-2024-0147", dossierId: "d1", date: "2024-01-15 09:45", lue: true },
  { id: "n6", type: "demande_doc", titre: "Documents complémentaires demandés", message: "L'analyste Pierre Durand demande des relevés de compte bancaire supplémentaires (6 derniers mois) pour le dossier DOS-2024-0155 (Isabelle Renaud).", dossier: "DOS-2024-0155", dossierId: "d5", date: "2024-01-18 09:30", lue: true },
  { id: "n7", type: "decision", titre: "Décision : Accord — DOS-2024-0143", message: "Accord de crédit émis par Pierre Durand pour Émilie Laurent. Score 831/1000 — toutes conditions réunies.", dossier: "DOS-2024-0143", dossierId: "d2", date: "2024-01-13 14:00", lue: true },
  { id: "n8", type: "decision", titre: "Décision : Refus — DOS-2024-0138", message: "Refus de crédit émis par Pierre Durand pour Jean-Claude Petit. Score 312/1000, FICP inscrit, taux d'endettement 61.2%.", dossier: "DOS-2024-0138", dossierId: "d4", date: "2024-01-08 14:30", lue: true },
];

export default function Notifications({ role, userName, userInitials, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const [showLues, setShowLues] = useState(true);

  const markRead = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, lue: true } : n));
  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, lue: true })));

  const nonLues = notifs.filter(n => !n.lue).length;
  const filtered = notifs.filter(n => {
    if (!showLues && n.lue) return false;
    return filter === "all" || n.type === filter;
  });

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Notifications" subtitle={`${nonLues} notification(s) non lue(s)`}>
        {nonLues > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            <Check className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {([["all", "Toutes"], ...Object.entries(typeLabels)] as [string, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k as any)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === k ? "text-white border-transparent" : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"}`}
              style={filter === k ? { background: "hsl(43 60% 46%)" } : {}}>
              {l}
            </button>
          ))}
          <label className="flex items-center gap-2 text-xs text-gray-500 ml-auto cursor-pointer">
            <input type="checkbox" checked={showLues} onChange={e => setShowLues(e.target.checked)} className="rounded" />
            Afficher les lues
          </label>
        </div>

        {/* Notifications list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm" style={{ color: sub }}>Aucune notification</p>
            </div>
          )}
          {filtered.map(n => {
            const conf = typeConf[n.type];
            const Icon = conf.icon;
            return (
              <div key={n.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${n.lue ? "border-gray-200" : "border-amber-200 shadow-amber-50"}`}>
                <div className="flex items-start gap-4 p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${conf.cls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: txt }}>{n.titre}</span>
                          {!n.lue && <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${conf.badge}`}>{typeLabels[n.type]}</span>
                          <span className="text-xs font-mono" style={{ color: "hsl(43 57% 38%)" }}>{n.dossier}</span>
                        </div>
                      </div>
                      <span className="text-[11px] flex-shrink-0" style={{ color: sub }}>{n.date}</span>
                    </div>
                    <p className="text-xs leading-relaxed mt-2" style={{ color: sub }}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => { markRead(n.id); setLocation(`/dossier/${n.dossierId}`); }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                        Ouvrir le dossier <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {!n.lue && (
                        <button onClick={() => markRead(n.id)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          Marquer comme lu
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
