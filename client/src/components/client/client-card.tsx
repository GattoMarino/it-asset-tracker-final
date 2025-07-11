import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Eye, Download } from "lucide-react";
import type { Client } from "@shared/schema";

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  const { data: stats } = useQuery({
    queryKey: ["/api/clients", client.id, "stats"],
  });

  const { data: computers } = useQuery({
    queryKey: ["/api/computers", "", client.id.toString(), "", ""],
    queryFn: async () => {
      const response = await fetch(`/api/computers?clientId=${client.id}`);
      if (!response.ok) throw new Error("Failed to fetch computers");
      return response.json();
    },
  });

  const handleViewDetails = () => {
    // TODO: Navigate to client detail page
    console.log(`Viewing details for client ${client.id}`);
  };

  const handleDownloadReport = () => {
    // TODO: Generate client report
    console.log(`Downloading report for client ${client.id}`);
  };

  const desktopPercentage = stats ? (stats.desktopPCs / stats.totalPCs) * 100 : 0;
  const laptopPercentage = stats ? (stats.laptopPCs / stats.totalPCs) * 100 : 0;

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
          <Button variant="ghost" size="sm" onClick={handleViewDetails}>
            <ExternalLink size={16} />
          </Button>
        </div>
        {client.type && (
          <p className="text-sm text-gray-600 mt-1">{client.type}</p>
        )}
        {client.address && (
          <p className="text-xs text-gray-500 mt-1">{client.address}</p>
        )}
      </div>
      
      <CardContent className="p-6">
        {/* PC Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats?.totalPCs || 0}</div>
            <div className="text-xs text-gray-500">Totale PC</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.activePCs || 0}</div>
            <div className="text-xs text-gray-500">Attivi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats?.maintenancePCs || 0}</div>
            <div className="text-xs text-gray-500">Assistenza</div>
          </div>
        </div>

        {/* Status Distribution */}
        {stats?.totalPCs > 0 && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Desktop</span>
                <span className="text-sm font-medium">{stats.desktopPCs} PC</span>
              </div>
              <Progress value={desktopPercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Laptop</span>
                <span className="text-sm font-medium">{stats.laptopPCs} PC</span>
              </div>
              <Progress value={laptopPercentage} className="h-2 [&>div]:bg-blue-500" />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-100">
          <Button size="sm" className="flex-1" onClick={handleViewDetails}>
            <Eye className="mr-2" size={14} />
            Dettagli
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={handleDownloadReport}>
            <Download className="mr-2" size={14} />
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
