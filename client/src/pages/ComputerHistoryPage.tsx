import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowLeft, 
  History, 
  Activity,
  // --- 1. IMPORT NUOVE ICONE ---
  PlusCircle,
  User,
  UserX,
  RefreshCw,
  StickyNote,
  Wrench,
  Code,
  Building,
  Globe,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const fetchComputer = async (id: string) => {
  const res = await fetch(`/api/computers/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

const fetchFullHistory = async (id: string) => {
  const res = await fetch(`/api/computers/${id}/full-history`, { credentials: 'include' });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

// --- 2. AGGIUNTE FUNZIONI PER GESTIRE LE ICONE ---
const getActionIcon = (action: string) => {
  switch (action) {
    case "created": return <PlusCircle size={20} className="text-blue-500" />;
    case "assigned": return <User size={20} className="text-green-500" />;
    case "unassigned": return <UserX size={20} className="text-red-500" />;
    case "status_changed": return <RefreshCw size={20} className="text-yellow-500" />;
    case "note_added": return <StickyNote size={20} className="text-purple-500" />;
    default: return <History size={20} className="text-gray-500" />;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "hw_support": return <Wrench size={20} className="text-orange-500" />;
    case "sw_support": return <Code size={20} className="text-indigo-500" />;
    case "local_assistance": return <Building size={20} className="text-cyan-500" />;
    case "remote_assistance": return <Globe size={20} className="text-sky-500" />;
    case "other": return <ClipboardList size={20} className="text-gray-500" />;
    default: return <ClipboardList size={20} className="text-gray-500" />;
  }
};

const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "hw_support": return "Supporto Hardware";
      case "sw_support": return "Supporto Software";
      case "local_assistance": return "Assistenza Locale";
      case "remote_assistance": return "Assistenza Remota";
      case "other": return "Altro";
      default: return type.replace(/_/g, ' ');
    }
};
// ---------------------------------------------------

export default function ComputerHistoryPage() {
  const params = useParams();
  const pcId = params.id;

  const { data: pc, isLoading: isLoadingPC } = useQuery({
    queryKey: ['computer', pcId],
    queryFn: () => fetchComputer(pcId!),
    enabled: !!pcId,
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['computerFullHistory', pcId],
    queryFn: () => fetchFullHistory(pcId!),
    enabled: !!pcId,
  });

  const isLoading = isLoadingPC || isLoadingHistory;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Link href="/computers">
        <a className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Torna a Gestione PC
        </a>
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Storico Completo</CardTitle>
          {isLoading ? (
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mt-1"></div>
          ) : (
            <CardDescription>Timeline di tutte le attività per il PC: {pc?.serial}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 space-y-8 border-l-2 border-gray-200">
            {isLoading ? (
              <p>Caricamento storico...</p>
            ) : history?.length ? (
              history.map((item: any) => (
                <div key={item.id} className="relative">
                  {/* --- 3. LOGICA PER VISUALIZZARE L'ICONA CORRETTA --- */}
                  <div className="absolute -left-[31px] top-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2">
                    {item.type === 'history' ? getActionIcon(item.title) : getActivityIcon(item.title)}
                  </div>
                  <div className="ml-4">
                    <p className="font-bold capitalize text-gray-800">
                      {item.type === 'history' ? item.title.replace(/_/g, ' ') : getActivityTypeLabel(item.title)}
                    </p>
                    <p className="text-sm text-gray-700">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(item.date), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Nessuna attività da mostrare.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}