import { Link } from "react-router-dom";
import { DashboardLayout, FormCard } from "../../components";
import { FaUsers, FaBuilding, FaFileInvoiceDollar, FaTruck, FaBox, FaScroll, FaMoneyBillWave, FaChartBar, FaCog } from "react-icons/fa";
import { IconType } from "react-icons";
import { GiCoffin } from "react-icons/gi";

interface AdminCard {
  title: string;
  description: string;
  path: string;
  icon: IconType; // <-- store component type, not JSX
}

export default function AdminDashboard() {
  const cards: AdminCard[] = [
    { title: "Werknemers", description: "Voeg nieuwe werknemers toe of bewerk bestaande.", path: "/admin/employees", icon: FaUsers },
    { title: "Verzekeraars", description: "Voeg nieuwe verzekeraars toe of bewerk bestaande.", path: "/admin/verzekeraars", icon: FaBuilding },
    { title: "Financieel", description: "Bekijk en exporteer financiële gegevens van overledenen.", path: "/admin/facturen", icon: FaFileInvoiceDollar },
    { title: "Leveranciers", description: "Voeg nieuwe leveranciers toe of bewerk bestaande.", path: "/admin/suppliers", icon: FaTruck },
    { title: "Uitvaartkisten", description: "Voeg nieuwe uitvaartkisten toe of bewerk bestaande.", path: "/admin/coffins", icon: GiCoffin },
    { title: "Asbestemming", description: "Voeg nieuwe asbestemmingen toe of bewerk bestaande.", path: "/admin/ashes", icon: FaBox },
    { title: "Rouwbrieven", description: "Voeg nieuwe rouwbrieven toe of bewerk bestaande.", path: "/admin/letters", icon: FaScroll },
    { title: "Prijsafspraken", description: "Voeg nieuwe prijsafspraken toe of bewerk bestaande.", path: "/admin/pricecomponents", icon: FaMoneyBillWave },
    { title: "Rapportages", description: "Bekijk en exporteer rapportages.", path: "/admin/reports", icon: FaChartBar },
    { title: "Algemene Instellingen", description: "Systeem instellingen beheren.", path: "/admin/steenhouwerij", icon: FaCog },
  ];

  return (
    <DashboardLayout>
      <div className="px-8 py-6 max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon as unknown as React.ComponentType<{ size?: number; className?: string }>;
            return (
              <FormCard key={card.title} title={card.title}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={24} className="text-gray-700" />
                  <span className="text-gray-600 text-sm">{card.description}</span>
                </div>
                <Link
                  to={card.path}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mt-2 inline-block"
                >
                  Ga naar {card.title}
                </Link>
              </FormCard>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
