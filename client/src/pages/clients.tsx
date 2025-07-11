import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ClientCard from "@/components/client/client-card";
import ClientForm from "@/components/client/client-form";

export default function Clients() {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const handleAddClient = () => {
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Clienti</h2>
          <p className="text-gray-600">Overview completa dei PC gestiti per ogni cliente</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Clienti</h2>
            <p className="text-gray-600">Overview completa dei PC gestiti per ogni cliente</p>
          </div>
          <Button onClick={handleAddClient} className="flex items-center">
            <Plus className="mr-2" size={16} />
            Aggiungi Cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients?.map((client: any) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {!clients?.length && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nessun cliente presente nel sistema</p>
          <Button onClick={handleAddClient} variant="outline">
            <Plus className="mr-2" size={16} />
            Aggiungi il primo cliente
          </Button>
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <ClientForm 
              onCancel={handleCloseForm}
              onSuccess={handleCloseForm}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
