import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useDossiers, useUpdateDocuments } from "@/hooks/useApi";
import { CheckCircle, XCircle, AlertTriangle, Upload, MessageSquare, ArrowLeft, CheckCheck, RotateCcw, Loader2 } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; userEmail?: string; onLogout: () => void; }

type DocStatut = "fourni" | "manquant" | "a_verifier";

const docColors: Record<DocStatut, { text: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  fourni: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
  manquant: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  a_verifier: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
};
const docLabels: Record<DocStatut, string> = { fourni: "Fourni", manquant: "Manquant", a_verifier: "À vérifier" };

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

export default function DossiersIncomplets({ role, userName, userInitials, userEmail, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const { data: allDossiers = [], isLoading } = useDossiers(
    role === "conseiller" && userEmail
      ? { status: "incomplet", conseiller: userEmail }
      : { status: "incomplet" }
  );
  const updateDocuments = useUpdateDocuments();

  const incomplets = allDossiers;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [docStatutsMap, setDocStatutsMap] = useState<Record<string, DocStatut[]>>({});
  const [commentaires, setCommentaires] = useState<string[]>([]);
  const [showComment, setShowComment] = useState<boolean[]>([]);
  const [saved, setSaved] = useState(false);

  const selected = incomplets.find(d => d.id === selectedId) || incomplets[0] || null;
  const docStatuts: DocStatut[] = selected
    ? (docStatutsMap[selected.id] || selected.documents.map((d: any) => d.statut))
    : [];

  const fournis = docStatuts.filter(s => s === "fourni").length;
  const totalDocs = docStatuts.length;
  const completionPct = totalDocs > 0 ? Math.round((fournis / totalDocs) * 100) : 0;

  const selectDossier = (d: any) => {
    setSelectedId(d.id);
    if (!docStatutsMap[d.id]) {
      setDocStatutsMap(m => ({ ...m, [d.id]: d.documents.map((doc: any) => doc.statut) }));
    }
    setCommentaires(d.documents.map(() => ""));
    setShowComment(d.documents.map(() => false));
  };

  const markReceived = (idx: number) => {
    if (!selected) return;
    const next = [...docStatuts];
    next[idx] = "fourni";
    setDocStatutsMap(m => ({ ...m, [selected.id]: next }));
  };

  const resetDoc = (idx: number) => {
    if (!selected) return;
    const next = [...docStatuts];
    next[idx] = "a_verifier";
    setDocStatutsMap(m => ({ ...m, [selected.id]: next }));
  };

  const toggleComment = (idx: number) => {
    setShowComment(prev => { const n = [...prev]; n[idx] = !n[idx]; return n; });
  };

  const setComment = (idx: number, val: string) => {
    setCommentaires(prev => { const n = [...prev]; n[idx] = val; return n; });
  };

  const handleSave = async () => {
    if (!selected) return;
    const updatedDocs = selected.documents.map((doc: any, i: number) => ({
      ...doc,
      statut: docStatuts[i] || doc.statut,
    }));
    try {
      await updateDocuments.mutateAsync({ id: selected.id, documents: updatedDocs });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <PageHeader title="Dossiers incomplets" subtitle="Documents à collecter auprès des clients" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </Layout>
    );
  }

  if (incomplets.length === 0) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <PageHeader title="Dossiers incomplets" subtitle="Documents à collecter auprès des clients" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CheckCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold" style={{ color: txt }}>Aucun dossier incomplet</h2>
            <p className="text-sm mt-1" style={{ color: sub }}>Tous les dossiers sont complets.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Dossiers incomplets" subtitle="Complétez les dossiers en collectant les documents manquants">
        <button onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: sub }}>
          <ArrowLeft className="w-4 h-4" /> Tableau de bord
        </button>
      </PageHeader>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
            <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: sub }}>{incomplets.length} dossier(s) incomplet(s)</div>
          </div>
          <div className="p-3 space-y-2">
            {incomplets.map(d => {
              const docs = d.documents || [];
              const statuts: DocStatut[] = docStatutsMap[d.id] || docs.map((doc: any) => doc.statut);
              const f = statuts.filter(s => s === "fourni").length;
              const pct = docs.length > 0 ? Math.round((f / docs.length) * 100) : 0;
              const isSelected = (selected?.id === d.id);
              return (
                <button key={d.id} onClick={() => selectDossier(d)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected ? "border-amber-300 bg-amber-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                  <div className="text-xs font-mono font-semibold mb-0.5" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</div>
                  <div className="text-sm font-semibold" style={{ color: txt }}>{d.client?.nom} {d.client?.prenom}</div>
                  <div className="text-xs mt-0.5 mb-3" style={{ color: sub }}>{d.situationPro?.statut} · {d.dateCreation}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: sub }}>Complétude</span>
                      <span className={`font-semibold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px]" style={{ color: sub }}>{f}/{docs.length} documents fournis</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{selected.reference}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-medium">Incomplet</span>
                  </div>
                  <h2 className="text-lg font-semibold" style={{ color: txt }}>{selected.client?.prenom} {selected.client?.nom}</h2>
                  <div className="text-sm mt-0.5" style={{ color: sub }}>
                    {selected.situationPro?.statut} · {selected.situationPro?.employeur} · Créé le {selected.dateCreation}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: completionPct >= 80 ? "hsl(145 60% 40%)" : completionPct >= 50 ? "hsl(43 57% 46%)" : "hsl(6 78% 54%)" }}>
                    {completionPct}%
                  </div>
                  <div className="text-xs" style={{ color: sub }}>Complétude</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: sub }}>{fournis}/{totalDocs} documents fournis</span>
                  <span style={{ color: sub }}>{totalDocs - fournis} manquant(s)</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${completionPct >= 80 ? "bg-emerald-500" : completionPct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${completionPct}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[10px]" style={{ color: sub }}>
                  <span className="text-red-500">{docStatuts.filter(s => s === "manquant").length} manquants</span>
                  <span className="text-amber-500">{docStatuts.filter(s => s === "a_verifier").length} à vérifier</span>
                  <span className="text-emerald-500">{fournis} fournis</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold px-1" style={{ color: txt }}>Documents justificatifs</h3>
              {(selected.documents || []).map((doc: any, i: number) => {
                const statut: DocStatut = docStatuts[i] || doc.statut;
                const cfg = docColors[statut];
                const Icon = cfg.icon;
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-5 h-5 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{ color: txt }}>{doc.nom}</div>
                        {doc.date && <div className="text-[11px] mt-0.5" style={{ color: sub }}>Reçu le {doc.date}</div>}
                        {!doc.date && statut === "manquant" && (
                          <div className="text-[11px] mt-0.5 text-red-500">Non reçu — à collecter</div>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        {docLabels[statut]}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {statut !== "fourni" && (
                          <button onClick={() => markReceived(i)}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                            <CheckCheck className="w-3.5 h-3.5" /> Marquer reçu
                          </button>
                        )}
                        {statut === "fourni" && (
                          <button onClick={() => resetDoc(i)}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                            <RotateCcw className="w-3 h-3" /> Réinitialiser
                          </button>
                        )}
                        <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Téléverser
                        </button>
                        <button onClick={() => toggleComment(i)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${showComment[i] ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                          <MessageSquare className="w-3.5 h-3.5" />
                          {commentaires[i] ? "Note" : "Commenter"}
                        </button>
                      </div>
                    </div>
                    {showComment[i] && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                        <textarea value={commentaires[i]} onChange={e => setComment(i, e.target.value)}
                          placeholder="Ajouter une note ou un commentaire sur ce document..." rows={2}
                          className="w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-300 resize-none border border-gray-200 bg-gray-50"
                          style={{ color: txt }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setLocation(`/dossier/${selected.id}`)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Voir la fiche complète
              </button>
              <button onClick={handleSave} disabled={updateDocuments.isPending}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-emerald-500 text-white" : "text-white hover:opacity-90"}`}
                style={saved ? {} : { background: "hsl(43 60% 46%)" }}>
                {updateDocuments.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle className="w-4 h-4" /> Sauvegardé</> : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
