import Layout, { PageHeader } from "@/components/Layout";
import { CheckCircle, XCircle, Shield } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type Permission = boolean | "partiel";

interface MatrixRow {
  categorie?: string;
  fonctionnalite: string;
  description: string;
  conseiller: Permission;
  analyste: Permission;
  admin: Permission;
}

const matrix: MatrixRow[] = [
  { categorie: "Gestion des dossiers", fonctionnalite: "Créer un dossier", description: "Initier une nouvelle demande de crédit", conseiller: true, analyste: false, admin: false },
  { fonctionnalite: "Modifier les données client", description: "Corriger ou compléter les informations client", conseiller: true, analyste: false, admin: true },
  { fonctionnalite: "Téléverser des documents", description: "Ajouter des pièces justificatives", conseiller: true, analyste: "partiel", admin: true },
  { fonctionnalite: "Voir ses propres dossiers", description: "Accéder aux dossiers qu'on a créés", conseiller: true, analyste: false, admin: true },
  { fonctionnalite: "Voir tous les dossiers", description: "Accéder à l'ensemble du portefeuille", conseiller: false, analyste: true, admin: true },
  { categorie: "Scoring & Analyse", fonctionnalite: "Consulter le score de solvabilité", description: "Voir le score et ses critères détaillés", conseiller: true, analyste: true, admin: true },
  { fonctionnalite: "Voir les alertes conformité", description: "Accéder aux alertes FICP, FCC, PPE, LCB-FT", conseiller: false, analyste: true, admin: true },
  { fonctionnalite: "Prendre une décision de crédit", description: "Émettre accord, refus ou accord sous conditions", conseiller: false, analyste: true, admin: false },
  { fonctionnalite: "Ajouter un commentaire analyste", description: "Rédiger une analyse qualitative du dossier", conseiller: false, analyste: true, admin: false },
  { fonctionnalite: "Demander des pièces complémentaires", description: "Solliciter des documents supplémentaires", conseiller: true, analyste: true, admin: false },
  { categorie: "Administration", fonctionnalite: "Gérer les utilisateurs", description: "Créer, modifier, désactiver des comptes", conseiller: false, analyste: false, admin: true },
  { fonctionnalite: "Modifier les rôles et habilitations", description: "Changer les droits d'accès par profil", conseiller: false, analyste: false, admin: true },
  { fonctionnalite: "Modifier les seuils de scoring", description: "Paramétrer les règles du moteur de score", conseiller: false, analyste: false, admin: true },
  { fonctionnalite: "Consulter les logs système", description: "Accéder aux journaux techniques de l'application", conseiller: false, analyste: false, admin: true },
  { fonctionnalite: "Accéder à l'audit global", description: "Voir le journal complet de toutes les actions", conseiller: false, analyste: "partiel", admin: true },
  { fonctionnalite: "Exporter des rapports PDF", description: "Générer et imprimer les fiches dossier", conseiller: true, analyste: true, admin: true },
];

const Cell = ({ val }: { val: Permission }) => {
  if (val === true) return (
    <div className="flex items-center justify-center">
      <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-emerald-600" />
      </div>
    </div>
  );
  if (val === "partiel") return (
    <div className="flex items-center justify-center">
      <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
        <Shield className="w-3.5 h-3.5 text-amber-600" />
      </div>
    </div>
  );
  return (
    <div className="flex items-center justify-center">
      <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
        <XCircle className="w-4 h-4 text-gray-300" />
      </div>
    </div>
  );
};

export default function Roles({ role, userName, userInitials, onLogout }: Props) {
  const roles = [
    { key: "conseiller", label: "Conseiller bancaire", color: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
    { key: "analyste", label: "Analyste risque", color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
    { key: "admin", label: "Administrateur SI", color: "text-purple-700 bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  ];

  const totalByRole = (key: "conseiller" | "analyste" | "admin") => matrix.filter(r => r[key] === true || r[key] === "partiel").length;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Rôles & Habilitations" subtitle="Matrice des droits d'accès par profil utilisateur" />

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {/* Role summary */}
        <div className="grid grid-cols-3 gap-4">
          {roles.map(r => (
            <div key={r.key} className={`bg-white border rounded-xl shadow-sm p-5 ${r.color.split(" ").find(c => c.startsWith("border"))}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${r.dot}`} />
                <span className={`text-sm font-semibold ${r.color.split(" ")[0]}`}>{r.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: txt }}>{totalByRole(r.key as any)}</div>
              <div className="text-xs mt-0.5" style={{ color: sub }}>droits autorisés sur {matrix.filter(m => !m.categorie).length + matrix.filter(m => m.categorie).length - matrix.filter(m => m.categorie).length}</div>
              <div className="text-2xl font-bold" style={{ color: txt }}>{totalByRole(r.key as any)}/{matrix.filter(m => !m.categorie).length}</div>
              <div className="text-xs mt-0.5" style={{ color: sub }}>fonctionnalités accessibles</div>
            </div>
          ))}
        </div>

        {/* Matrix */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold w-64" style={{ color: sub }}>Fonctionnalité</th>
                <th className="text-left text-[10px] uppercase tracking-wider px-5 py-3 font-semibold" style={{ color: sub }}>Description</th>
                {roles.map(r => (
                  <th key={r.key} className="text-center text-[10px] uppercase tracking-wider px-5 py-3 font-semibold w-40" style={{ color: sub }}>
                    <span className={`px-2 py-1 rounded-full border ${r.color}`}>{r.label.split(" ")[0]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => {
                if (row.categorie) {
                  return (
                    <tr key={i} style={{ background: "hsl(220 20% 95%)" }}>
                      <td colSpan={5} className="px-5 py-2.5">
                        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: sub }}>{row.categorie}</span>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold" style={{ color: txt }}>{row.fonctionnalite}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs" style={{ color: sub }}>{row.description}</span>
                    </td>
                    <td className="px-5 py-3.5"><Cell val={row.conseiller} /></td>
                    <td className="px-5 py-3.5"><Cell val={row.analyste} /></td>
                    <td className="px-5 py-3.5"><Cell val={row.admin} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs" style={{ color: sub }}>
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Autorisé</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-600" /> Partiel (accès limité)</div>
          <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-gray-300" /> Non autorisé</div>
        </div>
      </div>
    </Layout>
  );
}
