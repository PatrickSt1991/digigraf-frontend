import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateDeceased from "./pages/CreateDeceased";

function App() {
  const isAuthenticated = !!localStorage.getItem("token"); // quick check for now

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
            path="/new-deceased"
            element={
                isAuthenticated ? <CreateDeceased /> : <Navigate to="/login" replace />
            }
        />

        { /* Add other pages latere, e.g., /open-dossier, /all-dossiers, /admin */}
      </Routes>
    </Router>
  );
}

export default App;