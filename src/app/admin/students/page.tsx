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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
      <div className="max-w-2xl w-full mx-auto my-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users2 className="w-7 h-7 text-red-600" />
              <h2 className="text-2xl font-bold text-red-600">Manage Students</h2>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2"
              onClick={() => setShowAdd((v) => !v)}
            >
              <Plus className="w-5 h-5 mr-1" /> Add Student
            </Button>
          </div>

          {/* Add Student Form Dropdown */}
          {showAdd && (
            <form onSubmit={handleAdd} className="flex flex-col gap-4 mb-8 animate-fade-in-down">
              <input
                type="text"
                placeholder="Name"
                className="border border-gray-300 rounded px-3 py-2 text-black focus:ring-2 focus:ring-red-200 outline-none"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                disabled={adding}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 rounded px-3 py-2 text-black focus:ring-2 focus:ring-red-200 outline-none"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                disabled={adding}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="border border-gray-300 rounded px-3 py-2 text-black focus:ring-2 focus:ring-red-200 outline-none"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                disabled={adding}
                required
              />
              <select
                className="border border-gray-300 rounded px-3 py-2 text-black focus:ring-2 focus:ring-red-200 outline-none"
                value={form.classId}
                onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                disabled={adding}
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>{cls.name} (ID: {cls.id})</option>
                ))}
              </select>
              
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-full mt-2 disabled:opacity-70"
                disabled={adding}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null}
                Add Student
              </Button>
            </form>
          )}

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-pink-100 rounded-lg shadow-sm overflow-hidden text-black">
              <thead>
                <tr className="bg-pink-50 text-black">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Class ID</th>
                  <th className="px-4 py-2 text-left">Created</th>
<th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-6">No students found.</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={`border-t border-pink-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-pink-50'} hover:bg-pink-100 transition-colors text-black`}
                    >
                      {student.editing ? (
                        <>
                          <td className="px-4 py-2 font-medium">
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={student.editName ?? student.name}
                              onChange={e => setStudents(students => students.map(s => s.id === student.id ? { ...s, editName: e.target.value } : s))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={student.editEmail ?? student.email}
                              onChange={e => setStudents(students => students.map(s => s.id === student.id ? { ...s, editEmail: e.target.value } : s))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              className="border rounded px-2 py-1 w-full text-black"
                              value={student.editClassId ?? (student.classId ? String(student.classId) : '')}
                              onChange={e => setStudents(students => students.map(s => s.id === student.id ? { ...s, editClassId: e.target.value } : s))}
                            >
                              <option value="">Select Class</option>
                              {classes.map((cls: any) => (
                                <option key={cls.id} value={cls.id}>{cls.name} (ID: {cls.id})</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">{new Date(student.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
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
                              className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded text-xs"
                              onClick={() => setStudents(students => students.map(s => s.id === student.id ? { ...s, editing: false, editName: undefined, editEmail: undefined, editClassId: undefined } : s))}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 font-medium">{student.name}</td>
                          <td className="px-4 py-2">{student.email}</td>
                          <td className="px-4 py-2">{student.classId ?? '-'}</td>
                          <td className="px-4 py-2">{new Date(student.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 flex gap-2">
  <button
    className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-3 py-1"
    onClick={() => setStudents(students => students.map(s => s.id === student.id ? { ...s, editing: true, editName: s.name, editEmail: s.email, editClassId: s.classId ? String(s.classId) : '' } : s))}
  >
    Edit
  </button>
  <button
    className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-1"
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
