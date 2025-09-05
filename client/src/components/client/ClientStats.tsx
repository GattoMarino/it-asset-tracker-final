import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Laptop, Wrench, HardDrive, Server } from "lucide-react";
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
          <div className="text-center py-8 text-gray-500">
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
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Caricamento statistiche...</div>
        ) : (
          <div className="space-y-4">
            <StatRow icon={<HardDrive size={20} />} label="Totale PC" value={stats?.totalPCs} />
            <StatRow icon={<Wrench size={20} className="text-yellow-600"/>} label="In Assistenza" value={stats?.maintenancePCs} />
            <StatRow icon={<Laptop size={20} />} label="Desktop / Laptop" value={`${stats?.desktops || 0} / ${stats?.laptops || 0}`} />
            <StatRow icon={<Server size={20} />} label="Server" value={stats?.servers} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
  <div className="flex items-center justify-between text-sm p-2 rounded-md transition-colors hover:bg-gray-50">
    <div className="flex items-center text-gray-700">
      <div className="mr-3">{icon}</div>
      <span>{label}</span>
    </div>
    <span className="font-bold text-gray-900">{value || 0}</span>
  </div>
);