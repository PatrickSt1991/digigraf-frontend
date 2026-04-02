import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import dgLogo from "../assets/dg.svg";
import { AuthContext } from "../context/AuthContext";
import { selfRegisterUser } from "../api/authenticateApi";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tussenvoegsel, setTussenvoegsel] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await selfRegisterUser({
        firstName,
        lastName,
        tussenvoegsel: tussenvoegsel || undefined,
        email,
        birthDate,
        password,
        mobile: mobile || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError("Server niet bereikbaar. Controleer uw verbinding.");
      } else {
        setError(err.message || "Registratie mislukt.");
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
            <p className="font-medium">Account aangemaakt!</p>
            <p className="text-sm mt-1">
              Uw account is aangemaakt met beperkte toegang. Een beheerder zal uw rechten instellen.
            </p>
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
          <p className="text-gray-500 text-sm mt-2">Account aanmaken</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 text-gray-600 font-medium text-sm">Voornaam</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
              />
            </div>
            <div className="w-20">
              <label className="block mb-1 text-gray-600 font-medium text-sm">Tussenvoegsel</label>
              <input
                type="text"
                value={tussenvoegsel}
                onChange={(e) => setTussenvoegsel(e.target.value)}
                autoComplete="additional-name"
                placeholder="van"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-600 font-medium text-sm">Achternaam</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
            />
          </div>

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
            <label className="block mb-1 text-gray-600 font-medium text-sm">
              Mobiel <span className="text-gray-400 font-normal">(optioneel)</span>
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600 font-medium text-sm">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {submitting ? "Bezig..." : "Account aanmaken"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Al een account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inloggen
          </Link>
        </p>
      </form>

      <p className="mt-6 text-gray-500 text-sm">
        © {currentYear} Patrick Stel. Alle rechten voorbehouden.
      </p>
    </div>
  );
}
