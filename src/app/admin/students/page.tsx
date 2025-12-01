"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import { Users2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Student = {
  id: number;
  name: string;
  email: string;
  classId?: number | null;
  createdAt: string;
  // Inline editing state fields
  editing?: boolean;
  editName?: string;
  editEmail?: string;
  editClassId?: string;
};

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", classId: "" });
  const [adding, setAdding] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  const router = useRouter();

  // Fetch classes and teachers on mount
  useEffect(() => {
    fetch("/api/admin/classes")
      .then(res => res.json())
      .then(data => setClasses(data.classes || []));

  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields required");
      return;
    }
    setAdding(true);
    try {
      // Always send classId as a number or null
      const payload = {
        ...form,
        classId: form.classId === "" ? null : Number(form.classId)
      };
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 409) {
        toast.error("A user with this email already exists.");
        setAdding(false);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add student");
      }
      toast.success("Student added");
      setShowAdd(false);
      setForm({ name: "", email: "", password: "", classId: "" });
      fetchStudents();
    } catch (err: any) {
      if (err instanceof Response) {
        try {
          const data = await err.json();
          toast.error(data.error || "Server error");
        } catch {
          toast.error("Server error");
        }
      } else {
        toast.error(err?.message || "Server error");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-4">
      <div className="max-w-4xl w-full mx-auto my-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <Users2 className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Manage Students</h2>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-4 py-2 shadow-lg shadow-green-900/20 hover:scale-105 transition-all duration-300"
              onClick={() => setShowAdd((v) => !v)}
            >
              <Plus className="w-5 h-5 mr-1" /> Add Student
            </Button>
          </div>

          {/* Add Student Form Dropdown */}
          {showAdd && (
            <form onSubmit={handleAdd} className="flex flex-col gap-4 mb-8 animate-fade-in-down bg-black/20 p-6 rounded-xl border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled={adding}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={adding}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={adding}
                  required
                />
                <select
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  disabled={adding}
                  required
                >
                  <option value="" className="bg-green-950 text-gray-400">Select Class</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id} className="bg-green-950 text-white">{cls.name} (ID: {cls.id})</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white rounded-xl w-full mt-2 disabled:opacity-70 shadow-lg shadow-green-900/20"
                disabled={adding}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null}
                Add Student
              </Button>
            </form>
          )}

          {/* Students Table */}
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-green-400 border-b border-white/10">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Class ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Created</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">No students found.</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr
                      key={student.id}
                      className="hover:bg-white/5 transition-colors text-gray-300"
                    >
                      {student.editing ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={student.editName ?? student.name}
                              onChange={e => setStudents(students => students.map(s => s.id === student.id ? { ...s, editName: e.target.value } : s))}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={student.editEmail ?? student.email}
                              onChange={e => setStudents(students => students.map(s => s.id === student.id ? { ...s, editEmail: e.target.value } : s))}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={student.editClassId ?? (student.classId ? String(student.classId) : '')}
                              onChange={e => setStudents(students => students.map(s => s.id === student.id ? { ...s, editClassId: e.target.value } : s))}
                            >
                              <option value="" className="bg-green-950">Select Class</option>
                              {classes.map((cls: any) => (
                                <option key={cls.id} value={cls.id} className="bg-green-950">{cls.name} (ID: {cls.id})</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(student.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs transition-colors shadow-sm"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/admin/students/${student.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      name: student.editName ?? student.name,
                                      email: student.editEmail ?? student.email,
                                      classId: student.editClassId !== undefined ? (student.editClassId === '' ? null : Number(student.editClassId)) : (student.classId ?? null)
                                    })
                                  });
                                  if (!res.ok) throw new Error('Failed to update');
                                  toast.success('Student updated');
                                  setStudents(students => students.map(s => s.id === student.id ? { ...s, editing: false, editName: undefined, editEmail: undefined, editClassId: undefined } : s));
                                  fetchStudents();
                                } catch (err) {
                                  toast.error('Failed to update student');
                                }
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs transition-colors border border-white/10"
                              onClick={() => setStudents(students => students.map(s => s.id === student.id ? { ...s, editing: false, editName: undefined, editEmail: undefined, editClassId: undefined } : s))}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-white">{student.name}</td>
                          <td className="px-4 py-3">{student.email}</td>
                          <td className="px-4 py-3">{student.classId ?? '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(student.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg px-3 py-1 text-xs transition-all"
                              onClick={() => setStudents(students => students.map(s => s.id === student.id ? { ...s, editing: true, editName: s.name, editEmail: s.email, editClassId: s.classId ? String(s.classId) : '' } : s))}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg px-3 py-1 text-xs transition-all"
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to delete this student?')) return;
                                try {
                                  const res = await fetch(`/api/admin/students/${student.id}`, { method: 'DELETE' });
                                  if (!res.ok) throw new Error('Failed to delete');
                                  toast.success('Student deleted');
                                  fetchStudents();
                                } catch (err) {
                                  toast.error('Failed to delete student');
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
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
