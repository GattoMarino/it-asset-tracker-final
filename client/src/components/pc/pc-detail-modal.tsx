import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Edit, History, Clock, Activity } from "lucide-react";
import type { ComputerWithClient, ComputerHistory, ComputerActivity } from "@shared/schema";
import ActivityForm from "./activity-form";
import PCEditForm from "./pc-edit-form";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface PCDetailModalProps {
  pc: ComputerWithClient;
  isOpen: boolean;
  onClose: () => void;
}

export default function PCDetailModal({ pc, isOpen, onClose }: PCDetailModalProps) {
  const { data: pcDetails } = useQuery({
    queryKey: ["/api/computers", pc.id],
    enabled: isOpen,
  });

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return "🆕";
      case "assigned":
        return "👤";
      case "status_changed":
        return "🔄";
      case "note_added":
        return "📝";
      default:
        return "ℹ️";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "border-blue-400";
      case "assigned":
        return "border-green-400";
      case "unassigned":
        return "border-red-400";
      case "status_changed":
        return "border-yellow-400";
      case "note_added":
        return "border-purple-400";
      default:
        return "border-gray-400";
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "hw_support":
        return "Supporto Hardware";
      case "sw_support":
        return "Supporto Software";
      case "local_assistance":
        return "Assistenza Locale";
      case "remote_assistance":
        return "Assistenza Remoto";
      case "other":
        return "Altro";
      default:
        return type;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "hw_support":
        return "🔧";
      case "sw_support":
        return "💻";
      case "local_assistance":
        return "🏢";
      case "remote_assistance":
        return "🌐";
      case "other":
        return "📋";
      default:
        return "📋";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Dettagli PC - {pc.serial}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PC Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Informazioni Hardware</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seriale:</span>
                    <span className="font-medium">{pc.serial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marca:</span>
                    <span className="font-medium capitalize">{pc.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modello:</span>
                    <span className="font-medium">{pc.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipologia:</span>
                    <span className="font-medium capitalize">{pc.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{pc.client.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assegnato a:</span>
                    <span className="font-medium">{pc.assignedTo || "Non assegnato"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stato:</span>
                    {getStatusBadge(pc.status)}
                  </div>
                  {pc.warrantyExpiry && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scadenza Garanzia:</span>
                      <span className="font-medium">
                        {new Date(pc.warrantyExpiry).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History and Activities Section */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History size={16} />
                      Storico Assegnazioni
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="flex items-center gap-2">
                      <Activity size={16} />
                      Attività di Supporto
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="history" className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">Storico Assegnazioni</h4>
                      {pcDetails && <PCEditForm pc={pcDetails} />}
                    </div>
                    
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {pcDetails?.history?.length ? (
                        pcDetails.history.map((entry: ComputerHistory) => (
                          <div key={entry.id} className={`border-l-4 ${getActionColor(entry.action)} pl-4 py-2`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="mr-2">{getActionIcon(entry.action)}</span>
                                  <p className="font-medium text-gray-800">{entry.description}</p>
                                </div>
                                {entry.newValue && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Nuovo valore: {entry.newValue}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 ml-4">
                                <Clock size={12} className="mr-1" />
                                {formatDistanceToNow(new Date(entry.createdAt), { 
                                  addSuffix: true, 
                                  locale: it 
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">Nessuna assegnazione registrata</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activities" className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">Attività di Supporto</h4>
                      <ActivityForm computerId={pc.id} />
                    </div>
                    
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {pcDetails?.activities && pcDetails.activities.length > 0 ? (
                        pcDetails.activities.map((activity: ComputerActivity) => (
                          <div key={activity.id} className="border-l-4 border-blue-400 pl-4 py-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="mr-2">{getActivityIcon(activity.type)}</span>
                                  <p className="font-medium text-gray-800">{getActivityTypeLabel(activity.type)}</p>
                                </div>
                                {activity.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 ml-4">
                                <Clock size={12} className="mr-1" />
                                {formatDistanceToNow(new Date(activity.createdAt), { 
                                  addSuffix: true, 
                                  locale: it 
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">Nessuna attività registrata</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Current Notes */}
          {pc.notes && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Note Correnti</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{pc.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button variant="outline">
              <Printer className="mr-2" size={16} />
              Stampa
            </Button>
            <Button variant="outline" className="text-yellow-600 border-yellow-600 hover:bg-yellow-50">
              <Edit className="mr-2" size={16} />
              Modifica
            </Button>
            <Button>
              <History className="mr-2" size={16} />
              Storico Completo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
