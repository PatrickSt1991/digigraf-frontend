import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components";
import { FaUsers, FaBuilding, FaFileInvoiceDollar, FaTruck, FaBox, FaScroll, FaMoneyBillWave, FaChartBar, FaCog } from "react-icons/fa";
import { IconType } from "react-icons";
import { GiCoffin } from "react-icons/gi";

interface AdminCard {
  title: string;
  description: string;
  path: string;
  icon: IconType;
  category: 'management' | 'financial' | 'inventory' | 'settings';
}

export default function AdminDashboard() {
  const cards: AdminCard[] = [
    { title: "Werknemers", description: "Voeg nieuwe werknemers toe of bewerk bestaande.", path: "/admin/employees", icon: FaUsers, category: 'management' },
    { title: "Verzekeraars", description: "Voeg nieuwe verzekeraars toe of bewerk bestaande.", path: "/admin/verzekeraars", icon: FaBuilding, category: 'management' },
    { title: "Leveranciers", description: "Voeg nieuwe leveranciers toe of bewerk bestaande.", path: "/admin/suppliers", icon: FaTruck, category: 'management' },
    { title: "Financieel", description: "Bekijk en exporteer financiële gegevens van overledenen.", path: "/admin/facturen", icon: FaFileInvoiceDollar, category: 'financial' },
    { title: "Prijsafspraken", description: "Voeg nieuwe prijsafspraken toe of bewerk bestaande.", path: "/admin/pricecomponents", icon: FaMoneyBillWave, category: 'financial' },
    { title: "Rapportages", description: "Bekijk en exporteer rapportages.", path: "/admin/reports", icon: FaChartBar, category: 'financial' },
    { title: "Uitvaartkisten", description: "Voeg nieuwe uitvaartkisten toe of bewerk bestaande.", path: "/admin/coffins", icon: GiCoffin, category: 'inventory' },
    { title: "Asbestemming", description: "Voeg nieuwe asbestemmingen toe of bewerk bestaande.", path: "/admin/ashes", icon: FaBox, category: 'inventory' },
    { title: "Rouwbrieven", description: "Voeg nieuwe rouwbrieven toe of bewerk bestaande.", path: "/admin/letters", icon: FaScroll, category: 'inventory' },
    { title: "Algemene Instellingen", description: "Systeem instellingen beheren.", path: "/admin/steenhouwerij", icon: FaCog, category: 'settings' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'management': return 'from-blue-500 to-blue-600';
      case 'financial': return 'from-green-500 to-green-600';
      case 'inventory': return 'from-purple-500 to-purple-600';
      case 'settings': return 'from-gray-500 to-gray-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'management': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'inventory': return 'bg-purple-100 text-purple-800';
      case 'settings': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'management': return 'Beheer';
      case 'financial': return 'Financieel';
      case 'inventory': return 'Voorraad';
      case 'settings': return 'Instellingen';
      default: return 'Algemeen';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-10">Administratie Dashboard</h1>
                <p className="text-gray-600">Beheer alle aspecten van het systeem vanaf één centrale locatie</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Laatst bijgewerkt</div>
                  <div className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('nl-NL')}</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  {(() => {
                    const CogIcon = FaCog as unknown as React.ComponentType<{ size?: number; className?: string }>;
                    return <CogIcon size={24} className="text-white" />;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => {
              const Icon = card.icon as unknown as React.ComponentType<{ size?: number; className?: string }>;
              return (
                <div 
                  key={card.title}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Card Header with Gradient */}
                  <div className={`h-2 bg-gradient-to-r ${getCategoryColor(card.category)}`}></div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(card.category)}`}>
                        {getCategoryName(card.category)}
                      </span>
                      <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(card.category)} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon size={20} className="text-white" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={card.path}
                      className={`inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r ${getCategoryColor(card.category)} text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm mt-auto`}
                    >
                      Beheren
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Systeem Overzicht</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Actieve Modules</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">10</div>
                <div className="text-sm text-gray-600">Beschikbare Functies</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Systeem Status</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">v2.1</div>
                <div className="text-sm text-gray-600">Huidige Versie</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}