import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Laptop, Wrench, HardDrive, Server, Monitor } from "lucide-react";
import type { Client } from "@shared/schema";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

interface ClientStatsProps {
  client: Client | null;
}

const fetchClientStats = async (clientId: number) => {
  const response = await fetch(`/api/clients/${clientId}/stats`);
  if (!response.ok) {
    throw new Error("Errore nel caricamento delle statistiche");
  }
  return response.json();
};

export default function ClientStats({ client }: ClientStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["clientStats", client?.id],
    queryFn: () => fetchClientStats(client!.id),
    enabled: !!client,
  });

  if (!client) {
    return (
      <Card className="h-full">
        <CardHeader>
          {/* Rimosso text-center */}
          <CardTitle>Statistiche Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-gray-500">
            <p>Seleziona un cliente dalla tabella per visualizzarne i dettagli.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      {/* --- 1. Rimosso text-center per allineare il titolo a sinistra --- */}
      <CardHeader>
        <motion.div
          key={client.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle>{client.name}</CardTitle>
          <CardDescription>Riepilogo del parco macchine</CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Caricamento statistiche...</div>
        ) : (
          <motion.div
            key={client.id}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <StatRow
              icon={<HardDrive size={28} />}
              label="Totale PC"
              value={stats?.totalPCs}
              iconBgClass="bg-blue-100 text-blue-700"
              borderClass="border-blue-200 bg-blue-50/60"
            />
            <StatRow
              icon={<Wrench size={28} />}
              label="In Assistenza"
              value={stats?.maintenancePCs}
              iconBgClass="bg-yellow-100 text-yellow-700"
              borderClass="border-yellow-200 bg-yellow-50/60"
            />
            <StatRow
              icon={<Laptop size={28} />}
              label="Laptop"
              value={stats?.laptops}
              iconBgClass="bg-green-100 text-green-700"
              borderClass="border-green-200 bg-green-50/60"
            />
            <StatRow
              icon={<Monitor size={28} />}
              label="Desktop"
              value={stats?.desktops}
              iconBgClass="bg-purple-100 text-purple-700"
              borderClass="border-purple-200 bg-purple-50/60"
            />
            <StatRow
              icon={<Server size={28} />}
              label="Server"
              value={stats?.servers}
              iconBgClass="bg-slate-100 text-slate-700"
              borderClass="border-slate-200 bg-slate-50/60"
            />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: any;
  iconBgClass: string;
  borderClass: string;
}

const StatRow = ({ icon, label, value, iconBgClass, borderClass }: StatRowProps) => (
  // --- 2. Aggiunto padding a destra (pr-6) per spostare il numero ---
  <motion.div variants={itemVariants} className={`flex items-center justify-between py-3 pl-3 pr-6 rounded-xl border ${borderClass}`}>
    <div className="flex items-center text-gray-800 w-2/3">
      <div className={`mr-4 w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
      <span className="font-medium text-lg">{label}</span>
    </div>
    <span className="font-bold text-3xl text-gray-900">{value || 0}</span>
  </motion.div>
);