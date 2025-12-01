"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Users2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  // Inline editing state fields
  editing?: boolean;
  editName?: string;
  editEmail?: string;
}

export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [adding, setAdding] = useState(false);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      // Add editing fields to each teacher
      setTeachers(data.map((t: Teacher) => ({ ...t, editing: false, editName: t.name, editEmail: t.email })));
    } catch (err) {
      toast.error("Failed to load teachers");
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Inline edit handlers
  const handleEdit = (id: number) => {
    setTeachers(ts => ts.map(t => t.id === id ? { ...t, editing: true, editName: t.name, editEmail: t.email } : { ...t, editing: false }));
  };
  const handleCancel = (id: number) => {
    setTeachers(ts => ts.map(t => t.id === id ? { ...t, editing: false, editName: t.name, editEmail: t.email } : t));
  };
  const handleChange = (id: number, field: 'editName' | 'editEmail', value: string) => {
    setTeachers(ts => ts.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const handleSave = async (id: number) => {
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) return;
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teacher.editName, email: teacher.editEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update teacher');
      toast.success('Teacher updated');
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update teacher');
    }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete teacher');
      toast.success('Teacher deleted');
      setTeachers(ts => ts.filter(t => t.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete teacher');
    }
  };


  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add teacher");
      }
      toast.success("Teacher added");
      setShowAdd(false);
      setForm({ name: "", email: "", password: "" });
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add teacher");
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
              <h2 className="text-2xl font-bold text-white">Manage Teachers</h2>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-4 py-2 shadow-lg shadow-green-900/20 hover:scale-105 transition-all duration-300"
              onClick={() => setShowAdd(v => !v)}
            >
              <Plus className="w-5 h-5 mr-1" /> Add Teacher
            </Button>
          </div>

          {showAdd && (
            <form onSubmit={handleAdd} className="bg-black/20 p-6 rounded-xl border border-white/5 flex flex-col gap-4 mb-8 animate-fade-in-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white rounded-xl w-full mt-2 shadow-lg shadow-green-900/20"
                disabled={adding}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null}
                Add Teacher
              </Button>
            </form>
          )}

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-green-400 border-b border-white/10">
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Email</th>
                  <th className="py-3 px-4 text-left font-semibold">Created At</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-green-500">
                      <Loader2 className="w-8 h-8 animate-spin inline-block mr-2" /> Loading...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">No teachers found.</td>
                  </tr>
                ) : (
                  teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-white/5 transition-colors text-gray-300">
                      {teacher.editing ? (
                        <>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={teacher.editName}
                              onChange={e => handleChange(teacher.id, 'editName', e.target.value)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="email"
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={teacher.editEmail}
                              onChange={e => handleChange(teacher.id, 'editEmail', e.target.value)}
                            />
                          </td>
                          <td className="py-3 px-4 text-gray-500">{new Date(teacher.createdAt).toLocaleString()}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-3 py-1 text-xs" onClick={() => handleSave(teacher.id)}>
                              Save
                            </Button>
                            <Button className="bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg px-3 py-1 text-xs border border-white/10" onClick={() => handleCancel(teacher.id)}>
                              Cancel
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 font-medium text-white">{teacher.name}</td>
                          <td className="py-3 px-4">{teacher.email}</td>
                          <td className="py-3 px-4 text-gray-500">{new Date(teacher.createdAt).toLocaleString()}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg px-3 py-1 text-xs transition-all" onClick={() => handleEdit(teacher.id)}>
                              Edit
                            </Button>
                            <Button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg px-3 py-1 text-xs transition-all" onClick={() => handleDelete(teacher.id)}>
                              Delete
                            </Button>
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
