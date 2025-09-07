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
  DeceasedServicesLayout
} from "./pages/user";
import {
  AdminDashboard,
  AdminOverledenen,
} from "./pages/admin";
import { RequireUser } from "./routes/RequireUser";
import { RequireAdmin } from "./routes/RequireAdmin";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* User routes (all require authentication) */}
        <Route path="/" element={<RequireUser><Dashboard /></RequireUser>} />
        <Route path="/dashboard" element={<RequireUser><Dashboard /></RequireUser>} />
        <Route path="/deceased/:overledeneId?" element={<RequireUser><Deceased /></RequireUser>} />
        <Route path="/deceased-information/:overledeneId?" element={<RequireUser><AdditionalInformationDeceased /></RequireUser>} />
        <Route path="/deceased-insurance/:overledeneId?" element={<RequireUser><InsuranceDeceased /></RequireUser>} />
        <Route path="/deceased-layout/:overledeneId?" element={<RequireUser><DeceasedLayout /></RequireUser>} />
        <Route path="/deceased-funeral/:overledeneId?" element={<RequireUser><DeceasedFuneral /></RequireUser>} />
        <Route path="/deceased-documents/:overledeneId?" element={<RequireUser><DeceasedDocuments /></RequireUser>} />
        <Route path="/deceased-invoice/:overledeneId?" element={<RequireUser><DeceasedInvoice /></RequireUser>} />
        <Route path="/deceased-services/:overledeneId?" element={<RequireUser><DeceasedServicesLayout /></RequireUser>} />

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/overledenen" element={<RequireAdmin><AdminOverledenen /></RequireAdmin>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
