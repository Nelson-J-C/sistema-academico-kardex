import React, { useState, useEffect } from "react";
import {
    Briefcase, Search, Plus, Edit, Trash2, ChevronRight,
    X, Save, Loader2, AlertCircle, FileDown,
} from "lucide-react";
import carreraService from "../../services/carreraService";
import { generarReporteCarreras } from "../../utils/pdfReports";

export default function CarrerasView() {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: "", descripcion: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchCarreras = async () => {
        try {
            setLoading(true);
            const data = await carreraService.getAll();
            setCarreras(data);
        } catch (err) {
            setError("Error al cargar carreras: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCarreras(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ nombre: "", descripcion: "" });
        setModalOpen(true);
    };

    const openEdit = (carrera) => {
        setEditing(carrera);
        setForm({ nombre: carrera.nombre, descripcion: carrera.descripcion || "" });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            if (editing) {
                await carreraService.update(editing.id, form);
            } else {
                await carreraService.create(form);
            }
            setModalOpen(false);
            await fetchCarreras();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de eliminar esta carrera?")) return;
        try {
            await carreraService.delete(id);
            await fetchCarreras();
        } catch (err) {
            setError("Error al eliminar: " + err.message);
        }
    };

    const filtered = carreras.filter((c) =>
        c.nombre?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-primary-600" />
                        Gestión de Carreras
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Administra las carreras y facultades de la institución
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => generarReporteCarreras(carreras)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2"
                    >
                        <FileDown className="w-5 h-5" />
                        Exportar PDF
                    </button>
                    <button
                        onClick={openCreate}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-primary-600/30 transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Carrera
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                    <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md w-full group">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-primary-500 transition-colors">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-sm"
                            placeholder="Buscar carrera..."
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No se encontraron carreras</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/30">
                        {filtered.map((carrera) => (
                            <div
                                key={carrera.id}
                                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-lg p-1 border border-slate-100">
                                        <button
                                            onClick={() => openEdit(carrera)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(carrera.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-800 text-xl leading-tight mb-2 group-hover:text-primary-600 transition-colors">
                                    {carrera.nombre}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                                    {carrera.descripcion || "Sin descripción"}
                                </p>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Materias</p>
                                        <p className="font-bold text-slate-700 text-lg">{carrera.materiasCount}</p>
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Estudiantes</p>
                                        <p className="font-bold text-slate-700 text-lg">{carrera.estudiantesCount}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white animate-scale-in">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold">{editing ? "Editar Carrera" : "Nueva Carrera"}</h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 bg-slate-50">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 min-h-[80px]"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
