import { useQuery } from "@tanstack/react-query";
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
      <Card className="h-full"> {/* Aggiunto h-full per riempire l'altezza disponibile */}
        <CardHeader>
          <CardTitle className="text-center">Statistiche Cliente</CardTitle> {/* Titolo centrato */}
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
    <Card className="h-full"> {/* Aggiunto h-full per riempire l'altezza disponibile */}
      <CardHeader className="text-center"> {/* Header centrato per il titolo del cliente */}
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
            className="space-y-4" // Spazio leggermente ridotto per fare spazio alle cornici
          >
            {/* Ogni StatRow ora riceve una classe per la cornice e il colore */}
            <StatRow 
              icon={<HardDrive size={28} />} 
              label="Totale PC" 
              value={stats?.totalPCs}
              iconBgClass="bg-blue-100 text-blue-700"
              borderClass="border-blue-300 bg-blue-50"
            />
            <StatRow 
              icon={<Wrench size={28} />} 
              label="In Assistenza" 
              value={stats?.maintenancePCs} 
              iconBgClass="bg-yellow-100 text-yellow-700"
              borderClass="border-yellow-300 bg-yellow-50"
            />
            <StatRow 
              icon={<Laptop size={28} />} 
              label="Laptop" 
              value={stats?.laptops}
              iconBgClass="bg-green-100 text-green-700"
              borderClass="border-green-300 bg-green-50"
            />
            <StatRow 
              icon={<Monitor size={28} />} 
              label="Desktop" 
              value={stats?.desktops}
              iconBgClass="bg-purple-100 text-purple-700"
              borderClass="border-purple-300 bg-purple-50"
            />
            <StatRow 
              icon={<Server size={28} />} 
              label="Server" 
              value={stats?.servers}
              iconBgClass="bg-slate-100 text-slate-700"
              borderClass="border-slate-300 bg-slate-50"
            />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Interfaccia per le nuove props
interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: any;
  iconBgClass: string; // Classe per lo sfondo dell'icona (es. bg-blue-100)
  borderClass: string; // Classe per la cornice e lo sfondo della riga (es. border-blue-300 bg-blue-50)
}

// Componente StatRow aggiornato con le nuove classi
const StatRow = ({ icon, label, value, iconBgClass, borderClass }: StatRowProps) => (
  <div className={`flex items-center justify-between p-3 rounded-lg border ${borderClass}`}>
    <div className="flex items-center text-gray-800">
      <div className={`mr-4 w-10 h-10 flex items-center justify-center rounded-full ${iconBgClass}`}>
        {icon}
      </div>
      <span className="font-medium text-lg">{label}</span> {/* Testo label leggermente più grande */}
    </div>
    <span className="font-bold text-3xl text-gray-900">{value || 0}</span>
  </div>
);