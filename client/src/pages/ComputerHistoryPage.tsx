import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, History, Activity } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Funzione per recuperare i dati del PC (per mostrare il seriale)
const fetchComputer = async (id: string) => {
  const res = await fetch(`/api/computers/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

// Funzione per recuperare lo storico completo dal nuovo endpoint
const fetchFullHistory = async (id: string) => {
  const res = await fetch(`/api/computers/${id}/full-history`, { credentials: 'include' });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

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
                  <div className={`absolute -left-[31px] top-1 flex items-center justify-center w-10 h-10 rounded-full ${item.type === 'history' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {item.type === 'history' ? <History size={20} /> : <Activity size={20} />}
                  </div>
                  <div className="ml-4">
                    <p className="font-bold capitalize text-gray-800">{item.title.replace(/_/g, ' ')}</p>
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