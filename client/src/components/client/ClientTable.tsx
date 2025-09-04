// client/src/components/client/ClientTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react"; // Usiamo un'icona più adatta
import type { Client } from "@shared/schema";

interface ClientTableProps {
  clients: Client[];
  onViewPCs: (clientId: number) => void;
}

export default function ClientTable({ clients, onViewPCs }: ClientTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome Cliente</TableHead>
            <TableHead>Tipologia</TableHead>
            <TableHead>Indirizzo</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.type || 'N/D'}</TableCell>
              <TableCell className="text-gray-600">{client.address || 'N/D'}</TableCell>
              <TableCell className="text-right">
                {/* 1. Il bottone ora chiama la funzione onViewPCs con l'ID del cliente */}
                <Button variant="outline" size="sm" onClick={() => onViewPCs(client.id)}>
                  Visualizza PC
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}