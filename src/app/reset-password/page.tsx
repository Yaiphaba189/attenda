"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("http://localhost:3001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password reset successful. You can now log in.");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">Reset Password</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors shadow"
          >
            Reset Password
          </button>
        </form>
        {message && <div className="text-green-600 text-sm text-center">{message}</div>}
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
