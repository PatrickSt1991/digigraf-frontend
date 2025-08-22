import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSearch, FaCalendarAlt, FaUsers, FaUserShield } from "react-icons/fa";
import { IconType } from "react-icons";
import DashboardLayout from "../components/DashboardLayout"

interface MenuItem {
  label: string;
  icon: IconType;
  path: string;
  color: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = { name: "Test User", role: "Admin" };

  const menuItems: MenuItem[] = [
    { label: "Dossier aanmaken", icon: FaUser, path: "/new-deceased", color: "bg-red-600 hover:bg-red-700" },
    { label: "Dossier opzoeken", icon: FaSearch, path: "/open-dossier", color: "bg-red-600 hover:bg-red-700" },
    { label: "Alle uitvaarten", icon: FaUsers, path: "/all-dossiers", color: "bg-red-600 hover:bg-red-700" },
    { label: "Uitvaart agenda", icon: FaCalendarAlt, path: "/upcoming", color: "bg-red-600 hover:bg-red-700" },
    { label: "Beheer", icon: FaUserShield, path: "/admin", color: "bg-red-600 hover:bg-red-700" },
  ];

  return (
    <DashboardLayout user={user}>
      {/* Welcome text */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Welkom terug bij DigiGraf</h2>
        <p className="text-gray-600 text-lg">
          Kies uit onderstaande opties om te beginnen
        </p>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {menuItems.map((item) => {
          const Icon = item.icon as React.ElementType;
          return (
            <div
              key={item.label}
              className={`${item.color} text-white flex flex-col items-center justify-center p-10 rounded-2xl shadow-lg cursor-pointer transition transform hover:scale-105 hover:shadow-2xl`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={48} className="mb-4" />
              <span className="text-xl font-semibold text-center">{item.label}</span>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}