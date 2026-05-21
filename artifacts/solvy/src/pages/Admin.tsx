import { useState } from "react";
import Layout, { PageHeader } from "@/components/Layout";
import { mockUsers } from "@/data/mockData";
import { Plus, CheckCircle, XCircle, Settings, Users, Shield, FileText, AlertCircle } from "lucide-react";

interface AdminProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  conseiller: { label: "Conseiller bancaire", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  analyste: { label: "Analyste risque", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  admin: { label: "Administrateur SI", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
};

const thresholds = [
  { range: "< 400", label: "Risque élevé", reco: "Refus recommandé", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: XCircle },
  { range: "400 – 700", label: "Risque modéré", reco: "Analyse humaine obligatoire", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: AlertCircle },
  { range: "> 700", label: "Risque faible", reco: "Accord possible (validation requise)", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: CheckCircle },
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
  { date: "2024-01-18 11:32", level: "INFO", message: "Calcul score DOS-2024-0155 - modèle v2.3.1", component: "ScoringEngine" },
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
  INFO: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  WARN: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  ERROR: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function Admin({ role, userName, userInitials, onLogout }: AdminProps) {
  const [activeTab, setActiveTab] = useState<"users" | "scoring" | "logs">("users");

  const tabs = [
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "scoring", label: "Paramètres Scoring", icon: Settings },
    { id: "logs", label: "Journalisation", icon: FileText },
  ] as const;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Administration" subtitle="Gestion des utilisateurs, rôles et paramètres système" />

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-foreground">{mockUsers.length} utilisateurs</h2>
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all">
                <Plus className="w-4 h-4" /> Ajouter un utilisateur
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Utilisateur", "Email", "Rôle", "Statut", "Dernière connexion", "Actions"].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user, i) => {
                    const rc = roleLabels[user.role];
                    return (
                      <tr key={user.id} className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">{user.avatar}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{user.prenom} {user.nom}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${rc.bg} ${rc.color}`}>{rc.label}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className={`flex items-center gap-1.5 text-xs font-medium w-fit ${user.statut === "actif" ? "text-green-400" : "text-muted-foreground"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.statut === "actif" ? "bg-green-400" : "bg-muted-foreground"}`} />
                            {user.statut === "actif" ? "Actif" : "Inactif"}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-mono text-muted-foreground">{user.derniereConnexion}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button className="text-xs text-muted-foreground hover:text-primary transition-colors">Modifier</button>
                            <button className={`text-xs transition-colors ${user.statut === "actif" ? "text-muted-foreground hover:text-red-400" : "text-muted-foreground hover:text-green-400"}`}>
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
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Rôles et habilitations</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { role: "Conseiller bancaire", perms: ["Créer dossier", "Saisir données client", "Uploader documents", "Consulter dossiers propres"], color: "text-blue-400" },
                  { role: "Analyste risque", perms: ["Consulter tous dossiers", "Voir scores", "Émettre décisions", "Consulter alertes réglementaires"], color: "text-primary" },
                  { role: "Administrateur SI", perms: ["Gestion utilisateurs", "Paramétrage scoring", "Consultation logs", "Toutes permissions"], color: "text-purple-400" },
                ].map(({ role: r, perms, color }) => (
                  <div key={r} className="bg-background border border-border rounded-xl p-4">
                    <div className={`text-sm font-semibold mb-3 ${color}`}>{r}</div>
                    <ul className="space-y-1.5">
                      {perms.map(p => (
                        <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {p}
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
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Seuils de décision</h3>
              <div className="space-y-3">
                {thresholds.map(({ range, label, reco, color, bg, icon: Icon }) => (
                  <div key={range} className={`flex items-center gap-4 p-4 rounded-xl border ${bg}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className={`text-base font-bold font-mono ${color}`}>{range}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${bg} ${color}`}>{label}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{reco}</div>
                    </div>
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 border border-border rounded-lg">Modifier</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-muted-foreground">
                Rappel : Le score est une aide à la décision. Toute décision finale requiert une validation humaine par un analyste risque habilité, conformément aux exigences RGPD Art. 22.
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Pondération des critères — Modèle v2.3.1</h3>
              <p className="text-xs text-muted-foreground mb-4">Total : 1000 points</p>
              <div className="space-y-3">
                {weightCriteria.map(({ name, weight, max }) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="text-sm text-foreground w-52 flex-shrink-0">{name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${weight}%` }} />
                    </div>
                    <span className="text-xs font-medium text-primary w-16 text-right">{max} pts ({weight}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs tab */}
        {activeTab === "logs" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Journal système</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Système opérationnel</span>
              </div>
            </div>
            <div className="font-mono text-xs divide-y divide-border/30">
              {systemLogs.map((log, i) => (
                <div key={i} className={`flex items-start gap-4 px-5 py-3 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                  <span className="text-muted-foreground whitespace-nowrap flex-shrink-0">{log.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${logColors[log.level as keyof typeof logColors]}`}>{log.level}</span>
                  <span className="text-blue-400/60 flex-shrink-0 w-32 truncate">[{log.component}]</span>
                  <span className="text-foreground/80">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
