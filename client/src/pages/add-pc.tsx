import { Card, CardContent } from "@/components/ui/card";
import PCForm from "@/components/pc/pc-form";

export default function AddPC() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Aggiungi Nuovo PC</h2>
        <p className="text-gray-600">Inserisci le informazioni del nuovo computer da aggiungere al sistema</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <PCForm />
        </CardContent>
      </Card>
    </div>
  );
}
