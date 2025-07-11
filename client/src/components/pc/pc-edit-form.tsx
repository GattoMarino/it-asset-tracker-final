import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit } from "lucide-react";
import type { ComputerWithHistory } from "@shared/schema";

const editSchema = z.object({
  assignedTo: z.string().nullable(),
});

type FormData = z.infer<typeof editSchema>;

interface PCEditFormProps {
  pc: ComputerWithHistory;
}

export default function PCEditForm({ pc }: PCEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      assignedTo: pc.assignedTo || "",
    },
  });

  const updatePCMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const updateData = {
        assignedTo: data.assignedTo || null,
      };
      return apiRequest("PATCH", `/api/computers/${pc.id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/computers", pc.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/computers"] });
      toast({
        title: "PC aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'aggiornamento del PC",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updatePCMutation.mutate(data);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        size="sm"
      >
        <Edit size={16} className="mr-2" />
        Modifica
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica PC - {pc.serial}</DialogTitle>
            <DialogDescription>
              Modifica l'assegnazione del PC. Le modifiche alle assegnazioni vengono registrate automaticamente nello storico.
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
                      <Input 
                        placeholder="Nome della persona a cui è assegnato il PC"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={updatePCMutation.isPending}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={updatePCMutation.isPending}
                >
                  {updatePCMutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}