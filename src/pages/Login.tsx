import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import dgLogo from "../assets/dg.svg";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../api/authenticateApi";

const SAVED_EMAIL_KEY = "savedEmail";
const KEEP_SIGNED_IN_KEY = "keepSignedIn";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const { login, isAuthenticated, loading } = auth;

  useEffect(() => {
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    const savedKeepSignedIn = localStorage.getItem(KEEP_SIGNED_IN_KEY);

    if (savedEmail) {
      setEmail(savedEmail);

      requestAnimationFrame(() => {
        passwordInputRef.current?.focus();
      });
    }

    if (savedKeepSignedIn === "true") {
      setKeepSignedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const data = await loginUser(email, password, keepSignedIn);

      localStorage.setItem(SAVED_EMAIL_KEY, email);
      localStorage.setItem(KEEP_SIGNED_IN_KEY, String(keepSignedIn));

      login(data.user);
      navigate("/");
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError("Endpoint unavailable - please check your connection or try again later");
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear: number = new Date().getFullYear();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-2xl w-96 space-y-6"
      >
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16">
              <img
                src={dgLogo}
                alt="DG logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-3xl font-bold text-gray-800">DigiGraf</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-600 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600 font-medium">
              Wachtwoord
            </label>
            <input
              ref={passwordInputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="rounded"
            />
            <span>Onthoud mij</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between text-sm text-gray-500">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Wachtwoord vergeten?
          </Link>
          <Link to="/register" className="text-blue-600 hover:underline">
            Aanmelden
          </Link>
        </div>
      </form>

      <p className="mt-6 text-gray-500 text-sm">
        © {currentYear} Patrick Stel. Alle rechten voorbehouden.
      </p>
    </div>
  );
}