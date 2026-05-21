import { useState } from "react";
import Layout, { PageHeader } from "@/components/Layout";
import { mockAuditEntries } from "@/data/mockData";
import { CheckCircle, AlertTriangle, XCircle, Info, Download, Shield, Search } from "lucide-react";

interface AuditProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

const statusConfig = {
  success: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Succès" },
  warning: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", label: "Alerte" },
  error: { icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Erreur" },
  info: { icon: Info, color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Info" },
};

export default function Audit({ role, userName, userInitials, onLogout }: AuditProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dossierFilter, setDossierFilter] = useState("all");

  const dossierRefs = Array.from(new Set(mockAuditEntries.map(e => e.dossierRef)));

  const filtered = mockAuditEntries.filter(e => {
    const txt2 = `${e.utilisateur} ${e.action} ${e.details} ${e.dossierRef}`.toLowerCase();
    return txt2.includes(search.toLowerCase())
      && (statusFilter === "all" || e.statut === statusFilter)
      && (dossierFilter === "all" || e.dossierRef === dossierFilter);
  });

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Audit & Traçabilité" subtitle="Journal des actions — Conformité RGPD · Explicabilité · Archivage">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Shield className="w-3.5 h-3.5" /> Conformité RGPD active
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all">
          <Download className="w-4 h-4" /> Exporter
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([key, { color, bg, icon: Icon, label }]) => (
            <div key={key} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className={`text-xl font-bold ${color}`}>{mockAuditEntries.filter(e => e.statut === key).length}</div>
                <div className="text-xs" style={{ color: sub }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans les logs..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-300" style={{ color: txt }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300" style={{ color: txt }}>
            <option value="all">Tous les statuts</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={dossierFilter} onChange={e => setDossierFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300" style={{ color: txt }}>
            <option value="all">Tous les dossiers</option>
            {dossierRefs.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span className="text-xs" style={{ color: sub }}>{filtered.length} entrée(s)</span>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                {["Date / Heure", "Utilisateur", "Rôle", "Dossier", "Action", "Statut", "Détails"].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const sc = statusConfig[entry.statut];
                const Icon = sc.icon;
                return (
                  <tr key={entry.id} className={`border-b border-gray-50 hover:bg-amber-50/30 transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-mono font-semibold" style={{ color: txt }}>{entry.date}</div>
                      <div className="text-[10px]" style={{ color: sub }}>{entry.heure}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "hsl(43 57% 54% / 0.15)", border: "1px solid hsl(43 57% 54% / 0.3)" }}>
                          <span className="text-[9px] font-bold" style={{ color: "hsl(43 57% 42%)" }}>
                            {entry.utilisateur.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: txt }}>{entry.utilisateur}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-xs" style={{ color: sub }}>{entry.role}</span></td>
                    <td className="px-5 py-3.5"><span className="text-xs font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{entry.dossierRef}</span></td>
                    <td className="px-5 py-3.5"><span className="text-sm" style={{ color: txt }}>{entry.action}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border w-fit ${sc.bg} ${sc.color}`}>
                        <Icon className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs truncate" style={{ color: sub }} title={entry.details}>{entry.details}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RGPD notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 text-xs" style={{ color: sub }}>
          <div className="font-semibold mb-2" style={{ color: txt }}>Politique de conservation et conformité</div>
          <div className="grid grid-cols-3 gap-4">
            <div><span className="text-amber-700 font-medium">Conservation :</span> 10 ans (réglementation bancaire)</div>
            <div><span className="text-amber-700 font-medium">Chiffrement :</span> AES-256 au repos, TLS 1.3 en transit</div>
            <div><span className="text-amber-700 font-medium">Accès :</span> Journalisé et tracé par rôle et habilitation</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
