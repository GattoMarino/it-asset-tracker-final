import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Definiamo la "forma" dei dati dell'utente che salveremo
interface User {
  id: number;
  email: string;
}

// Definiamo tutto ciò che il nostro contesto fornirà agli altri componenti:
// l'utente, se è autenticato, se sta ancora caricando, e le funzioni per login/logout.
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Creiamo il Contesto React
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creiamo il "Provider", il componente che conterrà tutta la logica
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inizia come "true" perché dobbiamo ancora controllare

  // Questo useEffect viene eseguito una sola volta, appena l'app si carica.
  // Il suo scopo è controllare se l'utente ha già una sessione attiva sul server.
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Chiamiamo l'API `/api/auth/me` che abbiamo creato.
        // Se la richiesta ha successo (status 200 OK), significa che l'utente è loggato.
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData); // Salviamo i dati dell'utente
        } else {
          setUser(null); // Altrimenti, l'utente non è loggato
        }
      } catch (error) {
        console.error("Errore nel controllo della sessione", error);
        setUser(null);
      } finally {
        // In ogni caso, abbiamo finito di controllare, quindi smettiamo di caricare.
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []); // L'array vuoto [] assicura che venga eseguito solo una volta

  // Funzione per aggiornare lo stato dopo un login riuscito
  const login = (userData: User) => {
    setUser(userData);
  };

  // Funzione per effettuare il logout
  const logout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error("Errore durante il logout:", error);
    } finally {
        setUser(null); // Rimuoviamo l'utente dallo stato
    }
  };

  // Il Provider rende disponibili i valori a tutti i suoi "figli"
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Creiamo un "hook" personalizzato per usare il contesto in modo più semplice e pulito
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};
