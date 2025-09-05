import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DgLogo } from "../assets/dg.svg";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md w-full fixed top-0 left-0 z-50">
        <div className="mx-auto flex items-center justify-between p-4">
          <Link to="/dashboard">
            <div className="flex items-center space-x-4 ml-5">
              <div className="w-10 h-10 sm:w-12 md:w-16 flex-shrink-0">
                <DgLogo className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg">DigiGraf</span>
            </div>
          </Link>
          <div className="mr-8">
            {user ? `${user.fullName || user.email} (${user.roles?.join(", ")})` : "Onbekend"}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-15 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
