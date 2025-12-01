"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, Button } from "@/components/ui";

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId;
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({}); // status string
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [percentages, setPercentages] = useState<Record<number, number>>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  useEffect(() => {
    if (!classId) return;
    const teacherId = localStorage.getItem("teacherId") || "9";
    fetch(`/api/teacher/${teacherId}/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = (data.students || []).filter((s: any) => s.classId == classId);
        setStudents(filtered);
        setAttendance(Object.fromEntries(filtered.map((s: any) => [s.id, "Present"])));
        setLoading(false);
        // Fetch attendance percentages for each student
        Promise.all(filtered.map(async (s: any) => {
          const res = await fetch(`/api/attendance/attendance/percentage?studentId=${s.id}&classId=${classId}`);
          const data = await res.json();
          return [s.id, data.percentage || 0];
        })).then((results) => {
          setPercentages(Object.fromEntries(results));
        });
      });
    // Fetch subjects for this class
    fetch(`/api/admin/classes`)
      .then((res) => res.json())
      .then((data) => {
        const cls = (data.classes || []).find((c: any) => c.id == classId);
        if (cls) {
          fetch(`/api/admin/subjects?classId=${classId}`)
            .then((res) => res.json())
            .then((subjData) => {
              setSubjects(subjData.subjects || []);
              if (subjData.subjects && subjData.subjects.length > 0) {
                setSelectedSubjectId(subjData.subjects[0].id.toString());
              }
            });
        }
      });
  }, [classId]);

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const teacherId = localStorage.getItem("teacherId") || "9";
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        date,
        records: students.map((s) => ({
          studentId: s.id,
          subjectId: Number(selectedSubjectId),
          markedById: Number(teacherId),
          status: attendance[s.id]
        }))
      })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert("Failed to save attendance: " + (data.error || res.statusText));
      return;
    }
    alert("Attendance saved!");
    router.push("/teacher-dashboard");
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-6">
      <div className="max-w-4xl w-full mx-auto my-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Mark Attendance</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block font-semibold mb-2 text-green-100">Select Subject:</label>
              <select
                className="w-full bg-black/20 border border-green-800/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={subjects.length === 0}
              >
                {subjects.length === 0 && <option className="bg-green-950">No subjects available</option>}
                {subjects.map((subj: any) => (
                  <option key={subj.id} value={subj.id} className="bg-green-950">{subj.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-green-100">Select Date:</label>
              <input
                type="date"
                className="w-full bg-black/20 border border-green-800/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all [color-scheme:dark]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-green-400">Loading students...</div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="overflow-x-auto rounded-lg border border-white/10 mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-green-400 border-b border-white/10">
                      <th className="text-left px-4 py-3 font-semibold">Student</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 font-semibold">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map((s: any) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                        <td className="px-4 py-3">
                          <select
                            className={`border-0 rounded-lg px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none cursor-pointer transition-colors ${attendance[s.id] === "Present" ? "bg-green-500/20 text-green-400" :
                                attendance[s.id] === "Absent" ? "bg-red-500/20 text-red-400" :
                                  attendance[s.id] === "Late" ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-blue-500/20 text-blue-400"
                              }`}
                            value={attendance[s.id] || "Present"}
                            onChange={e => handleStatusChange(s.id, e.target.value)}
                          >
                            <option value="Present" className="bg-green-950 text-green-400">Present</option>
                            <option value="Absent" className="bg-green-950 text-red-400">Absent</option>
                            <option value="Late" className="bg-green-950 text-yellow-400">Late</option>
                            <option value="Leave" className="bg-green-950 text-blue-400">Leave</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{percentages[s.id] ?? "-"}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-green-900/20 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={!selectedSubjectId}
                >
                  Save Attendance
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
