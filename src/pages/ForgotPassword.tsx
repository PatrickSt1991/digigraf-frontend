import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dgLogo from "../assets/dg.svg";
import { AuthContext } from "../context/AuthContext";
import { forgotPassword } from "../api/authenticateApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const { isAuthenticated, loading } = auth;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (newPassword !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await forgotPassword(email, birthDate, newPassword);
      setSuccess(true);
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError("Server niet bereikbaar. Controleer uw verbinding.");
      } else {
        setError(err.message || "Wachtwoord reset mislukt.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 shadow-lg rounded-2xl w-96 space-y-6 text-center">
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14">
                <img src={dgLogo} alt="DG logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-bold text-gray-800">DigiGraf</span>
            </div>
          </div>
          <div className="bg-green-100 text-green-700 p-4 rounded-lg">
            <p className="font-medium">Wachtwoord gewijzigd!</p>
            <p className="text-sm mt-1">U kunt nu inloggen met uw nieuwe wachtwoord.</p>
          </div>
          <Link
            to="/login"
            className="block w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition text-center"
          >
            Naar inloggen
          </Link>
        </div>
        <p className="mt-6 text-gray-500 text-sm">
          © {currentYear} Patrick Stel. Alle rechten voorbehouden.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-2xl w-96 space-y-5"
      >
        <div className="flex flex-col items-center mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14">
              <img src={dgLogo} alt="DG logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-3xl font-bold text-gray-800">DigiGraf</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Wachtwoord vergeten</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-gray-600 font-medium text-sm">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600 font-medium text-sm">Geboortedatum</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600 font-medium text-sm">Nieuw wachtwoord</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600 font-medium text-sm">Wachtwoord bevestigen</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Bezig..." : "Wachtwoord wijzigen"}
        </button>

        <p className="text-center text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 hover:underline">
            Terug naar inloggen
          </Link>
        </p>
      </form>

      <p className="mt-6 text-gray-500 text-sm">
        © {currentYear} Patrick Stel. Alle rechten voorbehouden.
      </p>
    </div>
  );
}
