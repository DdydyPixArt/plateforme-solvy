import { useState } from "react";
import { useLocation, useParams } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockUsers, User, UserRole } from "@/data/mockData";
import { Plus, CheckCircle, XCircle, Settings, Users, Shield, FileText, X, Database } from "lucide-react";

interface AdminProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

const roleLabels: Record<UserRole, { label: string; color: string; bg: string; border: string }> = {
  conseiller: { label: "Conseiller bancaire", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  analyste: { label: "Analyste risque", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  admin: { label: "Administrateur SI", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
};

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

const logColors: Record<string, string> = {
  INFO: "text-blue-700 bg-blue-50 border-blue-200",
  WARN: "text-amber-700 bg-amber-50 border-amber-200",
  ERROR: "text-red-700 bg-red-50 border-red-200",
};

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (u: Partial<User>) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [prenom, setPrenom] = useState(user?.prenom ?? "");
  const [nom, setNom] = useState(user?.nom ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "conseiller");

  const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-300";
  const labelCls = "text-[10px] uppercase tracking-widest font-semibold mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: txt }}>{user ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: sub }}>Prénom</label>
              <input className={inputCls} style={{ color: txt }} value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Sophie" />
            </div>
            <div>
              <label className={labelCls} style={{ color: sub }}>Nom</label>
              <input className={inputCls} style={{ color: txt }} value={nom} onChange={e => setNom(e.target.value)} placeholder="Martin" />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: sub }}>Email professionnel</label>
            <input type="email" className={inputCls} style={{ color: txt }} value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@solvy-banque.fr" />
          </div>
          <div>
            <label className={labelCls} style={{ color: sub }}>Rôle</label>
            <select className={inputCls} style={{ color: txt }} value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="conseiller">Conseiller bancaire</option>
              <option value="analyste">Analyste risque</option>
              <option value="admin">Administrateur SI</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">Annuler</button>
          <button onClick={() => { onSave({ prenom, nom, email, role }); onClose(); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "hsl(43 60% 46%)" }}>
            {user ? "Enregistrer" : "Créer l'utilisateur"}
          </button>
        </div>
      </div>
    </div>
  );
}

type TabId = "utilisateurs" | "scoring" | "logs";

export default function Admin({ role, userName, userInitials, onLogout }: AdminProps) {
  const [location] = useLocation();

  // Determine active tab from URL
  const getTab = (): TabId => {
    if (location.includes("/scoring")) return "scoring";
    if (location.includes("/logs")) return "logs";
    return "utilisateurs";
  };
  const [, setLocation] = useLocation();
  const activeTab = getTab();

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const handleSave = (data: Partial<User>) => {
    if (editUser) {
      setUsers(us => us.map(u => u.id === editUser.id ? { ...u, ...data } : u));
    } else {
      const initials = `${data.prenom?.[0] ?? ""}${data.nom?.[0] ?? ""}`.toUpperCase();
      setUsers(us => [...us, {
        id: `u${Date.now()}`, nom: data.nom ?? "", prenom: data.prenom ?? "",
        email: data.email ?? "", role: data.role ?? "conseiller",
        statut: "actif", derniereConnexion: "—", avatar: initials,
      }]);
    }
    setEditUser(null);
  };

  const toggleStatut = (id: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, statut: u.statut === "actif" ? "inactif" : "actif" } : u));
  };

  const tabs: { id: TabId; label: string; icon: typeof Users; path: string }[] = [
    { id: "utilisateurs", label: "Utilisateurs", icon: Users, path: "/admin/utilisateurs" },
    { id: "scoring", label: "Paramètres Scoring", icon: Settings, path: "/admin/scoring" },
    { id: "logs", label: "Journalisation système", icon: FileText, path: "/admin/logs" },
  ];

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Administration" subtitle="Gestion des utilisateurs, paramètres et logs système">
        <button onClick={() => setLocation("/admin/data")}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
          <Database className="w-4 h-4" /> Administration Data
        </button>
      </PageHeader>

      {(showModal || editUser) && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={handleSave}
        />
      )}

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {tabs.map(({ id, label, icon: Icon, path }) => (
            <button key={id} onClick={() => setLocation(path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              style={activeTab === id ? { background: "hsl(43 60% 46%)" } : {}}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── Users tab ── */}
        {activeTab === "utilisateurs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold" style={{ color: txt }}>{users.length} utilisateurs configurés</h2>
              <button onClick={() => { setEditUser(null); setShowModal(true); }}
                className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90"
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
                  {users.map((user, i) => {
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
                            <div className={`w-1.5 h-1.5 rounded-full ${user.statut === "actif" ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                            {user.statut === "actif" ? "Actif" : "Inactif"}
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><span className="text-xs font-mono" style={{ color: sub }}>{user.derniereConnexion}</span></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button onClick={() => { setEditUser(user); setShowModal(true); }}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">Modifier</button>
                            <button onClick={() => toggleStatut(user.id)}
                              className={`text-xs font-medium transition-colors ${user.statut === "actif" ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"}`}>
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
          </div>
        )}

        {/* ── Scoring tab ── */}
        {activeTab === "scoring" && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: txt }}>Seuils de décision automatique</h3>
              <div className="space-y-3">
                {[
                  { range: "< 400", label: "Risque élevé", reco: "Refus recommandé", icon: XCircle, cls: "bg-red-50 border-red-200 text-red-700" },
                  { range: "400 – 700", label: "Risque modéré", reco: "Analyse humaine obligatoire", icon: Shield, cls: "bg-amber-50 border-amber-200 text-amber-700" },
                  { range: "> 700", label: "Risque faible", reco: "Accord possible (validation requise)", icon: CheckCircle, cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map(({ range, label, reco, icon: Icon, cls }) => (
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
                Toute décision finale requiert une validation humaine (RGPD Art. 22).
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
                      <div className="h-full rounded-full transition-all" style={{ width: `${weight}%`, background: "hsl(43 57% 54%)" }} />
                    </div>
                    <span className="text-xs font-semibold w-24 text-right" style={{ color: "hsl(43 57% 42%)" }}>{max} pts ({weight}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Logs tab ── */}
        {activeTab === "logs" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: txt }}>Journal système en temps réel</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">Opérationnel</span>
              </div>
            </div>
            <div className="font-mono text-xs divide-y divide-gray-50">
              {systemLogs.map((log, i) => (
                <div key={i} className={`flex items-start gap-4 px-5 py-3 hover:bg-amber-50/20 transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                  <span className="text-gray-400 whitespace-nowrap flex-shrink-0">{log.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${logColors[log.level]}`}>{log.level}</span>
                  <span className="text-blue-500/70 flex-shrink-0 w-36 truncate">[{log.component}]</span>
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
