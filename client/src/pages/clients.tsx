import { useQuery } from "@tanstack/react-query";
import ClientCard from "@/components/client/client-card";

export default function Clients() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Clienti</h2>
          <p className="text-gray-600">Overview completa dei PC gestiti per ogni cliente</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Clienti</h2>
        <p className="text-gray-600">Overview completa dei PC gestiti per ogni cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients?.map((client: any) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {!clients?.length && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun cliente presente nel sistema</p>
        </div>
      )}
    </div>
  );
}
