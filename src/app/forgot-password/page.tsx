"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("http://localhost:3001/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("If this email exists, a reset link has been sent.");
      } else {
        setError(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">Forgot Password</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors shadow"
          >
            Send Reset Link
          </button>
        </form>
        {message && <div className="text-green-600 text-sm text-center">{message}</div>}
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
