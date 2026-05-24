import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, Eye, EyeOff, ChevronRight, Lock, Mail, Shield } from "lucide-react";

interface LoginProps {
  onLogin: (role: string, name: string, initials: string, email: string) => void;
}

const profiles = [
  { id: "conseiller", label: "Conseiller bancaire", email: "s.martin@solvy-banque.fr", name: "Sophie Martin", initials: "SM", color: "#60a5fa", desc: "Gestion & saisie des dossiers clients" },
  { id: "analyste", label: "Analyste risque", email: "p.durand@solvy-banque.fr", name: "Pierre Durand", initials: "PD", color: "hsl(43 57% 60%)", desc: "Scoring & décision de crédit" },
  { id: "admin", label: "Administrateur SI", email: "i.bernard@solvy-banque.fr", name: "Isabelle Bernard", initials: "IB", color: "#c084fc", desc: "Administration système & habilitations" },
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
      onLogin(profile.id, profile.name, profile.initials, profile.email);
      setLocation("/dashboard");
    }, 800);
  };

  /* Login page keeps the dark premium design */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "hsl(222 30% 8%)" }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "hsl(43 57% 54% / 0.06)" }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "hsl(43 57% 54% / 0.12)", border: "1px solid hsl(43 57% 54% / 0.3)" }}>
            <Building2 className="w-8 h-8" style={{ color: "hsl(43 57% 60%)" }} />
          </div>
          <h1 className="text-3xl font-bold tracking-[0.2em]" style={{ color: "hsl(220 20% 90%)" }}>SOLVY</h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "hsl(220 12% 52%)" }}>
            Plateforme d'aide à la décision<br />
            <span style={{ color: "hsl(43 57% 58%)" }}>Solvabilité client</span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{ background: "hsl(222 25% 11%)", border: "1px solid hsl(222 20% 20%)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4" style={{ color: "hsl(43 57% 56%)" }} />
            <h2 className="text-base font-semibold" style={{ color: "hsl(220 20% 88%)" }}>Connexion sécurisée</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest mb-2 block font-medium" style={{ color: "hsl(220 12% 48%)" }}>Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220 12% 40%)" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.fr" required
                  className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                  style={{
                    background: "hsl(222 25% 8%)",
                    border: "1px solid hsl(222 20% 22%)",
                    color: "hsl(220 20% 88%)"
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "hsl(43 57% 54%)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "hsl(222 20% 22%)")}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest mb-2 block font-medium" style={{ color: "hsl(220 12% 48%)" }}>Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220 12% 40%)" }} />
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none transition-all"
                  style={{
                    background: "hsl(222 25% 8%)",
                    border: "1px solid hsl(222 20% 22%)",
                    color: "hsl(220 20% 88%)"
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "hsl(43 57% 54%)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "hsl(222 20% 22%)")}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: "hsl(220 12% 42%)" }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full font-semibold py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              style={{ background: "hsl(43 57% 46%)", color: "hsl(0 0% 10%)" }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <>Se connecter <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Profile selector */}
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid hsl(222 20% 20%)" }}>
            <p className="text-[10px] uppercase tracking-widest mb-3 font-medium" style={{ color: "hsl(220 12% 38%)" }}>Connexion rapide – Profil fictif</p>
            <div className="space-y-2">
              {profiles.map(profile => (
                <button key={profile.id} onClick={() => handleProfileSelect(profile)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150 text-left"
                  style={selectedProfile === profile.id ? {
                    borderColor: "hsl(43 57% 46%)",
                    background: "hsl(43 57% 46% / 0.08)"
                  } : {
                    borderColor: "hsl(222 20% 20%)",
                    background: "transparent"
                  }}
                  onMouseEnter={e => { if (selectedProfile !== profile.id) e.currentTarget.style.borderColor = "hsl(222 20% 28%)"; }}
                  onMouseLeave={e => { if (selectedProfile !== profile.id) e.currentTarget.style.borderColor = "hsl(222 20% 20%)"; }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${profile.color}18`, border: `1px solid ${profile.color}40` }}>
                    <span className="text-[10px] font-bold" style={{ color: profile.color }}>{profile.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold" style={{ color: "hsl(220 20% 82%)" }}>{profile.name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "hsl(220 12% 44%)" }}>{profile.label} · {profile.desc}</div>
                  </div>
                  {selectedProfile === profile.id && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(43 57% 56%)" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: "hsl(220 12% 34%)" }}>
          SOLVY v2.3.1 — Données fictives à des fins de démonstration universitaire<br />
          <span style={{ color: "hsl(43 57% 40%)" }}>Conformité RGPD · Traçabilité · Explicabilité du score</span>
        </p>
      </div>
    </div>
  );
}
