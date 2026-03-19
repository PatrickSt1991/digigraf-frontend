import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages";
import {
  Dashboard,
  Deceased,
  AdditionalInformationDeceased,
  InsuranceDeceased,
  DeceasedLayout,
  DeceasedFuneral,
  DeceasedDocuments,
  DeceasedInvoice,
  DeceasedServicesLayout,
  UpcomingFunerals,
  AllFunerals
} from "./pages/user";
import {
  AdminDashboard,
  AdminEmployee,
  AdminOverledenen,
  AdminInsurance,
  AdminSuppliers,
  AdminCoffins,
  AdminAsbestemming,
  AdminLicense,
  AdminLetters,
  AdminPriceComponents,
  AdminFinancial,
  AdminDocuments,
  AdminReport
} from "./pages/admin";
import { RequireUser } from "./routes/RequireUser";
import { RequireAdmin } from "./routes/RequireAdmin";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* User routes */}
        <Route path="/" element={<RequireUser><Dashboard /></RequireUser>} />
        <Route path="/dashboard" element={<RequireUser><Dashboard /></RequireUser>} />
        <Route path="/deceased/:dossierId?" element={<RequireUser><Deceased /></RequireUser>} />
        <Route path="/deceased-information/:dossierId?" element={<RequireUser><AdditionalInformationDeceased /></RequireUser>} />
        <Route path="/deceased-insurance/:dossierId?" element={<RequireUser><InsuranceDeceased /></RequireUser>} />
        <Route path="/deceased-layout/:dossierId?" element={<RequireUser><DeceasedLayout /></RequireUser>} />
        <Route path="/deceased-funeral/:dossierId?" element={<RequireUser><DeceasedFuneral /></RequireUser>} />
        <Route path="/deceased-documents/:dossierId?" element={<RequireUser><DeceasedDocuments /></RequireUser>} />
        <Route path="/deceased-invoice/:dossierId?" element={<RequireUser><DeceasedInvoice /></RequireUser>} />
        <Route path="/deceased-services/:dossierId?" element={<RequireUser><DeceasedServicesLayout /></RequireUser>} />
        <Route path="/upcoming" element={<RequireUser><UpcomingFunerals /></RequireUser>} />
        <Route path="/all-dossiers" element={<RequireUser><AllFunerals /></RequireUser>} />

        {/* Admin area access: everyone except medewerker */}
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/overledenen" element={<RequireAdmin><AdminOverledenen /></RequireAdmin>} />
        <Route path="/admin/employees" element={<RequireAdmin><AdminEmployee /></RequireAdmin>} />
        <Route path="/admin/insurance" element={<RequireAdmin><AdminInsurance /></RequireAdmin>} />
        <Route path="/admin/suppliers" element={<RequireAdmin><AdminSuppliers /></RequireAdmin>} />
        <Route path="/admin/coffins" element={<RequireAdmin><AdminCoffins /></RequireAdmin>} />
        <Route path="/admin/ashes" element={<RequireAdmin><AdminAsbestemming /></RequireAdmin>} />
        <Route path="/admin/letters" element={<RequireAdmin><AdminLetters /></RequireAdmin>} />
        <Route path="/admin/pricecomponents" element={<RequireAdmin><AdminPriceComponents /></RequireAdmin>} />
        <Route path="/admin/financial" element={<RequireAdmin><AdminFinancial /></RequireAdmin>} />
        <Route path="/admin/documents" element={<RequireAdmin><AdminDocuments /></RequireAdmin>} />
        <Route path="/admin/reports" element={<RequireAdmin><AdminReport /></RequireAdmin>} />
        <Route path="/admin/licenses" element={<RequireAdmin><AdminLicense /></RequireAdmin>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;