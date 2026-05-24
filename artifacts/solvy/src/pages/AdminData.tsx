import { useState } from "react";
import { useParams, useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useAdminStats } from "@/hooks/useApi";
import {
  Database, Table2, BookOpen, Shield, Cpu, BarChart3, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, ArrowRight, Users, FileText,
  Lock, Eye, Server, HardDrive, Globe, Key, ClipboardList, Loader2
} from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; userEmail?: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type TabId = "schema" | "dictionnaire" | "classification" | "gouvernance" | "infrastructure" | "qualite";

const tabs: { id: TabId; label: string; icon: typeof Database }[] = [
  { id: "schema", label: "Schéma de données", icon: Database },
  { id: "dictionnaire", label: "Dictionnaire", icon: BookOpen },
  { id: "classification", label: "Classification", icon: Shield },
  { id: "gouvernance", label: "Gouvernance", icon: ClipboardList },
  { id: "infrastructure", label: "Infrastructure", icon: Cpu },
  { id: "qualite", label: "Qualité des données", icon: BarChart3 },
];

const tables = [
  { nom: "dossiers", description: "Dossiers de crédit clients", pk: "id (text)", relations: ["clients (JSONB)", "documents (JSONB)", "historique (JSONB)"], statKey: "dossiers" },
  { nom: "users", description: "Utilisateurs de la plateforme", pk: "id (text)", relations: ["notifications.userEmail"], statKey: "users" },
  { nom: "notifications", description: "Notifications système", pk: "id (text)", relations: ["dossiers.reference", "users.email"], statKey: "notifications" },
  { nom: "audit_logs", description: "Journal d'audit exhaustif", pk: "id (text)", relations: ["dossiers.reference"], statKey: "auditLogs" },
  { nom: "clients (JSONB)", description: "Profil client imbriqué dans dossiers", pk: "id (généré)", relations: ["dossiers"], statKey: "clients" },
  { nom: "documents (JSONB)", description: "Liste de documents par dossier", pk: "index tableau", relations: ["dossiers"], statKey: "documents" },
  { nom: "scores", description: "Score de solvabilité (colonne dossiers)", pk: "dossiers.score", relations: ["dossiers"], statKey: "scores" },
  { nom: "decisions", description: "Décisions analyste (colonne dossiers)", pk: "dossiers.decision", relations: ["dossiers", "users"], statKey: "decisions" },
];

const dictionnaire = [
  { champ: "id", table: "dossiers", type: "text", description: "Identifiant unique du dossier", obligatoire: true, sensible: false, regle: "Généré automatiquement à la création" },
  { champ: "reference", table: "dossiers", type: "text", description: "Référence métier (DOS-YYYY-NNNN)", obligatoire: true, sensible: false, regle: "Format DOS-{année}-{4 chiffres aléatoires}" },
  { champ: "client.email", table: "dossiers", type: "text (JSONB)", description: "Email du client", obligatoire: false, sensible: true, regle: "Données personnelles — RGPD Art. 5" },
  { champ: "client.telephone", table: "dossiers", type: "text (JSONB)", description: "Téléphone du client", obligatoire: false, sensible: true, regle: "Données personnelles — RGPD Art. 5" },
  { champ: "finances.revenusNets", table: "dossiers", type: "real (JSONB)", description: "Revenus nets mensuels du client", obligatoire: true, sensible: true, regle: "Données financières — conservation 5 ans" },
  { champ: "taux_endettement", table: "dossiers", type: "real", description: "Taux d'endettement calculé (%)", obligatoire: true, sensible: false, regle: "Calculé = (charges + crédits) / revenus × 100. Seuil HCSF : 35%" },
  { champ: "score", table: "dossiers", type: "integer", description: "Score de solvabilité (0–1000)", obligatoire: false, sensible: false, regle: "Calculé par le moteur scoring v2.3.1. Requis avant décision." },
  { champ: "decision", table: "dossiers", type: "text", description: "Décision analyste finale", obligatoire: false, sensible: false, regle: "Valeurs: accord | refus | accord_conditions. Immuable après saisie." },
  { champ: "ficp", table: "dossiers", type: "boolean", description: "Inscription au FICP", obligatoire: true, sensible: true, regle: "Consultation obligatoire avant octroi de crédit (L.333-4 Code conso.)" },
  { champ: "fcc", table: "dossiers", type: "boolean", description: "Inscription au FCC (chèques)", obligatoire: true, sensible: true, regle: "Consultation obligatoire Banque de France" },
  { champ: "ppe", table: "dossiers", type: "boolean", description: "Personne Politiquement Exposée", obligatoire: true, sensible: true, regle: "Directive (UE) 2015/849 — LCB-FT renforcé" },
  { champ: "lcbft", table: "dossiers", type: "boolean", description: "Contrôle anti-blanchiment effectué", obligatoire: true, sensible: false, regle: "CRBF 91-09 — contrôle obligatoire avant déblocage" },
  { champ: "decision_status", table: "dossiers", type: "text", description: "Statut du dossier", obligatoire: true, sensible: false, regle: "incomplet | en_analyse | score_calcule | decision_rendue | archive" },
  { champ: "conseiller_email", table: "dossiers", type: "text", description: "Email du conseiller référent", obligatoire: true, sensible: false, regle: "Lié au compte utilisateur — filtre principal pour l'espace conseiller" },
  { champ: "transmis_at", table: "dossiers", type: "text", description: "Date/heure de transmission à l'analyse", obligatoire: false, sensible: false, regle: "Null = non transmis. Requis pour apparaître dans la queue analyste." },
  { champ: "utilisateur", table: "audit_logs", type: "text", description: "Auteur de l'action auditée", obligatoire: true, sensible: false, regle: "Nom complet de l'utilisateur connecté" },
  { champ: "action", table: "audit_logs", type: "text", description: "Action effectuée", obligatoire: true, sensible: false, regle: "Description libre — conservée 10 ans" },
];

