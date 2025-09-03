// client/src/pages/Login.tsx

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

// Importa i componenti UI che useremo da shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// 1. Definiamo lo schema di validazione con Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(1, { message: "La password è obbligatoria" }),
});

// Inferiamo il tipo dal nostro schema Zod
type LoginSchema = z.infer<typeof loginSchema>;

// Funzione per effettuare la chiamata API di login
async function loginUser(data: LoginSchema) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include", // Invia i cookie con la richiesta
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Login fallito");
  }

  return res.json();
}

export function Login() {
  // 2. State per gestire i messaggi di errore
  const [error, setError] = useState<string | null>(null);
  
  // Hook per la navigazione da wouter
  const [, setLocation] = useLocation();

  // 3. usiamo React Hook Form con Zod per la validazione
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  // 4. Usiamo TanStack Query per gestire la chiamata API
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      // Se il login ha successo, reindirizza alla dashboard
      setLocation("/");
    },
    onError: (err) => {
      // Se c'è un errore, mostralo all'utente
      setError(err.message);
    },
  });

  // 5. Funzione che viene chiamata al submit del form
  const onSubmit = (data: LoginSchema) => {
    setError(null); // Resetta l'errore precedente
    mutation.mutate(data); // Esegui la chiamata API
  };

  // 6. JSX per renderizzare il form
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Accedi al tuo account per continuare.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="tua@email.com" {...register("email")} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
            </div>
             {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Accesso in corso..." : "Accedi"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}