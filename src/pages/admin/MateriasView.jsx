import React, { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, FileDown } from "lucide-react";
import materiaService from "../../services/materiaService";
import carreraService from "../../services/carreraService";
import { generarReporteMaterias } from "../../utils/pdfReports";

export default function MateriasView() {
    const [materias, setMaterias] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ sigla: "", nombre: "", descripcion: "", creditos: "", carrera_id: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [filterCarrera, setFilterCarrera] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mats, cars] = await Promise.all([materiaService.getAll(), carreraService.getAll()]);
            setMaterias(mats);
            setCarreras(cars);
        } catch (err) {
            setError("Error al cargar datos: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ sigla: "", nombre: "", descripcion: "", creditos: "", carrera_id: "" });
        setModalOpen(true);
    };

    const openEdit = (mat) => {
        setEditing(mat);
        setForm({ sigla: mat.sigla, nombre: mat.nombre, descripcion: mat.descripcion || "", creditos: mat.creditos || "", carrera_id: mat.carrera_id || "" });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload = { ...form, creditos: parseInt(form.creditos) || 0, carrera_id: parseInt(form.carrera_id) || null };
            if (editing) {
                await materiaService.update(editing.id, payload);
            } else {
                await materiaService.create(payload);
            }
            setModalOpen(false);
            await fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar esta materia?")) return;
        try {
            await materiaService.delete(id);
            await fetchData();
        } catch (err) { setError("Error: " + err.message); }
    };

    const filtered = materias.filter((m) => {
        const matchSearch = m.nombre?.toLowerCase().includes(search.toLowerCase()) ||
            m.sigla?.toLowerCase().includes(search.toLowerCase());
        const matchCarrera = !filterCarrera || String(m.carrera_id) === filterCarrera;
        return matchSearch && matchCarrera;
    });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                        Gestión de Materias
                    </h1>
                    <p className="text-slate-500 mt-1">Configura el catálogo de asignaturas por carrera</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => generarReporteMaterias(filtered)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                        <FileDown className="w-5 h-5" /> Exportar PDF
                    </button>
                    <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/30 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Nueva Materia
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
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                    <div className="relative max-w-md w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <Search className="w-5 h-5" />
                        </span>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Buscar materia..." />
                    </div>
                    <select value={filterCarrera} onChange={(e) => setFilterCarrera(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todas las carreras</option>
                        {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No se encontraron materias</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filtered.map((mat) => (
                            <div key={mat.id} className="border border-slate-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-slate-100 text-slate-600 text-sm font-semibold px-2 py-1 rounded font-mono">{mat.sigla}</span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(mat)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(mat.id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{mat.nombre}</h3>
                                <p className="text-sm text-slate-500 mb-4">{mat.carrera?.nombre || "Sin carrera"}</p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                                    <span className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full">{mat.creditos} Créditos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-scale-in">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                            <h2 className="text-xl font-bold">{editing ? "Editar Materia" : "Nueva Materia"}</h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sigla</label>
                                    <input type="text" value={form.sigla} onChange={(e) => setForm({ ...form, sigla: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Créditos</label>
                                    <input type="number" value={form.creditos} onChange={(e) => setForm({ ...form, creditos: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre</label>
                                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Carrera</label>
                                <select value={form.carrera_id} onChange={(e) => setForm({ ...form, carrera_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800">
                                    <option value="">-- Seleccionar --</option>
                                    {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descripción</label>
                                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 min-h-[60px]" />
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