const classifications = [
  {
    categorie: "Données personnelles", couleur: "text-red-700 bg-red-50 border-red-200",
    niveau: "Très sensible", niveauCls: "text-red-800 bg-red-100 border-red-300",
    exemples: ["client.nom", "client.prenom", "client.dateNaissance", "client.adresse", "client.email", "client.telephone"],
    regle: "RGPD Art. 5 — Minimisation, exactitude, limitation de durée. DPD notifié.",
  },
  {
    categorie: "Données financières", couleur: "text-amber-700 bg-amber-50 border-amber-200",
    niveau: "Confidentiel", niveauCls: "text-amber-800 bg-amber-100 border-amber-300",
    exemples: ["finances.revenusNets", "finances.chargesFixes", "taux_endettement", "capacite_emprunt", "score"],
    regle: "Conservation 5 ans après clôture. Accès restreint aux conseillers et analystes habilités.",
  },
  {
    categorie: "Données bancaires", couleur: "text-purple-700 bg-purple-50 border-purple-200",
    niveau: "Confidentiel", niveauCls: "text-purple-800 bg-purple-100 border-purple-300",
    exemples: ["ficp", "fcc", "incidents", "decision", "demande.montant"],
    regle: "Directive CRD IV — confidentialité bancaire. Accès limité aux analystes risque.",
  },
  {
    categorie: "Données de conformité", couleur: "text-blue-700 bg-blue-50 border-blue-200",
    niveau: "Confidentiel", niveauCls: "text-blue-800 bg-blue-100 border-blue-300",
    exemples: ["ppe", "lcbft", "transmis_at", "analyste_assigne"],
    regle: "CRBF 91-09 / Directive (UE) 2015/849 — traçabilité obligatoire.",
  },
  {
    categorie: "Données d'audit", couleur: "text-gray-700 bg-gray-50 border-gray-200",
    niveau: "Interne", niveauCls: "text-gray-700 bg-gray-100 border-gray-300",
    exemples: ["audit_logs.*", "historique[]", "created_at", "updated_at"],
    regle: "Conservation 10 ans. Immuables après création. Accessibles aux admins uniquement.",
  },
  {
    categorie: "Données techniques", couleur: "text-green-700 bg-green-50 border-green-200",
    niveau: "Faible", niveauCls: "text-green-800 bg-green-100 border-green-300",
    exemples: ["id", "reference", "status", "created_at"],
    regle: "Pas de restriction particulière. Utilisées pour l'intégrité référentielle.",
  },
];

