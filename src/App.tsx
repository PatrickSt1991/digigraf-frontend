import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Login, Dashboard, Deceased, AdditionalInformationDeceased, InsuranceDeceased } from "./pages";
import LayoutDeceased from "./pages/LayoutDeceased";
import FuneralDeceased from "./pages/FuneralDeceased";
import FuneralDocuments from "./pages/FuneralDocuments";

function App() {
  const auth = useContext(AuthContext);
  if(!auth) throw new Error("AuthContext not fond");
  const { user } = auth;
  const isAuthenticated = !!user;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={ isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace /> } />
        <Route path="/dashboard" element={ isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace /> } />
        <Route path="/deceased/:overledeneId?" element={ isAuthenticated ? <Deceased /> : <Navigate to="/login" replace /> } />
        <Route path="/additional-information/:overledeneId?" element={ isAuthenticated ? <AdditionalInformationDeceased /> : <Navigate to="/login" replace /> } />
        <Route path="/insurance-information/:overledeneId?" element={ isAuthenticated ? <InsuranceDeceased /> : <Navigate to="/login" replace /> } />
        <Route path="/layout-information/:overledeneId?" element={ isAuthenticated ? <LayoutDeceased /> : <Navigate to="/login" replace /> } />
        <Route path="/funeral-information/:overledeneId?" element={ isAuthenticated ? <FuneralDeceased /> : <Navigate to="/login" replace /> } />
        <Route path="/funeral-documents/:overledeneId?" element={ isAuthenticated ? <FuneralDocuments /> : <Navigate to="/login" replace /> } />
      </Routes>
    </Router>
  );
}

export default App;