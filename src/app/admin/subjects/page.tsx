"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClassItem {
  id: number;
  name: string;
}

interface SubjectItem {
  id: number;
  name: string;
  classId: number;
  className?: string;
}

export default function ManageSubjects() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [form, setForm] = useState({ name: "", classId: "" });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", classId: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- Edit and Delete Logic ---
  const startEdit = (subject: SubjectItem) => {
    setEditingId(subject.id);
    setEditForm({ name: subject.name, classId: String(subject.classId) });
  };

  // (rest of the code remains unchanged)


  const handleEditSave = async (id: number) => {
    if (!editForm.name || !editForm.classId) {
      toast.error("Subject name and class are required");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, classId: Number(editForm.classId) })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to update subject");
      toast.success("Subject updated");
      setEditingId(null);
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to update subject");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to delete subject");
      toast.success("Subject deleted");
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subject");
    } finally {
      setDeletingId(null);
    }
  };


  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/admin/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses(data.classes || []);
    } catch {
      toast.error("Failed to load classes");
      setClasses([]);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subjects");
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch {
      toast.error("Failed to load subjects");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.classId) {
      toast.error("Subject name and class are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, classId: Number(form.classId) }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to add subject");
      }
      toast.success("Subject added");
      setForm({ name: "", classId: "" });
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to add subject");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-4">
      <div className="max-w-4xl w-full mx-auto my-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white text-center flex-1">Manage Subjects</h2>
          </div>
          {/* Add Subject Form Dropdown */}
          <form onSubmit={handleAdd} className="flex flex-col gap-4 mb-8 animate-fade-in-down bg-black/20 p-6 rounded-xl border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Subject Name"
                className="border border-green-800/50 rounded-lg px-3 py-2 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700/50 transition-all"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
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
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-green-950 text-white">{c.name} (ID: {c.id})</option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white rounded-xl w-full mt-2 disabled:opacity-70 shadow-lg shadow-green-900/20"
              disabled={adding}
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : null}
              Add Subject
            </Button>
          </form>

          {/* Subjects Table */}
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-green-400 border-b border-white/10">
                  <th className="px-4 py-3 text-left font-semibold">Subject Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Class</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
                    </td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 py-8">No subjects found.</td>
                  </tr>
                ) : (
                  subjects.map((subject, idx) => {
                    const className = classes.find(c => c.id === subject.classId)?.name || "";
                    const isEditing = editingId === subject.id;
                    return (
                      <tr
                        key={subject.id}
                        className="hover:bg-white/5 transition-colors text-gray-300"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {isEditing ? (
                            <input
                              type="text"
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={editForm.name}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              disabled={savingEdit}
                            />
                          ) : (
                            subject.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              className="border border-green-800/50 rounded px-2 py-1 w-full bg-black/20 text-white focus:ring-1 focus:ring-green-500 outline-none"
                              value={editForm.classId}
                              onChange={e => setEditForm(f => ({ ...f, classId: e.target.value }))}
                              disabled={savingEdit}
                            >
                              <option value="" className="bg-green-950">Select Class</option>
                              {classes.map(c => (
                                <option key={c.id} value={c.id} className="bg-green-950">{c.name} (ID: {c.id})</option>
                              ))}
                            </select>
                          ) : (
                            <>{className} {subject.classId ? `(ID: ${subject.classId})` : ''}</>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-500 text-white rounded-lg mr-2 text-xs"
                                disabled={savingEdit}
                                onClick={() => handleEditSave(subject.id)}
                              >
                                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-1" /> : null}
                                Save
                              </Button>
                              <Button
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs border border-white/10"
                                disabled={savingEdit}
                                onClick={() => setEditingId(null)}
                              >Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg mr-2 text-xs transition-all"
                                onClick={() => startEdit(subject)}
                              >Edit</Button>
                              <Button
                                size="sm"
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs transition-all"
                                onClick={() => handleDelete(subject.id)}
                                disabled={deletingId === subject.id}
                              >
                                {deletingId === subject.id ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-1" /> : null}
                                Delete
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
