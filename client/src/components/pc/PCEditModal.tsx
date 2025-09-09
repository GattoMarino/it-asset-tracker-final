import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertComputerSchema, type ComputerWithClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Usiamo z.coerce.date() per la conversione automatica, come nello schema principale
const editComputerSchema = insertComputerSchema.partial().extend({
  warrantyExpiry: z.coerce.date().optional().nullable(),
});
type EditComputerSchema = z.infer<typeof editComputerSchema>;

interface PCEditModalProps {
  pc: ComputerWithClient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PCEditModal({ pc, isOpen, onClose }: PCEditModalProps) {
  const queryClient = useQueryClient();
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const form = useForm<EditComputerSchema>({
    resolver: zodResolver(editComputerSchema),
  });

  useEffect(() => {
    if (pc && isOpen) {
      form.reset({
        ...pc,
        warrantyExpiry: pc.warrantyExpiry ? new Date(pc.warrantyExpiry) : null,
      });
    }
  }, [pc, isOpen, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: EditComputerSchema) => {
      if (!pc) return;
      const res = await apiRequest("PATCH", `/api/computers/${pc.id}`, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/computers"] });
      queryClient.invalidateQueries({ queryKey: ["clientStats", pc?.clientId] });
      console.log("PC aggiornato con successo!");
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!pc) return;
      await apiRequest("DELETE", `/api/computers/${pc.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/computers"] });
      queryClient.invalidateQueries({ queryKey: ["clientStats", pc?.clientId] });
      console.log("PC eliminato con successo!");
      onClose();
      setDeleteAlertOpen(false);
    },
  });

  const onSubmit = (values: EditComputerSchema) => {
    updateMutation.mutate(values);
  };

  if (!pc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifica PC</DialogTitle>
          <DialogDescription>
            Modifica i dettagli per il PC con seriale: {pc?.serial}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona uno stato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Attivo</SelectItem>
                        <SelectItem value="maintenance">In Assistenza</SelectItem>
                        <SelectItem value="dismissed">Dismesso</SelectItem>
                        <SelectItem value="preparation">In Preparazione</SelectItem>
                        <SelectItem value="storage">In Magazzino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* --- RIPRISTINATO IL CAMPO DATA SEMPLICE E FUNZIONANTE --- */}
              <FormField
                control={form.control}
                name="warrantyExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scadenza Garanzia</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assegnato a</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome Cognome" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Aggiungi note..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="!justify-between pt-4 sm:pt-6">
              <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Elimina
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione non può essere annullata. Eliminerà permanentemente il PC e tutti i suoi dati associati.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? "Eliminazione..." : "Sì, elimina"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose}>Annulla</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}