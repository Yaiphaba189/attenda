"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ClassItem {
  id: number;
  name: string;
  teacher: string | null;
  // Inline editing state fields
  editing?: boolean;
  editName?: string;
  editTeacherId?: string;
}

interface TeacherItem {
  id: number;
  name: string;
}

export default function ManageClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", teacherId: "" });
  const [adding, setAdding] = useState(false);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses((data.classes || []).map((c: ClassItem) => ({ ...c, editing: false, editName: c.name, editTeacher: c.teacher || '' })));

    } catch (err) {
      toast.error("Failed to load classes");
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/admin/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      toast.error("Failed to load teachers");
      setTeachers([]);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.teacherId) {
      toast.error("Class name and teacher are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, teacherId: Number(form.teacherId) }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to add class");
      }
      toast.success("Class added");
      setShowAdd(false);
      setForm({ name: "", teacherId: "" });
      fetchClasses();
    } catch (err: any) {
      toast.error(err.message || "Failed to add class");
    } finally {
      setAdding(false);
    }
  };

  // Inline edit handlers
  const handleEdit = (id: number) => {
    const cls = classes.find(c => c.id === id);
    setClasses(cs => cs.map(c => c.id === id ? { ...c, editing: true, editName: c.name, editTeacherId: teachers.find(t => t.name === c.teacher)?.id?.toString() || '' } : { ...c, editing: false, editTeacherId: undefined }));
  };
  const handleCancel = (id: number) => {
    setClasses(cs => cs.map(c => c.id === id ? { ...c, editing: false, editName: c.name, editTeacherId: undefined } : c));
  };
  const handleChange = (id: number, field: 'editName' | 'editTeacherId', value: string) => {
    setClasses(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const handleSave = async (id: number) => {
    const cls = classes.find(c => c.id === id);
    if (!cls) return;
    try {
      const res = await fetch(`/api/admin/classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cls.editName, teacherId: cls.editTeacherId ? Number(cls.editTeacherId) : null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update class');
      toast.success('Class updated');
      fetchClasses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update class');
    }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const res = await fetch(`/api/admin/classes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete class');
      toast.success('Class deleted');
      setClasses(cs => cs.filter(c => c.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete class');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-4">
      <div className="max-w-4xl w-full mx-auto my-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Manage Classes</h2>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-4 py-2 shadow-lg shadow-green-900/20 hover:scale-105 transition-all duration-300"
              onClick={() => setShowAdd(v => !v)}
            >
              <Plus className="w-5 h-5 mr-1" /> Add Class
            </Button>
          </div>

          {showAdd && (
            <form onSubmit={handleAdd} className="bg-black/20 p-6 rounded-xl border border-white/5 flex flex-col gap-4 mb-8 animate-fade-in-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Class Name"
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <select
                  className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={form.teacherId}
                  onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                  required
                >
                  <option value="" className="bg-green-950 text-gray-400">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id} className="bg-green-950 text-white">{t.name}</option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white rounded-xl w-full mt-2 shadow-lg shadow-green-900/20"
                disabled={adding}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null}
                Add Class
              </Button>
            </form>
          )}

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-green-400 border-b border-white/10">
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Teacher</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-green-500">
                      <Loader2 className="w-8 h-8 animate-spin inline-block mr-2" /> Loading...
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">No classes found.</td>
                  </tr>
                ) : (
                  classes.map(cls => (
                    <tr key={cls.id} className="hover:bg-white/5 transition-colors text-gray-300">
                      {cls.editing ? (
                        <>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={cls.editName}
                              onChange={e => handleChange(cls.id, 'editName', e.target.value)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={cls.editTeacherId}
                              onChange={e => handleChange(cls.id, 'editTeacherId', e.target.value)}
                            >
                              <option value="" className="bg-green-950">Select Teacher</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id} className="bg-green-950">{t.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-3 py-1 text-xs" onClick={() => handleSave(cls.id)}>
                              Save
                            </Button>
                            <Button className="bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg px-3 py-1 text-xs border border-white/10" onClick={() => handleCancel(cls.id)}>
                              Cancel
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 font-medium text-white">{cls.name}</td>
                          <td className="py-3 px-4">{teachers.find(t => t.name === cls.teacher)?.name || '-'}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg px-3 py-1 text-xs transition-all" onClick={() => handleEdit(cls.id)}>
                              Edit
                            </Button>
                            <Button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg px-3 py-1 text-xs transition-all" onClick={() => handleDelete(cls.id)}>
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
