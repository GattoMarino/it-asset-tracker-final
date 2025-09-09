import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function TwoFactorPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const email = new URLSearchParams(window.location.search).get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/"; // Forzo un ricaricamento completo per aggiornare lo stato di autenticazione
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Verifica fallita.");
      }
    } catch {
      setError("Errore di connessione.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Email non trovata. <Link href="/login" className="underline">Torna al login</Link>.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle>Verifica a due fattori</CardTitle>
          <CardDescription>
            Inserisci il codice a 6 cifre che abbiamo inviato a {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting || otp.length < 6}>
              {isSubmitting ? "Verifica in corso..." : "Verifica"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}