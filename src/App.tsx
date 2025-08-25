import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { CreateDeceased, CreateAdditionalInformation } from "./pages";

function App() {
  const auth = useContext(AuthContext);
  if(!auth) throw new Error("AuthContext not fond");
  const { user } = auth;
  const isAuthenticated = !!user;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protect "/" route */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/create-deceased"
          element={
              isAuthenticated ? <CreateDeceased /> : <Navigate to="/login" replace />
          }
        />

        <Route 
          path="/additional-information"
          element={
            isAuthenticated ? <CreateAdditionalInformation /> : <Navigate to="/login" replace />
          }
        />

        { /* Add other pages latere, e.g., /open-dossier, /all-dossiers, /admin */}
      </Routes>
    </Router>
  );
}

export default App;