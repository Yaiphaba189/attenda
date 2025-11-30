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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-6">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Student Attendance</h2>
          <div className="mb-4">
            <label className="mr-2 font-semibold text-black">Month:</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="border px-2 py-1 rounded text-black font-semibold"
            />
          </div>
          {percentage !== null && (
            <div className="mb-4 text-lg font-semibold text-green-700">
              Attendance Percentage: {percentage}%
            </div>
          )}
          <table className="min-w-full text-sm bg-white rounded shadow">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Subject</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-4">No attendance records found.</td></tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id}>
                    <td className="py-1 px-3 text-black font-semibold">{rec.date.slice(0, 10)}</td>
                    <td className="py-1 px-3 text-black font-semibold">{rec.subject?.name || '-'}</td>
                    <td className="py-1 px-3 text-black font-semibold">{rec.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
