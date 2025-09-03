// client/src/components/pc/PCEditModal.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertComputerSchema, type ComputerWithClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
// import { toast } from "@/components/ui/use-toast"; // <-- RIMOSSO

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

const editComputerSchema = insertComputerSchema.partial();
type EditComputerSchema = z.infer<typeof editComputerSchema>;

interface PCEditModalProps {
  pc: ComputerWithClient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PCEditModal({ pc, isOpen, onClose }: PCEditModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditComputerSchema>({
    resolver: zodResolver(editComputerSchema),
    defaultValues: {
      serial: pc?.serial || "",
      brand: pc?.brand || "",
      model: pc?.model || "",
      assignedTo: pc?.assignedTo || "",
      notes: pc?.notes || "",
    },
  });

  useEffect(() => {
    if (pc) {
      form.reset({
        serial: pc.serial,
        brand: pc.brand,
        model: pc.model,
        assignedTo: pc.assignedTo || "",
        notes: pc.notes || "",
      });
    }
  }, [pc, form]);

  const mutation = useMutation({
    mutationFn: async (values: EditComputerSchema) => {
      if (!pc) return;
      const res = await apiRequest("PATCH", `/api/computers/${pc.id}`, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/computers"] });
      console.log("PC aggiornato con successo!"); // <-- SOSTITUITO IL TOAST CON UN LOG
      onClose();
    },
  });

  const onSubmit = (values: EditComputerSchema) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica PC</DialogTitle>
          <DialogDescription>
            Modifica i dettagli per il PC con seriale: {pc?.serial}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assegnato a</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome Cognome" {...field} />
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
                    <Textarea placeholder="Aggiungi note..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Annulla</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}