const gouvernance = [
  { domaine: "Données clients", proprietaire: "Direction Commerciale", responsableMetier: "Chef des conseillers", responsableTech: "DBA / Équipe plateforme", conservation: "5 ans après clôture", rgpd: "Consentement + Intérêt légitime", qualite: "95%+", conformite: "Conforme" },
  { domaine: "Données financières", proprietaire: "Direction des Risques", responsableMetier: "Responsable Risque Crédit", responsableTech: "DBA / Équipe scoring", conservation: "5 ans", rgpd: "Obligation légale", qualite: "99%+", conformite: "Conforme" },
  { domaine: "Données conformité", proprietaire: "Direction Conformité", responsableMetier: "DPO", responsableTech: "RSSI", conservation: "10 ans", rgpd: "Obligation légale", qualite: "100%", conformite: "Conforme" },
  { domaine: "Logs & Audit", proprietaire: "DSI", responsableMetier: "Administrateur SI", responsableTech: "DevOps", conservation: "10 ans", rgpd: "Intérêt légitime", qualite: "100%", conformite: "Conforme" },
  { domaine: "Données scoring", proprietaire: "Direction des Risques", responsableMetier: "Quant / Modèle", responsableTech: "ML Engineer", conservation: "5 ans", rgpd: "Décision automatisée RGPD Art.22 — révision humaine obligatoire", qualite: "97%+", conformite: "Partiel — révision Art.22" },
];

