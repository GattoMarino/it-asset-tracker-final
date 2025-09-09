import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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

const loginSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(1, { message: "La password è obbligatoria" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

// Modificato per gestire la risposta 2FA
async function loginUser(data: LoginSchema) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const responseData = await res.json();
  if (!res.ok) {
    throw new Error(responseData.message || "Login fallito");
  }
  return responseData; // Restituisce i dati della risposta (es. { twoFactorRequired: true, email: '...' })
}

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  // Modificato per reindirizzare alla pagina 2FA
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Se il backend richiede la 2FA, reindirizza alla pagina di verifica
      if (data.twoFactorRequired) {
        setLocation(`/verify-2fa?email=${encodeURIComponent(data.email)}`);
      } else {
        // Fallback nel caso in cui la 2FA non sia richiesta
        setLocation("/");
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const onSubmit = (data: LoginSchema) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
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