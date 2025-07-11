import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";

const activitySchema = z.object({
  type: z.string().min(1, "Seleziona un tipo di attività"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  computerId: number;
}

const activityTypes = [
  { value: "hw_support", label: "Supporto Hardware" },
  { value: "sw_support", label: "Supporto Software" },
  { value: "local_assistance", label: "Assistenza Locale" },
  { value: "remote_assistance", label: "Assistenza Remoto" },
  { value: "other", label: "Altro" },
];

export default function ActivityForm({ computerId }: ActivityFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "",
      notes: "",
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", `/api/computers/${computerId}/activities`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/computers", computerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/computers", computerId, "activities"] });
      toast({
        title: "Attività aggiunta",
        description: "L'attività è stata registrata con successo.",
      });
      form.reset();
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante il salvataggio dell'attività",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createActivityMutation.mutate(data);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-2"
        size="sm"
      >
        <Plus size={16} />
        Aggiungi Attività
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova Attività</DialogTitle>
            <DialogDescription>
              Registra una nuova attività per questo PC
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo di Attività</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un tipo di attività" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (opzionale)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Aggiungi dettagli sull'attività svolta..."
                        rows={3}
                        {...field}
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
                  disabled={createActivityMutation.isPending}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={createActivityMutation.isPending}
                >
                  {createActivityMutation.isPending ? "Salvataggio..." : "Salva Attività"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}