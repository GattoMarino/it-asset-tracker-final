import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import delle pagine
import Dashboard from "@/pages/dashboard";
import Computers from "@/pages/computers";
import Clients from "@/pages/clients";
import AddPC from "@/pages/add-pc";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import { Login } from "@/pages/Login"; // 1. CORREZIONE: Usa l'alias corretto "@/pages/Login"

// Componenti di layout
import Sidebar from "@/components/layout/sidebar";

// 2. Questo componente gestisce il layout "privato", con la sidebar
function PrivateLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/computers" component={Computers} />
          <Route path="/clients" component={Clients} />
          <Route path="/add-pc" component={AddPC} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

// 3. Il Router principale ora decide quale layout mostrare
function Router() {
  return (
    <Switch>
      {/* Rotta pubblica per il login */}
      <Route path="/login" component={Login} />

      {/* Tutte le altre rotte caricheranno il layout privato */}
      <Route>
        <PrivateLayout />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;