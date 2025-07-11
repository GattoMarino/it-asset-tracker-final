import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import type { z } from "zod";

const formSchema = insertClientSchema;

type FormData = z.infer<typeof formSchema>;

interface ClientFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ClientForm({ onCancel, onSuccess }: ClientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      address: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente aggiunto con successo",
        description: "Il nuovo cliente è stato aggiunto al sistema.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiunta del cliente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createClientMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Cliente *</FormLabel>
              <FormControl>
                <Input placeholder="Inserisci nome del cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Denominazione</FormLabel>
              <FormControl>
                <Input placeholder="Es. S.r.l., S.p.A., Ditta Individuale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sede Legale</FormLabel>
              <FormControl>
                <Input placeholder="Inserisci indirizzo sede legale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2" size={16} />
            Annulla
          </Button>
          <Button type="submit" disabled={createClientMutation.isPending}>
            <Save className="mr-2" size={16} />
            {createClientMutation.isPending ? "Salvataggio..." : "Salva Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}