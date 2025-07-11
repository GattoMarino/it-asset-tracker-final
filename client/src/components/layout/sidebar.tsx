import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Laptop, 
  LayoutDashboard, 
  Building, 
  Plus, 
  BarChart3 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Gestione PC", href: "/computers", icon: Laptop },
  { name: "Clienti", href: "/clients", icon: Building },
  { name: "Aggiungi PC", href: "/add-pc", icon: Plus },
  { name: "Report", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <Laptop className="text-primary mr-2" size={24} />
          PC Asset Manager
        </h1>
      </div>
      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-6 py-3 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer",
                  isActive && "text-primary bg-blue-50 border-r-3 border-primary"
                )}
              >
                <Icon className="mr-3" size={20} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
