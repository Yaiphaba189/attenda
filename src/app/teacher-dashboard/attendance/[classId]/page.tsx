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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-6">
      <Card className="max-w-xl mx-auto mt-10">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-red-500">Mark Attendance</h2>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-black">Select Subject:</label>
            <select
              className="border px-3 py-2 rounded w-full text-black"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={subjects.length === 0}
            >
              {subjects.length === 0 && <option>No subjects available</option>}
              {subjects.map((subj: any) => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-black">Select Date:</label>
            <input
              type="date"
              className="border px-3 py-2 rounded w-full text-black"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {loading ? (
            <div>Loading students...</div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
            >
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th className="text-left text-black">Student</th>
                    <th className="text-black">Status</th>
                    <th className="text-black">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s: any) => (
                    <tr key={s.id}>
                      <td className="text-black">{s.name}</td>
                      <td>
                        <select
                          className="border px-2 py-1 rounded text-black"
                          value={attendance[s.id] || "Present"}
                          onChange={e => handleStatusChange(s.id, e.target.value)}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                          <option value="Leave">Leave</option>
                        </select>
                      </td>
                      <td className="text-black">{percentages[s.id] ?? "-"}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg border-2 border-red-700 text-lg transition-all duration-200"
                disabled={!selectedSubjectId}
              >
                Save Attendance
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
