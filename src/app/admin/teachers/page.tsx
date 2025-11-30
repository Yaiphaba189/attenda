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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-8">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-pink-100 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users2 className="w-7 h-7 text-red-600" />
              <h2 className="text-2xl font-bold text-red-600" style={{ color: '#dc2626' }}>Manage Teachers</h2>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              onClick={() => setShowAdd(v => !v)}
            >
              <Plus className="w-5 h-5 mr-1" /> Add Teacher
            </Button>
          </div>

          {showAdd && (
            <form onSubmit={handleAdd} className="p-8 rounded-lg flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-6 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-gray-400 rounded px-3 py-2 text-black"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border border-gray-400 rounded px-3 py-2 text-black"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-gray-400 rounded px-3 py-2 text-black"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-full mt-2"
                disabled={adding}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null}
                Add Teacher
              </Button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full border border-pink-100 rounded-lg">
              <thead>
                <tr className="bg-pink-100">
                  <th className="py-2 px-4 text-left text-red-600">Name</th>
                  <th className="py-2 px-4 text-left text-red-600">Email</th>
                  <th className="py-2 px-4 text-left text-red-600">Created At</th>
                  <th className="py-2 px-4 text-red-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">No teachers found.</td>
                  </tr>
                ) : (
                  teachers.map(teacher => (
                    <tr key={teacher.id} className="border-t border-pink-100">
                      {teacher.editing ? (
                        <>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full text-black"
                              value={teacher.editName}
                              onChange={e => handleChange(teacher.id, 'editName', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="email"
                              className="border rounded px-2 py-1 w-full text-black"
                              value={teacher.editEmail}
                              onChange={e => handleChange(teacher.id, 'editEmail', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-4 text-black">{new Date(teacher.createdAt).toLocaleString()}</td>
                          <td className="py-2 px-4 flex gap-2">
                            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 py-1" onClick={() => handleSave(teacher.id)}>
                              Save
                            </Button>
                            <Button className="bg-gray-300 hover:bg-gray-400 text-black rounded-xl px-3 py-1" onClick={() => handleCancel(teacher.id)}>
                              Cancel
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-4 text-black">{teacher.name}</td>
                          <td className="py-2 px-4 text-black">{teacher.email}</td>
                          <td className="py-2 px-4 text-black">{new Date(teacher.createdAt).toLocaleString()}</td>
                          <td className="py-2 px-4 flex gap-2">
                            <Button className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-3 py-1" onClick={() => handleEdit(teacher.id)}>
                              Edit
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-1" onClick={() => handleDelete(teacher.id)}>
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
        </CardContent>
      </Card>
    </div>
  );
}
