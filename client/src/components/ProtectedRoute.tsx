// client/src/components/ProtectedRoute.tsx

import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { type ComponentType } from "react";

// Funzione per controllare lo stato dell'utente
const fetchUser = async () => {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null; // Non autorizzato
  if (!res.ok) throw new Error("Errore nel recuperare l'utente");
  return await res.json();
};

export const ProtectedRoute = ({ component: Component }: { component: ComponentType }) => {
  // Usiamo useQuery per chiedere al backend "chi sono?"
  const { data: user, isLoading, error } = useQuery({ 
    queryKey: ['me'], 
    queryFn: fetchUser,
    retry: false // Non tentare di nuovo se riceviamo 401
  });

  if (isLoading) {
    // Mostra un caricamento mentre verifichiamo la sessione
    return <div>Caricamento...</div>;
  }

  if (error || !user) {
    // Se c'è un errore o l'utente non è loggato, reindirizza a /login
    return <Redirect to="/login" />;
  }

  // Se l'utente è loggato, mostra il componente della pagina richiesta
  return <Component />;
};