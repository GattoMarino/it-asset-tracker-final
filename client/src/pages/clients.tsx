import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ClientForm from "@/components/client/client-form";
import ClientTable from "@/components/client/ClientTable";
import ClientStats from "@/components/client/ClientStats";
import type { Client } from "@shared/schema";

export default function Clients() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const handleAddClient = () => {
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };
  
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-24 w-full bg-gray-200 animate-pulse mb-8 rounded-lg" />
        <div className="h-64 w-full bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Clienti</h2>
          <p className="text-gray-600">Seleziona un cliente per visualizzare i dettagli</p>
        </div>
        <Button onClick={handleAddClient} className="flex items-center">
          <Plus className="mr-2" size={16} />
          Aggiungi Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {clients && clients.length > 0 ? (
            <ClientTable 
              clients={clients} 
              onClientSelect={handleClientSelect}
              selectedClientId={selectedClient?.id}
            />
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-gray-500 mb-4">Nessun cliente presente nel sistema</p>
              <Button onClick={handleAddClient} variant="outline">
                <Plus className="mr-2" size={16} />
                Aggiungi il primo cliente
              </Button>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <ClientStats client={selectedClient} />
        </div>
      </div>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <ClientForm onCancel={handleCloseForm} onSuccess={handleCloseForm} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}