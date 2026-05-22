import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, FolderPlus, History, Settings, LogOut, ChevronRight,
  Building2, FolderOpen, AlertCircle, FileCheck, Bell, Shield,
  BarChart3, AlertTriangle, CheckSquare, Clock, Users, KeyRound,
  FileText, Terminal, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  role?: string;
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
}

const roleLabels: Record<string, string> = {
  conseiller: "Conseiller bancaire",
  analyste: "Analyste risque",
  admin: "Administrateur SI",
};

const roleBadgeBg: Record<string, string> = {
  conseiller: "bg-blue-500/15 border-blue-400/25 text-blue-300",
  analyste: "bg-amber-500/15 border-amber-400/25 text-amber-300",
  admin: "bg-purple-500/15 border-purple-400/25 text-purple-300",
};

const conseillerNav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/mes-dossiers", label: "Mes dossiers", icon: FolderOpen },
  { href: "/nouveau-dossier", label: "Nouveau dossier", icon: FolderPlus },
  { href: "/dossiers-incomplets", label: "Dossiers incomplets", icon: AlertCircle, badge: 1 },
  { href: "/documents-a-collecter", label: "Documents à collecter", icon: FileCheck },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
];

const analysteNav = [
  { href: "/dashboard", label: "Tableau de bord risque", icon: BarChart3 },
  { href: "/analyste", label: "Dossiers à analyser", icon: FolderOpen, badge: 2 },
  { href: "/score/d1", label: "Scoring", icon: Shield },
  { href: "/alertes-conformite", label: "Alertes conformité", icon: AlertTriangle, badge: 3 },
  { href: "/decisions", label: "Décisions", icon: CheckSquare },
  { href: "/historique-analyse", label: "Historique d'analyse", icon: Clock },
];

const adminNav = [
  { href: "/dashboard", label: "Tableau de bord admin", icon: LayoutDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/roles", label: "Rôles & habilitations", icon: KeyRound },
  { href: "/admin/scoring", label: "Paramètres scoring", icon: Settings },
  { href: "/admin/logs", label: "Logs système", icon: Terminal },
  { href: "/audit", label: "Audit global", icon: BookOpen },
];

const navByRole: Record<string, typeof conseillerNav> = {
  conseiller: conseillerNav,
  analyste: analysteNav,
  admin: adminNav,
};

export default function Layout({ children, role = "conseiller", userName = "Sophie Martin", userInitials = "SM", onLogout }: LayoutProps) {
  const [location] = useLocation();
  const navItems = navByRole[role] || conseillerNav;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(220 20% 96%)" }}>
      {/* Sidebar — dark premium */}
      <aside className="w-64 flex flex-col flex-shrink-0" style={{ background: "hsl(222 30% 10%)", borderRight: "1px solid hsl(222 20% 18%)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid hsl(222 20% 18%)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(43 57% 54%)" }}>
            <Building2 className="w-5 h-5" style={{ color: "#1a1200" }} strokeWidth={2} />
          </div>
          <div>
            <div className="text-lg font-bold tracking-widest" style={{ color: "hsl(220 20% 90%)" }}>SOLVY</div>
            <div className="text-[10px]" style={{ color: "hsl(220 12% 50%)" }}>Aide à la décision</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(222 20% 18%)" }}>
          <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "hsl(220 12% 45%)" }}>Espace</div>
          <div className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border w-fit", roleBadgeBg[role] || roleBadgeBg.conseiller)}>
            {roleLabels[role] || role}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, badge }: any) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative",
                  active ? "font-medium" : "hover:opacity-100"
                )}
                style={active ? {
                  background: "hsl(43 57% 54% / 0.12)",
                  color: "hsl(43 57% 64%)",
                  borderLeft: "2px solid hsl(43 57% 54%)",
                  paddingLeft: "10px"
                } : {
                  color: "hsl(220 15% 60%)",
                  display: "flex",
                }}>
                <Icon className="w-4 h-4 flex-shrink-0 opacity-70 group-hover:opacity-100"
                  style={{ color: active ? "hsl(43 57% 60%)" : undefined }} />
                <span className="flex-1 group-hover:text-white transition-colors">{label}</span>
                {badge && (
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(6 78% 54%)", color: "white" }}>
                    {badge}
                  </span>
                )}
                {active && !badge && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(43 57% 54%)" }} />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid hsl(222 20% 18%)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "hsl(222 25% 14%)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(43 57% 54% / 0.2)", border: "1px solid hsl(43 57% 54% / 0.4)" }}>
              <span className="text-xs font-bold" style={{ color: "hsl(43 57% 60%)" }}>{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: "hsl(220 20% 85%)" }}>{userName}</div>
              <div className="text-[10px]" style={{ color: "hsl(220 12% 45%)" }}>{roleLabels[role] || role}</div>
            </div>
            <button onClick={onLogout} title="Déconnexion"
              className="transition-colors hover:text-red-400 opacity-50 hover:opacity-100"
              style={{ color: "hsl(220 12% 55%)" }}>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content — light */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: {
  title: string; subtitle?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-8 py-5 flex-shrink-0"
      style={{ background: "white", borderBottom: "1px solid hsl(220 15% 88%)" }}>
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "hsl(220 25% 14%)" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "hsl(220 12% 48%)" }}>{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
