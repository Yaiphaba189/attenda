"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui";

interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  subject: { name: string };
}

export default function StudentAttendancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.studentId;
  const classId = searchParams.get("classId");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // 'YYYY-MM'
  });

  useEffect(() => {
    setError(null);
    if (!studentId || !classId) {
      setError("Missing student or class information in the URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch attendance records for this student, class, and month
    fetch(`/api/attendance/attendance/student/${studentId}?classId=${classId}&month=${month}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch attendance records");
        return res.json();
      })
      .then((data) => {
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load attendance records. " + err.message);
        setLoading(false);
      });
    // Fetch attendance percentage
    fetch(`/api/attendance/attendance/percentage?studentId=${studentId}&classId=${classId}&month=${month}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch attendance percentage");
        return res.json();
      })
      .then((data) => setPercentage(data.percentage ?? null))
      .catch((err) => setError("Could not load attendance percentage. " + err.message));
  }, [studentId, classId, month]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-6">
      <div className="max-w-4xl w-full mx-auto my-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Student Attendance</h2>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-green-100">Month:</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="bg-black/20 border border-green-800/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all [color-scheme:dark]"
              />
            </div>
            {percentage !== null && (
              <div className="text-lg font-bold text-green-400 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                Attendance: {percentage}%
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-green-400 border-b border-white/10">
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 text-left font-semibold">Subject</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-green-400">Loading...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">No attendance records found.</td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{rec.date.slice(0, 10)}</td>
                      <td className="py-3 px-4 text-gray-300">{rec.subject?.name || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${rec.status === "Present" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                            rec.status === "Absent" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              rec.status === "Late" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
