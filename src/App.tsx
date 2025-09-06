import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Login, Dashboard, Deceased, AdditionalInformationDeceased, InsuranceDeceased, DeceasedLayout, DeceasedFuneral, 
  DeceasedDocuments, DeceasedInvoice, DeceasedServicesLayout  } from "./pages";

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
        <Route path="/deceased-information/:overledeneId?" element={ isAuthenticated ? <AdditionalInformationDeceased /> : <Navigate to="/login" replace /> } />
        <Route path="/deceased-insurance/:overledeneId?" element={ isAuthenticated ? <InsuranceDeceased /> : <Navigate to="/login" replace /> } />
        <Route path="/deceased-layout/:overledeneId?" element={ isAuthenticated ? <DeceasedLayout /> : <Navigate to="/login" replace /> } />
        <Route path="/deceased-funeral/:overledeneId?" element={ isAuthenticated ? <DeceasedFuneral /> : <Navigate to="/login" replace /> } />
        <Route path="/deceased-documents/:overledeneId?" element={ isAuthenticated ? <DeceasedDocuments /> : <Navigate to="/login" replace /> } />
        <Route path="/deceaded-invoice/:overledeneId?" element={ isAuthenticated ? <DeceasedInvoice /> : <Navigate to="/login" replace /> } />
        <Route path="/deceased-services/:overledeneId?" element={ isAuthenticated ? <DeceasedServicesLayout /> : <Navigate to="/login" replace /> } />
      </Routes>
    </Router>
  );
}

export default App;