const infraNodes = [
  { icon: Globe, label: "Frontend React", detail: "Vite 7 · React 19 · TailwindCSS · SPA statique", cls: "border-blue-200 bg-blue-50 text-blue-700" },
  { icon: Server, label: "API Express", detail: "Node.js 22 · Express 4 · Pino logs · Port 8080", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  { icon: Database, label: "PostgreSQL", detail: "Drizzle ORM · JSONB columns · Pool connexions", cls: "border-purple-200 bg-purple-50 text-purple-700" },
  { icon: HardDrive, label: "Stockage documents", detail: "Métadonnées en DB · Fichiers PDF (à configurer)", cls: "border-gray-200 bg-gray-50 text-gray-700" },
  { icon: Key, label: "Authentification", detail: "Session React · Email/rôle · Profils fictifs (démo)", cls: "border-green-200 bg-green-50 text-green-700" },
  { icon: ClipboardList, label: "Audit & Logs", detail: "audit_logs table · Pino logger · Toutes actions tracées", cls: "border-red-200 bg-red-50 text-red-700" },
  { icon: Shield, label: "Contrôle d'accès", detail: "RBAC : conseiller · analyste · admin · Filtres par rôle", cls: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  { icon: Lock, label: "Chiffrement", detail: "HTTPS TLS 1.3 · Variables d'env secrets · Aucun mot de passe clair", cls: "border-orange-200 bg-orange-50 text-orange-700" },
];

export default function AdminData({ role, userName, userInitials, onLogout }: Props) {
  const [, setLocation] = useLocation();
  const params = useParams<{ tab?: string }>();
  const activeTab: TabId = (params.tab as TabId) || "schema";
  const { data: stats, isLoading: statsLoading, refetch } = useAdminStats();

  const setTab = (tab: TabId) => setLocation(`/admin/data/${tab}`);

  const Stat = ({ label, value, cls = "" }: { label: string; value: number | string; cls?: string }) => (
    <div className={`rounded-xl border p-3 text-center ${cls}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] font-medium mt-0.5">{label}</div>
    </div>
  );

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Administration Data" subtitle="Architecture data · Gouvernance · Qualité · Infrastructure">
        <button onClick={() => setLocation("/admin")}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          ← Admin SI
        </button>
        <button onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </PageHeader>

      {/* Tab nav */}
      <div className="border-b border-gray-200 bg-white px-8">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${active
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* ── Schéma de données ── */}
        {activeTab === "schema" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: sub }}>Architecture des données — PostgreSQL + JSONB columns</p>
              {statsLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
            </div>
            <div className="grid grid-cols-4 gap-3 mb-2">
              <Stat label="Total dossiers" value={stats?.tables.dossiers ?? "—"} cls="border-amber-100 text-amber-700" />
              <Stat label="Utilisateurs" value={stats?.tables.users ?? "—"} cls="border-blue-100 text-blue-700" />
              <Stat label="Notifications" value={stats?.tables.notifications ?? "—"} cls="border-purple-100 text-purple-700" />
              <Stat label="Lignes audit" value={stats?.tables.auditLogs ?? "—"} cls="border-gray-100 text-gray-700" />
            </div>
            <div className="space-y-3">
              {tables.map(t => (
                <div key={t.nom} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Table2 className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold" style={{ color: txt }}>{t.nom}</div>
                        <div className="text-xs mt-0.5" style={{ color: sub }}>{t.description}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold" style={{ color: "hsl(43 57% 40%)" }}>
                        {stats ? (stats.tables[t.statKey as keyof typeof stats.tables] ?? "—") : <Loader2 className="w-4 h-4 animate-spin inline" />}
                      </div>
                      <div className="text-[10px]" style={{ color: sub }}>enregistrements</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span style={{ color: sub }}>Clé primaire : </span>
                      <span className="font-mono font-semibold" style={{ color: txt }}>{t.pk}</span>
                    </div>
                    <div>
                      <span style={{ color: sub }}>Relations : </span>
                      <span style={{ color: txt }}>{t.relations.join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dictionnaire de données ── */}
        {activeTab === "dictionnaire" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: sub }}>Référentiel des champs — définition, type et règles de gestion</p>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                    {["Champ", "Table", "Type", "Description métier", "Obligatoire", "Sensible", "Règle de gestion"].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider px-4 py-3 font-semibold" style={{ color: sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dictionnaire.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-50 hover:bg-amber-50/20 ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                      <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: "hsl(43 57% 38%)" }}>{row.champ}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: sub }}>{row.table}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: sub }}>{row.type}</td>
                      <td className="px-4 py-2.5" style={{ color: txt }}>{row.description}</td>
                      <td className="px-4 py-2.5 text-center">
                        {row.obligatoire
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                          : <XCircle className="w-3.5 h-3.5 text-gray-300 mx-auto" />}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {row.sensible
                          ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mx-auto" />
                          : <CheckCircle className="w-3.5 h-3.5 text-gray-300 mx-auto" />}
                      </td>
                      <td className="px-4 py-2.5 text-[10px] leading-relaxed" style={{ color: sub }}>{row.regle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Classification ── */}
        {activeTab === "classification" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: sub }}>Catégories de données et niveaux de sensibilité applicables</p>
            <div className="space-y-3">
              {classifications.map((c, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${c.couleur}`}>{c.categorie}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${c.niveauCls}`}>{c.niveau}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {c.exemples.map(ex => (
                      <span key={ex} className="text-[10px] font-mono px-2 py-0.5 rounded border bg-gray-50 border-gray-200" style={{ color: sub }}>{ex}</span>
                    ))}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: sub }}>{c.regle}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Gouvernance ── */}
        {activeTab === "gouvernance" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: sub }}>Propriétaires, responsables et règles de conservation par domaine</p>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100" style={{ background: "hsl(220 20% 97%)" }}>
                    {["Domaine", "Propriétaire", "Responsable métier", "Responsable tech.", "Conservation", "RGPD", "Qualité", "Conformité"].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider px-4 py-3 font-semibold" style={{ color: sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gouvernance.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-50 hover:bg-amber-50/20 ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                      <td className="px-4 py-3 font-semibold" style={{ color: txt }}>{row.domaine}</td>
                      <td className="px-4 py-3" style={{ color: sub }}>{row.proprietaire}</td>
                      <td className="px-4 py-3" style={{ color: sub }}>{row.responsableMetier}</td>
                      <td className="px-4 py-3" style={{ color: sub }}>{row.responsableTech}</td>
                      <td className="px-4 py-3 font-mono text-[10px]" style={{ color: sub }}>{row.conservation}</td>
                      <td className="px-4 py-3 text-[10px] leading-relaxed max-w-xs" style={{ color: sub }}>{row.rgpd}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${row.qualite === "100%" ? "text-emerald-600" : "text-amber-600"}`}>{row.qualite}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${row.conformite === "Conforme"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                          {row.conformite}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Infrastructure ── */}
        {activeTab === "infrastructure" && (
          <div className="space-y-5">
            <p className="text-sm" style={{ color: sub }}>Architecture technique de la plateforme SOLVY</p>
            <div className="grid grid-cols-2 gap-4">
              {infraNodes.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div key={i} className={`bg-white border rounded-xl shadow-sm p-5 flex items-start gap-4 ${node.cls.split(" ")[0]}`}>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${node.cls}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1" style={{ color: txt }}>{node.label}</div>
                      <div className="text-xs leading-relaxed" style={{ color: sub }}>{node.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flow diagram */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: txt }}>Flux de données</h3>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {[
                  { label: "Utilisateur", cls: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "Frontend React", cls: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "API Express /api", cls: "bg-amber-50 border-amber-200 text-amber-700" },
                  { label: "Drizzle ORM", cls: "bg-purple-50 border-purple-200 text-purple-700" },
                  { label: "PostgreSQL", cls: "bg-green-50 border-green-200 text-green-700" },
                ].map((node, i, arr) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl border text-xs font-semibold ${node.cls}`}>{node.label}</div>
                    {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                {[
                  { label: "Protocole", val: "HTTPS TLS 1.3" },
                  { label: "Proxy", val: "Replit mTLS Proxy" },
                  { label: "Port API", val: "8080 (interne)" },
                  { label: "DB connexion", val: "Pool pg — DATABASE_URL" },
                  { label: "Sessions", val: "React state (JWT à venir)" },
                  { label: "Logs", val: "Pino + audit_logs table" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span style={{ color: sub }}>{label}</span>
                    <span className="font-mono font-semibold text-[10px]" style={{ color: txt }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Qualité des données ── */}
        {activeTab === "qualite" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: sub }}>Indicateurs de complétude et qualité des données en base</p>
              {statsLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
            </div>

            {stats ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Dossiers incomplets", val: stats.quality.dossiersIncomplets, total: stats.tables.dossiers, cls: "border-orange-200 text-orange-700 bg-orange-50", icon: AlertTriangle },
                    { label: "Emails manquants", val: stats.quality.emailsManquants, total: stats.tables.dossiers, cls: "border-red-200 text-red-700 bg-red-50", icon: XCircle },
                    { label: "Téléphones manquants", val: stats.quality.telephonesManquants, total: stats.tables.dossiers, cls: "border-red-200 text-red-700 bg-red-50", icon: XCircle },
                    { label: "Dossiers avec docs manquants", val: stats.quality.documentsManquants, total: stats.tables.dossiers, cls: "border-amber-200 text-amber-700 bg-amber-50", icon: AlertTriangle },
                    { label: "Scores non calculés", val: stats.quality.scoresNonCalcules, total: stats.tables.dossiers, cls: "border-purple-200 text-purple-700 bg-purple-50", icon: AlertTriangle },
                    { label: "Décisions en attente", val: stats.quality.decisionsNonRenseignees, total: stats.tables.dossiers, cls: "border-blue-200 text-blue-700 bg-blue-50", icon: AlertTriangle },
                  ].map(({ label, val, total, cls, icon: Icon }) => {
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    const ok = val === 0;
                    return (
                      <div key={label} className={`bg-white rounded-xl border shadow-sm p-4 ${cls.split(" ")[0]}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`text-2xl font-bold ${ok ? "text-emerald-600" : cls.split(" ")[1]}`}>{val}</div>
                          {ok
                            ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                            : <Icon className={`w-5 h-5 ${cls.split(" ")[1]}`} />}
                        </div>
                        <div className="text-xs font-medium mb-2" style={{ color: txt }}>{label}</div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ok ? "bg-emerald-400" : pct > 50 ? "bg-red-400" : "bg-amber-400"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: sub }}>{pct}% concernés sur {total} dossiers</div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: txt }}>Synthèse qualité</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Documents totaux en base", val: stats.tables.documents, ok: true },
                      { label: "Scores calculés", val: `${stats.tables.scores} / ${stats.tables.dossiers}`, ok: stats.tables.scores === stats.tables.dossiers },
                      { label: "Décisions rendues", val: `${stats.tables.decisions} / ${stats.tables.dossiers}`, ok: false },
                      { label: "Notifications générées", val: stats.tables.notifications, ok: true },
                      { label: "Entrées audit", val: stats.tables.auditLogs, ok: true },
                    ].map(({ label, val, ok }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div className="flex items-center gap-2 text-sm" style={{ color: sub }}>
                          {ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          {label}
                        </div>
                        <span className="font-semibold text-sm" style={{ color: txt }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : statsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-sm" style={{ color: sub }}>
                Données indisponibles — API non accessible
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
