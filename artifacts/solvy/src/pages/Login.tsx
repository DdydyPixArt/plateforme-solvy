import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, Eye, EyeOff, ChevronRight, Lock, Mail } from "lucide-react";

interface LoginProps {
  onLogin: (role: string, name: string, initials: string) => void;
}

const profiles = [
  { id: "conseiller", label: "Conseiller bancaire", email: "s.martin@solvy-banque.fr", password: "••••••••", name: "Sophie Martin", initials: "SM", color: "text-blue-400" },
  { id: "analyste", label: "Analyste risque", email: "p.durand@solvy-banque.fr", password: "••••••••", name: "Pierre Durand", initials: "PD", color: "text-primary" },
  { id: "admin", label: "Administrateur SI", email: "i.bernard@solvy-banque.fr", password: "••••••••", name: "Isabelle Bernard", initials: "IB", color: "text-purple-400" },
];

export default function Login({ onLogin }: LoginProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProfileSelect = (profile: typeof profiles[0]) => {
    setSelectedProfile(profile.id);
    setEmail(profile.email);
    setPassword("motdepasse123");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const profile = profiles.find(p => p.email === email) || profiles[0];
    setTimeout(() => {
      onLogin(profile.id, profile.name, profile.initials);
      setLocation("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-[0.2em] text-foreground">SOLVY</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Plateforme d'aide à la décision<br />
            <span className="text-primary/80">Solvabilité client</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <h2 className="text-base font-semibold text-foreground mb-6">Connexion sécurisée</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                  placeholder="votre@email.fr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>Se connecter <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Profile selector */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Connexion rapide – Profil fictif</p>
            <div className="space-y-2">
              {profiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150 text-left ${
                    selectedProfile === profile.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className={`text-[10px] font-bold ${profile.color}`}>{profile.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{profile.name}</div>
                    <div className="text-[10px] text-muted-foreground">{profile.label}</div>
                  </div>
                  {selectedProfile === profile.id && <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          SOLVY v2.3.1 — Données fictives à des fins de démonstration<br />
          <span className="text-primary/60">Conformité RGPD · Traçabilité · Explicabilité du score</span>
        </p>
      </div>
    </div>
  );
}
