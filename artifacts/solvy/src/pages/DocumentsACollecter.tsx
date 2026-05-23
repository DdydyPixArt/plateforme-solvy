import { useState } from "react";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers } from "@/data/mockData";
import { useDossiers } from "@/hooks/useApi";
import { CheckCircle, XCircle, AlertTriangle, Upload, MessageSquare, Search, CheckCheck } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type DocStatut = "manquant" | "a_verifier" | "fourni";

interface DocRow {
  docNom: string;
  clientNom: string;
  dossierId: string;
  dossierRef: string;
  statut: DocStatut;
  priorite: "urgent" | "normal" | "faible";
  dateLimite: string;
}

const prioriteConf = {
  urgent: { label: "Urgent", cls: "text-red-700 bg-red-50 border-red-200" },
  normal: { label: "Normal", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  faible: { label: "Faible", cls: "text-gray-600 bg-gray-50 border-gray-200" },
};

const statutConf: Record<DocStatut, { label: string; cls: string; icon: typeof CheckCircle }> = {
  manquant: { label: "Manquant", cls: "text-red-700 bg-red-50 border-red-200", icon: XCircle },
  a_verifier: { label: "À vérifier", cls: "text-amber-700 bg-amber-50 border-amber-200", icon: AlertTriangle },
  fourni: { label: "Fourni", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle },
};

function buildRows(): DocRow[] {
  const rows: DocRow[] = [];
  const priorities: Array<"urgent" | "normal" | "faible"> = ["urgent", "normal", "normal", "faible", "normal", "urgent", "normal", "faible"];
  const dates = ["2024-01-25", "2024-01-28", "2024-01-30", "2024-02-05", "2024-01-26", "2024-01-22", "2024-02-01", "2024-01-29"];
  mockDossiers.forEach(d => {
    d.documents.forEach((doc, i) => {
      if (doc.statut !== "fourni") {
        rows.push({
          docNom: doc.nom,
          clientNom: `${d.client.prenom} ${d.client.nom}`,
          dossierId: d.id,
          dossierRef: d.reference,
          statut: doc.statut as DocStatut,
          priorite: priorities[i % priorities.length],
          dateLimite: dates[i % dates.length],
        });
      }
    });
  });
  return rows;
}

export default function DocumentsACollecter({ role, userName, userInitials, onLogout }: Props) {
  const { data: liveDossiers = mockDossiers } = useDossiers();
  const [rows, setRows] = useState<DocRow[]>(() => buildRows());
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("all");
  const [prioriteFilter, setPrioriteFilter] = useState("all");
  const [commentIdx, setCommentIdx] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});

  const filtered = rows.filter(r => {
    const t = `${r.docNom} ${r.clientNom} ${r.dossierRef}`.toLowerCase();
    return t.includes(search.toLowerCase())
      && (statutFilter === "all" || r.statut === statutFilter)
      && (prioriteFilter === "all" || r.priorite === prioriteFilter);
  });

  const markReceived = (globalIdx: number) => {
    setRows(rs => rs.map((r, i) => i === globalIdx ? { ...r, statut: "fourni" } : r));
  };

  const globalIdx = (r: DocRow) => rows.indexOf(r);

  const manquants = rows.filter(r => r.statut === "manquant").length;
  const aVerifier = rows.filter(r => r.statut === "a_verifier").length;
  const urgents = rows.filter(r => r.priorite === "urgent" && r.statut !== "fourni").length;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Documents à collecter" subtitle="Vue globale des documents manquants ou à vérifier">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
          {urgents} document(s) urgent(s)
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-red-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-red-600">{manquants}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Documents manquants</div>
          </div>
          <div className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-amber-600">{aVerifier}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>À vérifier</div>
          </div>
          <div className="bg-white border border-orange-100 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-orange-600">{urgents}</div>
            <div className="text-xs mt-0.5" style={{ color: sub }}>Urgents</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Document, client, dossier..."
              className="bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-300 w-56" style={{ color: txt }} />
          </div>
          <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ color: txt }}>
            <option value="all">Tous statuts</option>
            <option value="manquant">Manquant</option>
            <option value="a_verifier">À vérifier</option>
            <option value="fourni">Fourni</option>
          </select>
          <select value={prioriteFilter} onChange={e => setPrioriteFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ color: txt }}>
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
            <option value="faible">Faible</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                {["Document attendu", "Client concerné", "Dossier", "Priorité", "Date limite", "Statut", "Actions"].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm" style={{ color: sub }}>Aucun document manquant — tout est à jour !</td></tr>
              )}
              {filtered.map((r) => {
                const gi = globalIdx(r);
                const sc = statutConf[r.statut];
                const Icon = sc.icon;
                const pc = prioriteConf[r.priorite];
                const isExpired = new Date(r.dateLimite) < new Date();
                return (
                  <>
                    <tr key={gi} className="border-b border-gray-50 hover:bg-amber-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${r.statut === "manquant" ? "text-red-500" : r.statut === "a_verifier" ? "text-amber-500" : "text-emerald-500"}`} />
                          <span className="text-sm font-medium" style={{ color: txt }}>{r.docNom}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-sm" style={{ color: txt }}>{r.clientNom}</span></td>
                      <td className="px-5 py-3.5"><span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{r.dossierRef}</span></td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${pc.cls}`}>{pc.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-mono ${isExpired ? "text-red-600 font-semibold" : ""}`} style={!isExpired ? { color: sub } : {}}>
                          {new Date(r.dateLimite).toLocaleDateString("fr-FR")}
                          {isExpired && " ⚠"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border w-fit ${sc.cls}`}>
                          <Icon className="w-3 h-3" />{sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {r.statut !== "fourni" && (
                            <button onClick={() => markReceived(gi)}
                              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                              <CheckCheck className="w-3 h-3" /> Reçu
                            </button>
                          )}
                          <button className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Uploader
                          </button>
                          <button onClick={() => setCommentIdx(commentIdx === gi ? null : gi)}
                            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${commentIdx === gi ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                            <MessageSquare className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {commentIdx === gi && (
                      <tr key={`comment-${gi}`} className="border-b border-gray-50 bg-blue-50/30">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: sub }}>Note :</span>
                            <input value={comments[gi] || ""} onChange={e => setComments(c => ({ ...c, [gi]: e.target.value }))}
                              placeholder="Ajouter un commentaire sur ce document..."
                              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-300" style={{ color: txt }} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
