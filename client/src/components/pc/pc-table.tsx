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
import { Eye, Edit } from "lucide-react";
import type { ComputerWithClient } from "@shared/schema";

const loadingContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const loadingDotVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const LoadingIndicator = () => (
  <div className="flex items-center justify-center p-8 text-center text-gray-500 text-lg">
    <span className="mr-3">Caricamento</span>
    <motion.div
      className="flex h-6 items-center"
      variants={loadingContainerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.span
        className="block w-3 h-3 bg-gray-500 rounded-full"
        variants={loadingDotVariants}
      />
      <motion.span
        className="block w-3 h-3 bg-gray-500 rounded-full mx-1.5"
        variants={loadingDotVariants}
      />
      <motion.span
        className="block w-3 h-3 bg-gray-500 rounded-full"
        variants={loadingDotVariants}
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
              <TableHead className="w-[20%]">PC Info</TableHead>
              <TableHead className="w-[15%]">Hostname</TableHead>
              <TableHead className="w-[20%]">Cliente</TableHead>
              <TableHead className="w-[15%]">Assegnato a</TableHead>
              <TableHead className="w-[10%]">Stato</TableHead>
              <TableHead className="w-[15%]">Garanzia</TableHead>
              <TableHead className="w-[5%] text-right pr-4"></TableHead> 
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
                  {/* --- MODIFICA QUI --- */}
                  <div className="text-base font-medium text-gray-900">
                    {pc.hostname ? (
                      <span>{pc.hostname}</span>
                    ) : (
                      <span className="italic text-gray-400">N/D</span>
                    )}
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
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewPC(pc)}
                      className="text-primary hover:text-blue-800"
                    >
                      <Eye size={24} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => onEditPC(pc)}
                    >
                      <Edit size={24} />
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