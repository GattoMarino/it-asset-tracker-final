import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/dashboard";
import Computers from "@/pages/computers";
import Clients from "@/pages/clients";
import AddPC from "@/pages/add-pc";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import { Login } from "./pages/Login";
import { TwoFactorPage } from "./pages/TwoFactorPage"; // 1. Importa la nuova pagina

import Sidebar from "@/components/layout/sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";

function PrivateLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/computers" component={() => <ProtectedRoute component={Computers} />} />
          <Route path="/clients" component={() => <ProtectedRoute component={Clients} />} />
          <Route path="/add-pc" component={() => <ProtectedRoute component={AddPC} />} />
          <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      {/* 2. Aggiungi la nuova rotta per la 2FA */}
      <Route path="/verify-2fa" component={TwoFactorPage} />
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