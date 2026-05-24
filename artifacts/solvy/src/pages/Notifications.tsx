import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useNotifications, useMarquerLue, useMarquerToutesLues } from "@/hooks/useApi";
import { CheckCircle, AlertTriangle, FileText, Bell, Shield, ChevronRight, Check, Loader2 } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; userEmail?: string; onLogout: () => void; }
import { useState } from "react";

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type NotifType = "document_recu" | "score_calcule" | "decision" | "dossier_incomplet" | "demande_doc" | "alerte_conformite";

const typeConf: Record<string, { icon: typeof Bell; cls: string; badge: string }> = {
  document_recu: { icon: FileText, cls: "bg-emerald-50 border-emerald-200 text-emerald-600", badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  score_calcule: { icon: Shield, cls: "bg-purple-50 border-purple-200 text-purple-600", badge: "bg-purple-50 border-purple-200 text-purple-700" },
  decision: { icon: CheckCircle, cls: "bg-amber-50 border-amber-200 text-amber-600", badge: "bg-amber-50 border-amber-200 text-amber-700" },
  dossier_incomplet: { icon: AlertTriangle, cls: "bg-orange-50 border-orange-200 text-orange-600", badge: "bg-orange-50 border-orange-200 text-orange-700" },
  demande_doc: { icon: FileText, cls: "bg-blue-50 border-blue-200 text-blue-600", badge: "bg-blue-50 border-blue-200 text-blue-700" },
  alerte_conformite: { icon: Shield, cls: "bg-red-50 border-red-200 text-red-600", badge: "bg-red-50 border-red-200 text-red-700" },
};

const typeLabels: Record<string, string> = {
  document_recu: "Document reçu",
  score_calcule: "Score calculé",
  decision: "Décision analyste",
  dossier_incomplet: "Dossier incomplet",
  demande_doc: "Documents demandés",
  alerte_conformite: "Alerte conformité",
};

export default function Notifications({ role, userName, userInitials, userEmail, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<string>("all");
  const [showLues, setShowLues] = useState(true);

  const { data: notifs = [], isLoading } = useNotifications(userEmail);
  const marquerLue = useMarquerLue();
  const marquerToutesLues = useMarquerToutesLues();

  const nonLues = notifs.filter((n: any) => !n.lue).length;
  const filtered = notifs.filter((n: any) => {
    if (!showLues && n.lue) return false;
    return filter === "all" || n.type === filter;
  });

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Notifications" subtitle={`${nonLues} notification(s) non lue(s)`}>
        {nonLues > 0 && (
          <button onClick={() => marquerToutesLues.mutate(undefined)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            <Check className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          {([["all", "Toutes"], ...Object.entries(typeLabels)] as [string, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
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

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        )}

        <div className="space-y-3">
          {!isLoading && filtered.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm" style={{ color: sub }}>Aucune notification</p>
            </div>
          )}
          {filtered.map((n: any) => {
            const conf = typeConf[n.type] || typeConf.decision;
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
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${conf.badge}`}>{typeLabels[n.type] || n.type}</span>
                          <span className="text-xs font-mono" style={{ color: "hsl(43 57% 38%)" }}>{n.dossierRef}</span>
                        </div>
                      </div>
                      <span className="text-[11px] flex-shrink-0" style={{ color: sub }}>{n.date}</span>
                    </div>
                    <p className="text-xs leading-relaxed mt-2" style={{ color: sub }}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => { marquerLue.mutate(n.id); if (n.dossierId) setLocation(`/dossier/${n.dossierId}`); }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                        Ouvrir le dossier <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {!n.lue && (
                        <button onClick={() => marquerLue.mutate(n.id)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
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
