import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Laptop, 
  CheckCircle, 
  Wrench, 
  AlertTriangle,
  Edit,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const { data: warrantyAlerts } = useQuery({
    queryKey: ["/api/dashboard/warranty-alerts"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created":
      case "assigned":
        return <Plus className="text-blue-500" size={16} />;
      case "status_changed":
        return <Edit className="text-yellow-500" size={16} />;
      default:
        return <Edit className="text-blue-500" size={16} />;
    }
  };

  const getWarrantyBadge = (warrantyExpiry: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(warrantyExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiry <= 7) {
      return <Badge variant="destructive">Urgente</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-700">Attenzione</Badge>;
    }
    return <Badge variant="secondary">OK</Badge>;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Panoramica generale del parco macchine aziendale</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Laptop className="text-primary" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totale PC</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalPCs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">PC Attivi</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.activePCs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Wrench className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Assistenza</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.maintenancePCs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Garanzia Scadente</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.expiringSoon || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Warranty Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Attività Recenti</h3>
          </div>
          <CardContent className="p-6">
            {recentActivity?.length ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { 
                          addSuffix: true, 
                          locale: it 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nessuna attività recente</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Avvisi Garanzia</h3>
          </div>
          <CardContent className="p-6">
            {warrantyAlerts?.length ? (
              <div className="space-y-4">
                {warrantyAlerts.slice(0, 5).map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <AlertTriangle className="text-red-600" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{alert.serial}</p>
                        <p className="text-xs text-gray-500">
                          Scade il {new Date(alert.warrantyExpiry).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    {getWarrantyBadge(alert.warrantyExpiry)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nessun avviso garanzia</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
