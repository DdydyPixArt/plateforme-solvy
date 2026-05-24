import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useDossiers, useUpdateDocuments } from "@/hooks/useApi";
import { CheckCircle, XCircle, AlertTriangle, Eye, Upload, Search, Loader2, FileText } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; userEmail?: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type DocStatut = "fourni" | "manquant" | "a_verifier";

const docColors: Record<DocStatut, string> = {
  fourni: "text-emerald-700 bg-emerald-50 border-emerald-200",
  manquant: "text-red-700 bg-red-50 border-red-200",
  a_verifier: "text-amber-700 bg-amber-50 border-amber-200",
};
const docLabels: Record<DocStatut, string> = { fourni: "Fourni", manquant: "Manquant", a_verifier: "À vérifier" };
const docIcons: Record<DocStatut, typeof CheckCircle> = {
  fourni: CheckCircle, manquant: XCircle, a_verifier: AlertTriangle,
};

const docStatuts: DocStatut[] = ["manquant", "a_verifier", "fourni"];

export default function DocumentsACollecter({ role, userName, userInitials, userEmail, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | "manquants" | "a_verifier">("manquants");
  const [uploadModalId, setUploadModalId] = useState<string | null>(null);
  const [uploadDocIdx, setUploadDocIdx] = useState<number | null>(null);
  const [localDocs, setLocalDocs] = useState<Record<string, any[]>>({});

  const updateDocuments = useUpdateDocuments();

  const params = role === "conseiller" && userEmail
    ? { conseiller: userEmail }
    : undefined;

  const { data: dossiers = [], isLoading } = useDossiers(params);

  const withDocs = dossiers.filter(d => {
    const docs: any[] = localDocs[d.id] ?? d.documents ?? [];
    const hasIncomplete = docs.some((doc: any) => doc.statut !== "fourni");
    if (!hasIncomplete) return false;

    const matchSearch = !search ||
      `${d.reference} ${d.client?.prenom} ${d.client?.nom} ${d.conseiller}`.toLowerCase()
        .includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (filtre === "manquants") return docs.some((doc: any) => doc.statut === "manquant");
    if (filtre === "a_verifier") return docs.some((doc: any) => doc.statut === "a_verifier");
    return true;
  });

  const getDocs = (d: any): any[] => localDocs[d.id] ?? d.documents ?? [];

  const cycleDocStatus = (dossierId: string, allDocs: any[], idx: number) => {
    const updated = allDocs.map((doc: any, i: number) => {
      if (i !== idx) return doc;
      const nextIdx = (docStatuts.indexOf(doc.statut as DocStatut) + 1) % docStatuts.length;
      return { ...doc, statut: docStatuts[nextIdx] };
    });
    setLocalDocs(m => ({ ...m, [dossierId]: updated }));
  };

  const handleFileUpload = (dossierId: string, allDocs: any[], docIdx: number, file: File) => {
    const updated = allDocs.map((doc: any, i: number) => {
      if (i !== docIdx) return doc;
      return {
        ...doc,
        statut: "fourni",
        fichierNom: file.name,
        dateTeleversement: new Date().toLocaleDateString("fr-FR"),
        taille: `${(file.size / 1024).toFixed(0)} Ko`,
      };
    });
    setLocalDocs(m => ({ ...m, [dossierId]: updated }));
    setUploadModalId(null);
    setUploadDocIdx(null);
  };

  const saveDocuments = async (dossierId: string) => {
    const docs = localDocs[dossierId];
    if (!docs) return;
    await updateDocuments.mutateAsync({ id: dossierId, documents: docs });
    setLocalDocs(m => { const n = { ...m }; delete n[dossierId]; return n; });
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const totalManquants = dossiers.reduce((s, d) => s + getDocs(d).filter((doc: any) => doc.statut === "manquant").length, 0);
  const totalAVerifier = dossiers.reduce((s, d) => s + getDocs(d).filter((doc: any) => doc.statut === "a_verifier").length, 0);

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Documents à collecter" subtitle="Vue par dossier — complétude et téléversement des justificatifs">
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <XCircle className="w-3.5 h-3.5" /> {totalManquants} manquants
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5" /> {totalAVerifier} à vérifier
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: sub }} />
            <input
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-300"
              placeholder="Rechercher un dossier ou client…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ color: txt }}
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {([
              { id: "tous", label: "Tous incomplets" },
              { id: "manquants", label: "Manquants" },
              { id: "a_verifier", label: "À vérifier" },
            ] as const).map(opt => (
              <button key={opt.id} onClick={() => setFiltre(opt.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filtre === opt.id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                style={filtre === opt.id ? { background: "hsl(43 60% 46%)" } : {}}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dossier cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : withDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-base mb-1" style={{ color: txt }}>Tout est complet</h3>
            <p className="text-sm" style={{ color: sub }}>Aucun document manquant pour les critères sélectionnés.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: sub }}>{withDocs.length} dossier(s) avec documents incomplets</p>
            {withDocs.map(d => {
              const docs: any[] = getDocs(d);
              const fournis = docs.filter((doc: any) => doc.statut === "fourni").length;
              const manquants = docs.filter((doc: any) => doc.statut === "manquant").length;
              const aVerifier = docs.filter((doc: any) => doc.statut === "a_verifier").length;
              const pct = docs.length > 0 ? Math.round((fournis / docs.length) * 100) : 0;
              const hasLocalChanges = !!localDocs[d.id];

              return (
                <div key={d.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "hsl(43 57% 54% / 0.12)", border: "1px solid hsl(43 57% 54% / 0.3)" }}>
                        <FileText className="w-5 h-5" style={{ color: "hsl(43 57% 42%)" }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{d.reference}</span>
                          <span className="text-sm font-semibold" style={{ color: txt }}>{d.client?.prenom} {d.client?.nom}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: sub }}>
                          Conseiller: {d.conseiller}
                          {(d.demande as any)?.montant ? ` · ${fmt((d.demande as any).montant)}` : ""}
                          {(d.demande as any)?.objet ? ` — ${(d.demande as any).objet}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Completion ring */}
                      <div className="text-right">
                        <div className={`text-base font-bold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{pct}%</div>
                        <div className="text-[10px]" style={{ color: sub }}>complété</div>
                      </div>
                      {hasLocalChanges && (
                        <button onClick={() => saveDocuments(d.id)}
                          disabled={updateDocuments.isPending}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-60"
                          style={{ background: "hsl(43 60% 46%)" }}>
                          {updateDocuments.isPending ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Sauvegarder"}
                        </button>
                      )}
                      <button onClick={() => setLocation(`/dossier/${d.id}`)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100">
                    <div className="h-full rounded-r-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? "hsl(142 71% 45%)" : pct >= 50 ? "hsl(43 96% 52%)" : "hsl(0 84% 60%)",
                      }} />
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs">
                    <span className="text-emerald-600 font-semibold">{fournis} fournis</span>
                    <span className="text-red-600 font-semibold">{manquants} manquants</span>
                    <span className="text-amber-600 font-semibold">{aVerifier} à vérifier</span>
                    <span style={{ color: sub }}>{docs.length} total</span>
                  </div>

                  {/* Document list — only non-fourni docs */}
                  <div className="divide-y divide-gray-50">
                    {docs.map((doc: any, idx: number) => {
                      if (doc.statut === "fourni") return null;
                      const DocIcon = docIcons[doc.statut as DocStatut] || AlertTriangle;
                      return (
                        <div key={idx} className="flex items-center gap-3 px-5 py-3">
                          <DocIcon className={`w-4 h-4 flex-shrink-0 ${doc.statut === "manquant" ? "text-red-500" : "text-amber-500"}`} />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm" style={{ color: txt }}>{doc.nom}</span>
                            {doc.fichierNom && (
                              <div className="text-[10px] text-emerald-600 mt-0.5">📎 {doc.fichierNom} · {doc.dateTeleversement}</div>
                            )}
                          </div>
                          <button onClick={() => cycleDocStatus(d.id, docs, idx)}
                            className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition-all flex-shrink-0 ${docColors[doc.statut as DocStatut]}`}>
                            {docLabels[doc.statut as DocStatut]}
                          </button>
                          <label className="flex-shrink-0 cursor-pointer">
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                              onChange={e => { if (e.target.files?.[0]) handleFileUpload(d.id, docs, idx, e.target.files[0]); }} />
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                              <Upload className="w-3 h-3" /> PDF
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
