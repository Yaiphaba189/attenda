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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Glassmorphism accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>

        <div className="text-center space-y-2 relative z-10">
          <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
          <p className="text-green-100/70 text-sm">Enter your email to receive a reset link</p>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-green-100/90">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-100/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all backdrop-blur-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-900/20 hover:shadow-green-800/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-100 px-4 py-3 rounded-xl text-sm text-center relative z-10 animate-fade-in">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-xl text-sm text-center relative z-10 animate-fade-in">
            {error}
          </div>
        )}

        <div className="text-center mt-4 relative z-10">
          <a href="/login" className="text-sm text-green-400 hover:text-green-300 hover:underline font-medium transition-colors">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
