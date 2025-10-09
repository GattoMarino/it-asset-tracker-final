import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowLeft, 
  History, 
  Activity,
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

// --- VARIANTI PER L'ANIMAZIONE ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const getActionIcon = (action: string) => {
  // ... (funzione invariata)
};

const getActivityIcon = (type: string) => {
  // ... (funzione invariata)
};

const getActivityTypeLabel = (type: string) => {
  // ... (funzione invariata)
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
          <div className="relative pl-6 border-l-2 border-gray-200">
            {isLoading ? (
              <p className="p-4">Caricamento storico...</p>
            ) : history?.length ? (
              <motion.div
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {history.map((item: any) => (
                  <motion.div key={item.id} variants={itemVariants} className="relative">
                    <div className="absolute -left-[31px] top-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2">
                      {item.type === 'history' ? getActionIcon(item.title) : getActivityIcon(item.title)}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold capitalize text-gray-800">
                        {item.type === 'history' ? item.title.replace(/_/g, ' ') : getActivityTypeLabel(item.title)}
                      </p>
                      
                      {/* --- VISUALIZZAZIONE DETTAGLI AGGIUNTIVI --- */}
                      <p className="text-sm text-gray-700">{item.description}</p>
                      {item.type === 'history' && item.newValue && (
                        <p className="text-sm text-gray-500 mt-1 pl-1 border-l-2 border-gray-300">
                          Nuovo valore: <span className="font-medium text-gray-600">{item.newValue}</span>
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(item.date), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-gray-500 py-4">Nessuna attività da mostrare.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}