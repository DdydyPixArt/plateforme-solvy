import { useState } from "react";
import Layout, { PageHeader } from "@/components/Layout";
import { mockAuditEntries } from "@/data/mockData";
import { CheckCircle, AlertTriangle, XCircle, Info, Download, Shield, Search, Filter } from "lucide-react";

interface AuditProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const statusConfig = {
  success: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", label: "Succès" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", label: "Alerte" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", label: "Erreur" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", label: "Info" },
};

export default function Audit({ role, userName, userInitials, onLogout }: AuditProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dossierFilter, setDossierFilter] = useState("all");

  const dossierRefs = Array.from(new Set(mockAuditEntries.map(e => e.dossierRef)));

  const filtered = mockAuditEntries.filter(e => {
    const matchSearch = `${e.utilisateur} ${e.action} ${e.details} ${e.dossierRef}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.statut === statusFilter;
    const matchDossier = dossierFilter === "all" || e.dossierRef === dossierFilter;
    return matchSearch && matchStatus && matchDossier;
  });

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Audit & Traçabilité" subtitle="Journal des actions — Conformité RGPD · Explicabilité · Archivage">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-400/10 border border-green-400/20 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-medium text-green-400">Conformité RGPD active</span>
        </div>
        <button className="flex items-center gap-2 border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/80 px-4 py-2 rounded-lg transition-all">
          <Download className="w-4 h-4" /> Exporter
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([key, { color, bg, icon: Icon, label }]) => (
            <div key={key} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className={`text-xl font-bold ${color}`}>{mockAuditEntries.filter(e => e.statut === key).length}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher dans les logs..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
            <option value="all">Tous les statuts</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={dossierFilter} onChange={e => setDossierFilter(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
            <option value="all">Tous les dossiers</option>
            {dossierRefs.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{filtered.length} entrée(s)</span>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Date / Heure", "Utilisateur", "Rôle", "Dossier", "Action", "Statut", "Détails"].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const sc = statusConfig[entry.statut];
                const Icon = sc.icon;
                return (
                  <tr key={entry.id} className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-mono text-foreground">{entry.date}</div>
                      <div className="text-[10px] text-muted-foreground">{entry.heure}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-primary">
                            {entry.utilisateur.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-xs text-foreground">{entry.utilisateur}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground">{entry.role}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-primary">{entry.dossierRef}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-foreground">{entry.action}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border w-fit ${sc.bg} ${sc.color}`}>
                        <Icon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-muted-foreground truncate" title={entry.details}>{entry.details}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RGPD notice */}
        <div className="bg-card border border-border rounded-xl px-6 py-4 text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground mb-2">Politique de conservation et conformité</div>
          <div className="grid grid-cols-3 gap-4">
            <div><span className="text-primary/80">Conservation des logs :</span> 10 ans (réglementation bancaire)</div>
            <div><span className="text-primary/80">Chiffrement :</span> AES-256 au repos, TLS 1.3 en transit</div>
            <div><span className="text-primary/80">Accès :</span> Journalisé et tracé par rôle et habilitation</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
