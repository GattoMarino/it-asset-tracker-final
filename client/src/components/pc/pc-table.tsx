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

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
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
  repeat: Infinity,
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
  // --- 1. LOGICA RIPRISTINATA ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Attivo</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">In Assistenza</Badge>;
      case "dismissed":
        return <Badge className="bg-gray-100 text-gray-800">Dismesso</Badge>;
      case "preparation":
        return <Badge className="bg-blue-100 text-blue-800">In Preparazione</Badge>;
      case "storage":
        return <Badge className="bg-purple-100 text-purple-800">In Magazzino</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // --- 2. LOGICA RIPRISTINATA ---
  const getWarrantyStatus = (warrantyExpiry: string | null) => {
    if (!warrantyExpiry) return <span className="text-gray-500">N/A</span>;
    
    const expiryDate = new Date(warrantyExpiry);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return (
        <>
          <div className="text-sm text-gray-900">{expiryDate.toLocaleDateString('it-IT')}</div>
          <div className="text-xs text-red-600">Scaduta</div>
        </>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <>
          <div className="text-sm text-gray-900">{expiryDate.toLocaleDateString('it-IT')}</div>
          <div className="text-xs text-yellow-600">{daysUntilExpiry} giorni rimanenti</div>
        </>
      );
    } else {
      const monthsRemaining = Math.floor(daysUntilExpiry / 30);
      return (
        <>
          <div className="text-sm text-gray-900">{expiryDate.toLocaleDateString('it-IT')}</div>
          <div className="text-xs text-green-600">{monthsRemaining} mesi rimanenti</div>
        </>
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
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