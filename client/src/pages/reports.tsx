import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { FileText, FileSpreadsheet, Download } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("inventory");
  const [selectedClient, setSelectedClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("pdf");

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const quickReports = [
    {
      name: "Inventario Completo",
      icon: <FileText className="text-red-500" size={20} />,
      description: "Lista completa di tutti i PC nel sistema",
    },
    {
      name: "Scadenze Garanzie",
      icon: <FileSpreadsheet className="text-green-500" size={20} />,
      description: "PC con garanzie in scadenza nei prossimi 30 giorni",
    },
    {
      name: "Report Mensile",
      icon: <FileText className="text-blue-500" size={20} />,
      description: "Riepilogo attività del mese corrente",
    },
  ];

  const handleQuickReport = (reportName: string) => {
    // TODO: Implement quick report generation
    console.log(`Generating ${reportName}...`);
  };

  const handleCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement custom report generation
    console.log("Generating custom report...", {
      reportType,
      selectedClient,
      startDate,
      endDate,
      format,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Report e Analisi</h2>
        <p className="text-gray-600">Genera report dettagliati per i tuoi clienti e analisi del parco macchine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Reports */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Report Rapidi</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-3">
                {quickReports.map((report) => (
                  <Button
                    key={report.name}
                    variant="outline"
                    className="w-full justify-between h-auto p-4"
                    onClick={() => handleQuickReport(report.name)}
                  >
                    <div className="flex items-center">
                      {report.icon}
                      <div className="ml-3 text-left">
                        <div className="text-sm font-medium">{report.name}</div>
                        <div className="text-xs text-gray-500">{report.description}</div>
                      </div>
                    </div>
                    <Download className="text-gray-400" size={16} />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Report Generator */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Genera Report Personalizzato</h3>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleCustomReport} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportType">Tipo Report</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory">Inventario</SelectItem>
                        <SelectItem value="warranty">Garanzie</SelectItem>
                        <SelectItem value="maintenance">Manutenzioni</SelectItem>
                        <SelectItem value="assignment">Assegnazioni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="client">Cliente</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tutti i clienti" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutti i clienti</SelectItem>
                        {clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="startDate">Data Inizio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate">Data Fine</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Formato</Label>
                  <RadioGroup value={format} onValueChange={setFormat} className="flex space-x-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf">PDF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excel" id="excel" />
                      <Label htmlFor="excel">Excel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv">CSV</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button type="submit" className="w-full">
                  <Download className="mr-2" size={16} />
                  Genera Report
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
