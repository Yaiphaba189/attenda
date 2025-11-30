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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-6 text-black">
      <Card className="max-w-xl mx-auto mt-10">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-red-500">Select a Class to Take Attendance</h2>
          {loading ? (
            <div>Loading...</div>
          ) : classes.length === 0 ? (
            <div className="text-black">No classes assigned.</div>
          ) : (
            <ul className="space-y-3">
              {classes.map((c) => (
                <li key={c.id}>
                  <Button
                    className="w-full justify-start text-black bg-red-100 hover:bg-red-300 hover:text-white"
                    onClick={() => router.push(`/teacher-dashboard/attendance/${c.id}`)}
                  >
                    <span className="text-red-500 font-bold">{c.name} (ID: {c.id})</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
