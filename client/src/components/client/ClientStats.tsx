import { useQuery } from "@tanstack/react-query"; // <-- CORREZIONE QUI
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Laptop, Wrench, HardDrive, Server, Monitor } from "lucide-react";
import type { Client } from "@shared/schema";

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
      <Card>
        <CardHeader>
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
    <Card>
      <CardHeader>
        <CardTitle>{client.name}</CardTitle>
        <CardDescription>Riepilogo del parco macchine</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Caricamento statistiche...</div>
        ) : (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <StatRow icon={<HardDrive size={24} className="text-blue-500" />} label="Totale PC" value={stats?.totalPCs} />
            <StatRow icon={<Wrench size={24} className="text-yellow-500"/>} label="In Assistenza" value={stats?.maintenancePCs} />
            <StatRow icon={<Laptop size={24} className="text-green-500" />} label="Laptop" value={stats?.laptops} />
            <StatRow icon={<Monitor size={24} className="text-purple-500" />} label="Desktop" value={stats?.desktops} />
            <StatRow icon={<Server size={24} className="text-slate-600" />} label="Server" value={stats?.servers} />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
  <div className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-50">
    <div className="flex items-center text-gray-800">
      <div className="mr-4">{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
    <span className="font-bold text-xl text-gray-900">{value || 0}</span>
  </div>
);