import { useLocation, Link } from "wouter";
import { LayoutDashboard, FolderPlus, ShieldAlert, History, Settings, LogOut, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  role?: string;
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/nouveau-dossier", label: "Nouveau dossier", icon: FolderPlus },
  { href: "/analyste", label: "Analyste risque", icon: ShieldAlert },
  { href: "/audit", label: "Audit & Traçabilité", icon: History },
  { href: "/admin", label: "Administration", icon: Settings },
];

const roleLabels: Record<string, string> = {
  conseiller: "Conseiller bancaire",
  analyste: "Analyste risque",
  admin: "Administrateur SI",
};

export default function Layout({ children, role = "conseiller", userName = "Sophie Martin", userInitials = "SM", onLogout }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <div>
            <div className="text-lg font-bold tracking-widest text-foreground">SOLVY</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Aide à la décision</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Profil actif</div>
          <div className="text-xs font-medium text-primary">{roleLabels[role] || role}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                    active
                      ? "bg-sidebar-accent text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{userName}</div>
              <div className="text-[10px] text-muted-foreground">{roleLabels[role] || role}</div>
            </div>
            <button
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card/50 flex-shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
