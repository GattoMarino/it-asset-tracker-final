import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast"; // Importiamo il toast per gli errori

// Le tue funzioni sono perfette, le manteniamo
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    const errorMessage = errorData.message || "Si è verificato un errore";
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Usiamo apiRequest per coerenza, gestendo il metodo GET
    const res = await apiRequest("GET", queryKey.join("/") as string);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }
    
    // throwIfResNotOk è già in apiRequest, ma lo lasciamo per la gestione del 401
    await throwIfResNotOk(res);
    return await res.json();
  };

// --- MODIFICA PRINCIPALE QUI SOTTO ---
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // La tua configurazione per le query è già ottima
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      // Aggiungiamo questa sezione per gestire gli errori di tutte le mutazioni
      onError: (error) => {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      },
      retry: false,
    },
  },
});