import React, { useState, useEffect } from "react";
import { GraduationCap, Search, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, FileDown } from "lucide-react";
import docenteService from "../../services/docenteService";
import { generarReporteDocentes } from "../../utils/pdfReports";

export default function DocentesView() {
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ carnet: "", nombres: "", paterno: "", materno: "", correo: "", telefono: "", especialidad: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchDocentes = async () => {
        try { setLoading(true); setDocentes(await docenteService.getAll()); }
        catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    useEffect(() => { fetchDocentes(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ carnet: "", nombres: "", paterno: "", materno: "", correo: "", telefono: "", especialidad: "" });
        setModalOpen(true);
    };

    const openEdit = (doc) => {
        setEditing(doc);
        setForm({
            carnet: doc.persona?.carnet || "", nombres: doc.persona?.nombres || "",
            paterno: doc.persona?.paterno || "", materno: doc.persona?.materno || "",
            correo: doc.persona?.correo || "", telefono: doc.persona?.telefono || "",
            especialidad: doc.especialidad || "",
        });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError("");
        try {
            const personaData = { carnet: form.carnet, nombres: form.nombres, paterno: form.paterno, materno: form.materno, correo: form.correo, telefono: form.telefono };
            const docenteData = { especialidad: form.especialidad };
            if (editing) { await docenteService.update(editing.id, { personaData, docenteData }); }
            else { await docenteService.create({ personaData, docenteData }); }
            setModalOpen(false); await fetchDocentes();
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este docente?")) return;
        try { await docenteService.delete(id); await fetchDocentes(); }
        catch (err) { setError(err.message); }
    };

    const filtered = docentes.filter((d) => {
        const name = `${d.persona?.nombres || ""} ${d.persona?.paterno || ""} ${d.persona?.materno || ""} ${d.especialidad || ""}`.toLowerCase();
        return name.includes(search.toLowerCase()) || (d.persona?.carnet || "").toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-primary-600" /> Gestión de Docentes
                    </h1>
                    <p className="text-slate-500 mt-1">Administra la información de los docentes y sus especialidades</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => generarReporteDocentes(filtered)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                        <FileDown className="w-5 h-5" /> Exportar PDF
                    </button>
                    <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/30 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Nuevo Docente
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />{error}
                    <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="relative max-w-md w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search className="w-5 h-5" /></span>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            placeholder="Buscar por nombre, carnet o especialidad..." />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                                    <th className="px-6 py-4">Carnet</th>
                                    <th className="px-6 py-4">Docente</th>
                                    <th className="px-6 py-4">Especialidad</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {filtered.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-slate-500">{doc.persona?.carnet || "-"}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{doc.persona?.nombres} {doc.persona?.paterno} {doc.persona?.materno}</div>
                                            <div className="text-xs text-slate-500">{doc.persona?.correo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{doc.especialidad || "-"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${doc.persona?.estado !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                                {doc.persona?.estado !== false ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(doc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-scale-in">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                            <h2 className="text-xl font-bold">{editing ? "Editar Docente" : "Nuevo Docente"}</h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Carnet</label>
                                    <input type="text" value={form.carnet} onChange={(e) => setForm({ ...form, carnet: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" required /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Especialidad</label>
                                    <input type="text" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" /></div>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombres</label>
                                <input type="text" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ap. Paterno</label>
                                    <input type="text" value={form.paterno} onChange={(e) => setForm({ ...form, paterno: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ap. Materno</label>
                                    <input type="text" value={form.materno} onChange={(e) => setForm({ ...form, materno: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Correo</label>
                                    <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Teléfono</label>
                                    <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" /></div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200">Cancelar</button>
                                <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
