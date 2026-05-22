import { useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NouveauDossier from "@/pages/NouveauDossier";
import DossierDetail from "@/pages/DossierDetail";
import Score from "@/pages/Score";
import Analyste from "@/pages/Analyste";
import Audit from "@/pages/Audit";
import Admin from "@/pages/Admin";
import DossiersIncomplets from "@/pages/DossiersIncomplets";
import ExportPDF from "@/pages/ExportPDF";
import MesDossiers from "@/pages/MesDossiers";
import DocumentsACollecter from "@/pages/DocumentsACollecter";
import Notifications from "@/pages/Notifications";
import AlertesConformite from "@/pages/AlertesConformite";
import Decisions from "@/pages/Decisions";
import HistoriqueAnalyse from "@/pages/HistoriqueAnalyse";
import Roles from "@/pages/Roles";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

interface AuthState { role: string; userName: string; userInitials: string; }

function AppRouter() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [, setLocation] = useLocation();

  const handleLogin = (role: string, name: string, initials: string) => {
    setAuth({ role, userName: name, userInitials: initials });
  };
  const handleLogout = () => { setAuth(null); setLocation("/login"); };

  if (!auth) {
    return (
      <Switch>
        <Route path="/" component={() => <Login onLogin={handleLogin} />} />
        <Route path="/login" component={() => <Login onLogin={handleLogin} />} />
        <Route component={() => <Login onLogin={handleLogin} />} />
      </Switch>
    );
  }

  const p = { role: auth.role, userName: auth.userName, userInitials: auth.userInitials, onLogout: handleLogout };

  return (
    <Switch>
      <Route path="/" component={() => <Dashboard {...p} />} />
      <Route path="/login" component={() => <Login onLogin={handleLogin} />} />
      <Route path="/dashboard" component={() => <Dashboard {...p} />} />

      {/* Conseiller */}
      <Route path="/mes-dossiers" component={() => <MesDossiers {...p} />} />
      <Route path="/nouveau-dossier" component={() => <NouveauDossier {...p} />} />
      <Route path="/dossiers-incomplets" component={() => <DossiersIncomplets {...p} />} />
      <Route path="/documents-a-collecter" component={() => <DocumentsACollecter {...p} />} />
      <Route path="/documents" component={() => <DocumentsACollecter {...p} />} />
      <Route path="/notifications" component={() => <Notifications {...p} />} />

      {/* Shared */}
      <Route path="/dossier/:id" component={() => <DossierDetail {...p} />} />
      <Route path="/score/:id" component={() => <Score {...p} />} />
      <Route path="/export/:id" component={() => <ExportPDF {...p} />} />
      <Route path="/audit" component={() => <Audit {...p} />} />

      {/* Analyste */}
      <Route path="/analyste" component={() => <Analyste {...p} />} />
      <Route path="/alertes-conformite" component={() => <AlertesConformite {...p} />} />
      <Route path="/alertes" component={() => <AlertesConformite {...p} />} />
      <Route path="/decisions" component={() => <Decisions {...p} />} />
      <Route path="/historique-analyse" component={() => <HistoriqueAnalyse {...p} />} />

      {/* Admin — URL-based tab routing */}
      <Route path="/admin" component={() => <Admin {...p} />} />
      <Route path="/admin/utilisateurs" component={() => <Admin {...p} />} />
      <Route path="/admin/roles" component={() => <Roles {...p} />} />
      <Route path="/admin/scoring" component={() => <Admin {...p} />} />
      <Route path="/admin/logs" component={() => <Admin {...p} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
