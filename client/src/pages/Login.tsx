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
import loginImage from "@/assets/login-image.png"; 

const loginSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(1, { message: "La password è obbligatoria" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

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
  return responseData;
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

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.twoFactorRequired) {
        setLocation(`/verify-2fa?email=${encodeURIComponent(data.email)}`);
      } else {
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
    <div className="grid lg:grid-cols-2 min-h-screen"> 
      {/* --- MODIFICA QUI: Sfumatura più scura e d'impatto --- */}
      <div className="hidden lg:flex items-center justify-center p-8 
                      bg-gradient-to-br from-slate-900 to-slate-700">
        <img 
          src={loginImage} 
          alt="Login Illustration" 
          className="max-w-full max-h-full object-contain" 
        />
      </div>
      
      <div className="flex items-center justify-center p-8 lg:p-12 bg-white">
        <Card className="w-full max-w-[350px]">
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
    </div>
  );
}