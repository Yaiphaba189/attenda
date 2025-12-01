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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/30 rounded-full blur-3xl"></div>

        <h1 className="text-3xl font-bold text-center text-white mb-4 drop-shadow-lg relative z-10">Login to Attenda</h1>

        {/* Role Selection */}
        <div className="flex justify-center space-x-6 mb-6 relative z-10">
          {['admin', 'teacher', 'student'].map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                onChange={() => setRole(option)}
                className="form-radio text-green-500 focus:ring-green-500 bg-white/10 border-white/30"
              />
              <span className={`text-sm font-medium transition-colors ${role === option ? 'text-green-400' : 'text-gray-300 group-hover:text-white'}`}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </span>
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="relative group">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-400 transition-colors" size={20} />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
              required
            />
          </div>
          <div className="relative group">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-400 transition-colors" size={20} />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
              required
            />
          </div>

          {error && <div className="text-red-400 text-sm font-medium text-center bg-red-900/20 py-2 rounded border border-red-500/20">{error}</div>}

          <button
            type="submit"
            // disabled={loading} // Assuming 'loading' state is not defined yet, keeping it commented
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-500/20 hover:from-green-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* {loading ? 'Signing In...' : 'Sign In'} */} Sign In {/* Temporarily hardcoding 'Sign In' */}
          </button>
        </form>

        <div className="text-center mt-4 relative z-10">
          <a href="/forgot-password" className="text-sm text-green-400 hover:text-green-300 hover:underline font-medium transition-colors">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}

