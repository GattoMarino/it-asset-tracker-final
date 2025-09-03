import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Aggiungi useQueryClient
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import PCTable from "@/components/pc/pc-table";
import PCDetailModal from "@/components/pc/pc-detail-modal";
import PCEditModal from "@/components/pc/PCEditModal"; // 1. Importa il nuovo componente
import type { ComputerWithClient } from "@shared/schema";

export default function Computers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  
  const [selectedPC, setSelectedPC] = useState<ComputerWithClient | null>(null);
  const [editingPC, setEditingPC] = useState<ComputerWithClient | null>(null); // 2. Aggiungi stato per il PC in modifica

  const queryClient = useQueryClient(); // Inizializza il queryClient

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: computers, isLoading } = useQuery({
    queryKey: ["/api/computers", searchQuery, selectedClient, selectedStatus, selectedBrand],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (selectedClient && selectedClient !== "all") params.append("clientId", selectedClient);
      if (selectedStatus && selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedBrand && selectedBrand !== "all") params.append("brand", selectedBrand);
      
      const response = await fetch(`/api/computers?${params.toString()}`, {
        credentials: "include", // Assicuriamoci di inviare i cookie
      });
      if (!response.ok) throw new Error("Failed to fetch computers");
      return response.json();
    },
  });

  const handleViewPC = (pc: ComputerWithClient) => {
    setSelectedPC(pc);
  };

  // 3. Aggiungi la funzione per aprire il modal di modifica
  const handleEditPC = (pc: ComputerWithClient) => {
    setEditingPC(pc);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Gestione PC</h2>
        <p className="text-gray-600">Visualizza e gestisci tutti i computer aziendali</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2">Cerca PC</Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Seriale, modello, assegnato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i clienti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i clienti</SelectItem>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Stato</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="maintenance">In Assistenza</SelectItem>
                  <SelectItem value="dismissed">Dismesso</SelectItem>
                  <SelectItem value="preparation">In Preparazione</SelectItem>
                  <SelectItem value="storage">In Magazzino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Marca</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le marche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le marche</SelectItem>
                  <SelectItem value="dell">Dell</SelectItem>
                  <SelectItem value="hp">HP</SelectItem>
                  <SelectItem value="lenovo">Lenovo</SelectItem>
                  <SelectItem value="asus">Asus</SelectItem>
                  <SelectItem value="acer">Acer</SelectItem>
                  <SelectItem value="apple">Apple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PC Table */}
      <PCTable 
        computers={computers || []} 
        isLoading={isLoading}
        onViewPC={handleViewPC}
        onEditPC={handleEditPC} // 4. Passa la nuova funzione alla tabella
      />

      {/* PC Detail Modal */}
      {selectedPC && (
        <PCDetailModal 
          pc={selectedPC} 
          isOpen={!!selectedPC}
          onClose={() => setSelectedPC(null)}
        />
      )}

      {/* 5. Renderizza il nuovo modal di modifica */}
      {editingPC && (
        <PCEditModal
          pc={editingPC}
          isOpen={!!editingPC}
          onClose={() => setEditingPC(null)}
        />
      )}
    </div>
  );
}