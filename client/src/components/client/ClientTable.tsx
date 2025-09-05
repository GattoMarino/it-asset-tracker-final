import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@shared/schema";

interface ClientTableProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
  selectedClientId?: number | null;
}

export default function ClientTable({ clients, onClientSelect, selectedClientId }: ClientTableProps) {
  return (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome Cliente</TableHead>
            <TableHead>Denominazione</TableHead>
            <TableHead>Indirizzo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.id}
              onClick={() => onClientSelect(client)}
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedClientId === client.id ? 'bg-blue-50' : ''}`}
            >
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.type || 'N/D'}</TableCell>
              <TableCell className="text-gray-600">{client.address || 'N/D'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}