import { useState, useEffect } from "react";
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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

interface AuthState {
  role: string;
  userName: string;
  userInitials: string;
}

function AppRouter() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [, setLocation] = useLocation();

  const handleLogin = (role: string, name: string, initials: string) => {
    setAuth({ role, userName: name, userInitials: initials });
  };

  const handleLogout = () => {
    setAuth(null);
    setLocation("/login");
  };

  if (!auth) {
    return (
      <Switch>
        <Route path="/" component={() => <Login onLogin={handleLogin} />} />
        <Route path="/login" component={() => <Login onLogin={handleLogin} />} />
        <Route component={() => <Login onLogin={handleLogin} />} />
      </Switch>
    );
  }

  const props = { role: auth.role, userName: auth.userName, userInitials: auth.userInitials, onLogout: handleLogout };

  return (
    <Switch>
      <Route path="/" component={() => <Dashboard {...props} />} />
      <Route path="/login" component={() => <Login onLogin={handleLogin} />} />
      <Route path="/dashboard" component={() => <Dashboard {...props} />} />
      <Route path="/nouveau-dossier" component={() => <NouveauDossier {...props} />} />
      <Route path="/dossier/:id" component={() => <DossierDetail {...props} />} />
      <Route path="/score/:id" component={() => <Score {...props} />} />
      <Route path="/analyste" component={() => <Analyste {...props} />} />
      <Route path="/audit" component={() => <Audit {...props} />} />
      <Route path="/admin" component={() => <Admin {...props} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
