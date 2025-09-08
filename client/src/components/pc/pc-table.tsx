import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, History } from "lucide-react";
import type { ComputerWithClient } from "@shared/schema";

// --- 1. NUOVO COMPONENTE PER L'ANIMAZIONE DI CARICAMENTO ---
const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2, // Ritardo tra i puntini
    },
  },
  end: {},
};

const loadingCircleVariants = {
  start: {
    y: "50%",
  },
  end: {
    y: "150%",
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  repeat: Infinity, // Ripete l'animazione all'infinito
  repeatType: "reverse" as const,
  ease: "easeInOut",
};

const LoadingIndicator = () => (
  <div className="flex items-center justify-center p-8 text-center text-gray-500">
    <span className="mr-2">Caricamento</span>
    <motion.div
      className="flex"
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      <motion.span
        className="block w-2 h-2 bg-gray-500 rounded-full mx-0.5"
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
      <motion.span
        className="block w-2 h-2 bg-gray-500 rounded-full mx-0.5"
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
      <motion.span
        className="block w-2 h-2 bg-gray-500 rounded-full mx-0.5"
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
    </motion.div>
  </div>
);
// -----------------------------------------------------------

const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const tableItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface PCTableProps {
  computers: ComputerWithClient[];
  isLoading: boolean;
  onViewPC: (pc: ComputerWithClient) => void;
  onEditPC: (pc: ComputerWithClient) => void;
}

export default function PCTable({ computers, isLoading, onViewPC, onEditPC }: PCTableProps) {
  const getStatusBadge = (status: string) => {
    // ... (funzione invariata)
  };

  const getWarrantyStatus = (warrantyExpiry: string | null) => {
    // ... (funzione invariata)
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        {/* --- 2. USO DEL NUOVO COMPONENTE DI CARICAMENTO --- */}
        <LoadingIndicator />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PC Info</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Assegnato a</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Garanzia</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            variants={tableContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {computers.map((pc) => (
              <motion.tr 
                key={pc.id} 
                variants={tableItemVariants}
                className="hover:bg-gray-50"
              >
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pc.serial}</div>
                    <div className="text-sm text-gray-500">{pc.brand} {pc.model}</div>
                    <div className="text-xs text-gray-400 capitalize">{pc.type}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{pc.client.name}</div>
                  {pc.client.type && (
                    <div className="text-xs text-gray-500">{pc.client.type}</div>
                  )}
                </TableCell>
                <TableCell>
                  {pc.assignedTo ? (
                    <div className="text-sm text-gray-900">{pc.assignedTo}</div>
                  ) : (
                    <div className="text-sm text-gray-500">Non assegnato</div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(pc.status)}
                </TableCell>
                <TableCell>
                  {getWarrantyStatus(pc.warrantyExpiry)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewPC(pc)}
                      className="text-primary hover:text-blue-800"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => onEditPC(pc)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <History size={16} />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </motion.tbody>
        </Table>
      </div>
      
      {!isLoading && !computers.length && (
        <div className="p-8 text-center text-gray-500">
          Nessun computer trovato con i filtri selezionati
        </div>
      )}
    </Card>
  );
}