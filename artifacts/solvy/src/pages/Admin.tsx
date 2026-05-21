import { useState } from "react";
import Layout, { PageHeader } from "@/components/Layout";
import { mockUsers } from "@/data/mockData";
import { Plus, CheckCircle, XCircle, Settings, Users, Shield, FileText, AlertCircle } from "lucide-react";

interface AdminProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

const roleLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
  conseiller: { label: "Conseiller bancaire", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  analyste: { label: "Analyste risque", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  admin: { label: "Administrateur SI", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
};

const thresholds = [
  { range: "< 400", label: "Risque élevé", reco: "Refus recommandé", icon: XCircle, cls: "bg-red-50 border-red-200 text-red-700" },
  { range: "400 – 700", label: "Risque modéré", reco: "Analyse humaine obligatoire", icon: AlertCircle, cls: "bg-amber-50 border-amber-200 text-amber-700" },
  { range: "> 700", label: "Risque faible", reco: "Accord possible (validation requise)", icon: CheckCircle, cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

const weightCriteria = [
  { name: "Revenus mensuels", weight: 15, max: 150 },
  { name: "Taux d'endettement", weight: 15, max: 150 },
  { name: "Charges fixes", weight: 13, max: 130 },
  { name: "Stabilité professionnelle", weight: 15, max: 150 },
  { name: "Ancienneté relation client", weight: 12, max: 120 },
  { name: "Incidents de paiement", weight: 10, max: 100 },
  { name: "Présence de découverts", weight: 10, max: 100 },
  { name: "Capacité d'emprunt", weight: 10, max: 100 },
];

const systemLogs = [
  { date: "2024-01-18 11:32", level: "INFO", message: "Calcul score DOS-2024-0155 — modèle v2.3.1", component: "ScoringEngine" },
  { date: "2024-01-18 11:15", level: "INFO", message: "Décision enregistrée DOS-2024-0147 par p.durand", component: "DecisionModule" },
  { date: "2024-01-18 09:30", level: "INFO", message: "Connexion utilisateur p.durand@solvy-banque.fr", component: "AuthService" },
  { date: "2024-01-18 09:12", level: "INFO", message: "Nouveau dossier créé DOS-2024-0151 par s.martin", component: "DossierService" },
  { date: "2024-01-17 10:05", level: "WARN", message: "Statut PPE détecté sur dossier DOS-2024-0155", component: "ComplianceCheck" },
  { date: "2024-01-17 09:00", level: "INFO", message: "Sauvegarde automatique base de données — OK", component: "BackupService" },
  { date: "2024-01-16 14:20", level: "INFO", message: "Contrôle LCB-FT automatique DOS-2024-0147 — CONFORME", component: "ComplianceCheck" },
  { date: "2024-01-16 03:00", level: "INFO", message: "Mise à jour modèle scoring v2.3.1 — déploiement OK", component: "ModelDeploy" },
  { date: "2024-01-15 16:00", level: "ERROR", message: "Timeout connexion FICP externe — retry réussi (3s)", component: "FICPConnector" },
  { date: "2024-01-15 14:30", level: "INFO", message: "Rapport mensuel généré — 23 dossiers, 41 décisions", component: "ReportService" },
];

const logColors = {
  INFO: "text-blue-700 bg-blue-50 border-blue-200",
  WARN: "text-amber-700 bg-amber-50 border-amber-200",
  ERROR: "text-red-700 bg-red-50 border-red-200",
};

export default function Admin({ role, userName, userInitials, onLogout }: AdminProps) {
  const [activeTab, setActiveTab] = useState<"users" | "scoring" | "logs">("users");

  const tabs = [
    { id: "users" as const, label: "Utilisateurs", icon: Users },
    { id: "scoring" as const, label: "Paramètres Scoring", icon: Settings },
    { id: "logs" as const, label: "Journalisation système", icon: FileText },
  ];

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Administration" subtitle="Gestion des utilisateurs, rôles et paramètres système" />

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              style={activeTab === id ? { background: "hsl(43 60% 46%)" } : {}}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold" style={{ color: txt }}>{mockUsers.length} utilisateurs</h2>
              <button className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90"
                style={{ background: "hsl(43 60% 46%)" }}>
                <Plus className="w-4 h-4" /> Ajouter un utilisateur
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                    {["Utilisateur", "Email", "Rôle", "Statut", "Dernière connexion", "Actions"].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user, i) => {
                    const rc = roleLabels[user.role];
                    return (
                      <tr key={user.id} className={`border-b border-gray-50 hover:bg-amber-50/30 transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: "hsl(43 57% 54% / 0.15)", border: "1px solid hsl(43 57% 54% / 0.3)" }}>
                              <span className="text-xs font-bold" style={{ color: "hsl(43 57% 42%)" }}>{user.avatar}</span>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: txt }}>{user.prenom} {user.nom}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><span className="text-xs" style={{ color: sub }}>{user.email}</span></td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${rc.bg} ${rc.border} ${rc.color}`}>{rc.label}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${user.statut === "actif" ? "text-emerald-600" : "text-gray-400"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.statut === "actif" ? "bg-emerald-500" : "bg-gray-300"}`} />
                            {user.statut === "actif" ? "Actif" : "Inactif"}
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><span className="text-xs font-mono" style={{ color: sub }}>{user.derniereConnexion}</span></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button className="text-xs font-medium text-amber-600 hover:text-amber-700">Modifier</button>
                            <button className={`text-xs font-medium ${user.statut === "actif" ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"}`}>
                              {user.statut === "actif" ? "Désactiver" : "Activer"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Roles */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold" style={{ color: txt }}>Rôles et habilitations</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { role: "Conseiller bancaire", perms: ["Créer dossier", "Saisir données client", "Uploader documents", "Consulter ses dossiers"], cls: "text-blue-700" },
                  { role: "Analyste risque", perms: ["Consulter tous dossiers", "Voir scores détaillés", "Émettre décisions", "Consulter alertes réglementaires"], cls: "text-amber-700" },
                  { role: "Administrateur SI", perms: ["Gestion utilisateurs", "Paramétrage scoring", "Consultation logs", "Toutes permissions"], cls: "text-purple-700" },
                ].map(({ role: r, perms, cls }) => (
                  <div key={r} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className={`text-sm font-semibold mb-3 ${cls}`}>{r}</div>
                    <ul className="space-y-1.5">
                      {perms.map(p => (
                        <li key={p} className="flex items-center gap-2 text-xs" style={{ color: sub }}>
                          <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scoring tab */}
        {activeTab === "scoring" && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: txt }}>Seuils de décision</h3>
              <div className="space-y-3">
                {thresholds.map(({ range, label, reco, icon: Icon, cls }) => (
                  <div key={range} className={`flex items-center gap-4 p-4 rounded-xl border ${cls}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="text-base font-bold font-mono">{range}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border">{label}</span>
                      </div>
                      <div className="text-sm opacity-80">{reco}</div>
                    </div>
                    <button className="text-xs font-medium px-3 py-1.5 border border-current/30 rounded-lg hover:bg-current/5 transition-colors">Modifier</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs" style={{ color: sub }}>
                Le score est une aide à la décision. Toute décision finale requiert une validation humaine (RGPD Art. 22).
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold mb-1" style={{ color: txt }}>Pondération des critères — Modèle v2.3.1</h3>
              <p className="text-xs mb-4" style={{ color: sub }}>Total : 1000 points</p>
              <div className="space-y-3">
                {weightCriteria.map(({ name, weight, max }) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="text-sm w-52 flex-shrink-0" style={{ color: txt }}>{name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${weight}%`, background: "hsl(43 57% 54%)" }} />
                    </div>
                    <span className="text-xs font-semibold w-20 text-right" style={{ color: "hsl(43 57% 42%)" }}>{max} pts ({weight}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs tab */}
        {activeTab === "logs" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: txt }}>Journal système</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">Système opérationnel</span>
              </div>
            </div>
            <div className="font-mono text-xs divide-y divide-gray-50">
              {systemLogs.map((log, i) => (
                <div key={i} className={`flex items-start gap-4 px-5 py-3 hover:bg-amber-50/20 transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                  <span className="text-gray-400 whitespace-nowrap flex-shrink-0">{log.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${logColors[log.level as keyof typeof logColors]}`}>{log.level}</span>
                  <span className="text-blue-500/70 flex-shrink-0 w-32 truncate">[{log.component}]</span>
                  <span style={{ color: txt }}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
