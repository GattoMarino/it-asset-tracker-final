// client/src/components/pc/PCEditModal.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertComputerSchema, type ComputerWithClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  AlertDialogTrigger,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


const editComputerSchema = insertComputerSchema.partial().extend({
  warrantyExpiry: z.date().optional().nullable(),
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
    if (pc) {
      form.reset({
        ...pc,
        warrantyExpiry: pc.warrantyExpiry ? new Date(pc.warrantyExpiry) : null,
      });
    }
  }, [pc, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: EditComputerSchema) => {
      if (!pc) return;
      const res = await apiRequest("PATCH", `/api/computers/${pc.id}`, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/computers"] });
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
      console.log("PC eliminato con successo!");
      onClose();
      setDeleteAlertOpen(false);
    },
  });


  const onSubmit = (values: EditComputerSchema) => {
    updateMutation.mutate(values);
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control