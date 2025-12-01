"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button } from "@/components/ui";

export default function AttendanceClassSelect() {
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedId = localStorage.getItem("teacherId");
    if (storedId) setTeacherId(Number(storedId));
    else setTeacherId(9); // fallback
  }, []);

  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/teacher/${teacherId}/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setClasses(data.classes || []);
        setLoading(false);
      });
  }, [teacherId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-6">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Select a Class to Take Attendance</h2>
          {loading ? (
            <div className="text-center text-green-400">Loading...</div>
          ) : classes.length === 0 ? (
            <div className="text-center text-gray-400">No classes assigned.</div>
          ) : (
            <ul className="space-y-4">
              {classes.map((c) => (
                <li key={c.id}>
                  <Button
                    className="w-full justify-start text-lg py-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-green-500/50 transition-all duration-300 group"
                    onClick={() => router.push(`/teacher-dashboard/attendance/${c.id}`)}
                  >
                    <span className="font-semibold group-hover:text-green-400 transition-colors">{c.name}</span>
                    <span className="ml-auto text-sm text-gray-500 group-hover:text-green-500/70">ID: {c.id}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
