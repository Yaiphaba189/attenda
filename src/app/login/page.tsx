"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError("Invalid response from server.");
        return;
      }
      if (!res.ok || !data.success) {
        setError(data.message || "Login failed");

        return;
      }
  
      

    // Redirect based on role
if (data.user.role === "admin") {
  router.push("/admin-dashboard");
} else if (data.user.role === "teacher") {
  // Store teacher ID in localStorage for dashboard use
  localStorage.setItem("teacherId", data.user.id);
  router.push("/teacher-dashboard");
} else {
  // Store student user in localStorage for dashboard use
  localStorage.setItem("studentUser", JSON.stringify(data.user));
  router.push("/student-dashboard");
}
    } catch (err) {
      setError("An error occurred during login.");
    }
  };




  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">Login to Attenda</h1>
        {/* Role Selection */}
        <div className="flex justify-center gap-6 mb-4">
          {['admin', 'teacher', 'student'].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                onChange={() => setRole(option)}
                className="accent-red-600"
              />
              <span className="text-sm font-medium text-neutral-900 drop-shadow-sm">{option}</span>
            </label>
          ))}
        </div>
        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaEnvelope />
            </span>
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm font-medium text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors shadow"
          >
            Sign In
          </button>
        </form>
        <div className="text-center mt-2">
          <a
            href="/forgot-password"
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}

