import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as DgLogo } from "../assets/dg.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:5027/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError(
          "Endpoint unavailable - please check your connection or try again later"
        );
      } else {
        setError(err.message || "Login failed");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Logo */}


      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-2xl w-96 space-y-6"
      >
      <div className="flex flex-col items-center mb-8">
        {/* Logo and text */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16">
            <DgLogo className="w-full h-full object-contain" />
          </div>
          <span className="text-3xl font-bold text-gray-800">DigiGraf</span>
        </div>

        {/* Welcome heading */}
        <h1 className="text-2xl font-semibold text-center text-gray-700">
          Welkom Terug
        </h1>
      </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-600 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-gray-500 text-sm">
        © 2025 DigiGraf. All rights reserved.
      </p>
    </div>
  );
}