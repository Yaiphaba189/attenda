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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-8">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-pink-100 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-7 h-7 text-red-600" />
              <h2 className="text-2xl font-bold text-red-600" style={{ color: '#dc2626' }}>Manage Classes</h2>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              onClick={() => setShowAdd(v => !v)}
            >
              <Plus className="w-5 h-5 mr-1" /> Add Class
            </Button>
          </div>

          {showAdd && (
            <form onSubmit={handleAdd} className="p-8 rounded-lg flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-6 mb-2">
                <input
                  type="text"
                  placeholder="Class Name"
                  className="border border-gray-400 rounded px-3 py-2 text-black"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <select
                  className="border border-gray-400 rounded px-3 py-2 text-black"
                  value={form.teacherId}
                  onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-full mt-2"
                disabled={adding}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null}
                Add Class
              </Button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full border border-pink-100 rounded-lg">
              <thead>
                <tr className="bg-pink-100">
                  <th className="py-2 px-4 text-left text-red-600">Name</th>
                  <th className="py-2 px-4 text-left text-red-600">Teacher</th>
                  <th className="py-2 px-4 text-red-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading...
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">No classes found.</td>
                  </tr>
                ) : (
                  classes.map(cls => (
                    <tr key={cls.id} className="border-t border-pink-100">
                      {cls.editing ? (
                        <>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full text-black"
                              value={cls.editName}
                              onChange={e => handleChange(cls.id, 'editName', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-4">
                            <select
                              className="border rounded px-2 py-1 w-full text-black"
                              value={cls.editTeacherId}
                              onChange={e => handleChange(cls.id, 'editTeacherId', e.target.value)}
                            >
                              <option value="">Select Teacher</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-4 flex gap-2">
                            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 py-1" onClick={() => handleSave(cls.id)}>
                              Save
                            </Button>
                            <Button className="bg-gray-300 hover:bg-gray-400 text-black rounded-xl px-3 py-1" onClick={() => handleCancel(cls.id)}>
                              Cancel
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-4 text-black">{cls.name}</td>
                          <td className="py-2 px-4 text-black">{teachers.find(t => t.name === cls.teacher)?.name || '-'}</td>
                          <td className="py-2 px-4 flex gap-2">
                            <Button className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-3 py-1" onClick={() => handleEdit(cls.id)}>
                              Edit
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-1" onClick={() => handleDelete(cls.id)}>
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
