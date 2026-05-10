import React, { useState, useEffect } from "react";
import { Layers, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, Search, FileDown } from "lucide-react";
import grupoService from "../../services/grupoService";
import materiaService from "../../services/materiaService";
import docenteService from "../../services/docenteService";
import periodoService from "../../services/periodoService";
import ConfirmDialog from "../../components/ConfirmDialog";
import Portal from "../../components/Portal";

export default function AdminGruposView() {
    const [grupos, setGrupos] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterPeriodo, setFilterPeriodo] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ materia_id: "", docente_id: "", periodo_id: "", paralelo: "", cupo: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [g, m, d, p] = await Promise.all([
                grupoService.getAll(), materiaService.getAll(), docenteService.getAll(), periodoService.getAll(),
            ]);
            setGrupos(g); setMaterias(m); setDocentes(d); setPeriodos(p);
            // Auto-select active period
            if (!filterPeriodo) {
                const activo = p.find((pp) => pp.estado === true);
                if (activo) setFilterPeriodo(String(activo.id));
            }
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setEditing(null);
        const activo = periodos.find((p) => p.estado === true);
        setForm({ materia_id: "", docente_id: "", periodo_id: activo ? String(activo.id) : "", paralelo: "", cupo: "30" });
        setModalOpen(true);
    };

    const openEdit = (g) => {
        setEditing(g);
        setForm({ materia_id: String(g.materia_id || ""), docente_id: String(g.docente_id || ""), periodo_id: String(g.periodo_id || ""), paralelo: g.paralelo || "", cupo: String(g.cupo || "") });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError("");
        try {
            const payload = {
                materia_id: parseInt(form.materia_id) || null,
                docente_id: parseInt(form.docente_id) || null,
                periodo_id: parseInt(form.periodo_id) || null,
                paralelo: form.paralelo,
                cupo: parseInt(form.cupo) || 30,
            };
            if (editing) { await grupoService.update(editing.id, payload); }
            else { await grupoService.create(payload); }
            setModalOpen(false); await fetchData();
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try { await grupoService.delete(id); await fetchData(); }
        catch (err) { setError(err.message); }
    };

    const filtered = grupos.filter((g) => {
        const matchSearch = g.materia?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
            g.materia?.sigla?.toLowerCase().includes(search.toLowerCase()) ||
            g.paralelo?.toLowerCase().includes(search.toLowerCase());
        const matchPeriodo = !filterPeriodo || String(g.periodo_id) === filterPeriodo;
        return matchSearch && matchPeriodo;
    });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-primary-600" /> Gestión de Grupos
                    </h1>
                    <p className="text-slate-500 mt-1">Crea paralelos, asigna docentes y configura cupos</p>
                </div>
                <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/30 flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Nuevo</span> Grupo
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />{error}
                    <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search className="w-5 h-5" /></span>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Buscar grupo..." />
                    </div>
                    <select value={filterPeriodo} onChange={(e) => setFilterPeriodo(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todos los periodos</option>
                        {periodos.map((p) => <option key={p.id} value={p.id}>{p.codigo} {p.estado ? "(Activo)" : ""}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center"><p className="text-slate-400 font-medium">No se encontraron grupos</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                                    <th className="px-6 py-3">Materia</th>
                                    <th className="px-6 py-3">Paralelo</th>
                                    <th className="px-6 py-3">Docente</th>
                                    <th className="px-6 py-3">Periodo</th>
                                    <th className="px-6 py-3 text-center">Cupo</th>
                                    <th className="px-6 py-3 text-center">Inscritos</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((g) => (
                                    <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-slate-800">{g.materia?.nombre}</div>
                                            <div className="text-xs text-slate-400 font-mono">{g.materia?.sigla}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
                                                {g.paralelo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 text-sm">
                                            {g.docente?.persona?.nombres} {g.docente?.persona?.paterno}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-slate-500">{g.periodo?.codigo}</td>
                                        <td className="px-6 py-3 text-center font-medium text-slate-700">{g.cupo || "-"}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="font-bold text-primary-600">{g.inscritosCount}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => openEdit(g)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => setDeleteId(g.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
            <Portal>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 border border-white animate-scale-in max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">{editing ? "Editar Grupo" : "Crear Grupo"}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Materia *</label>
                                <select value={form.materia_id} onChange={(e) => setForm({ ...form, materia_id: e.target.value })} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Seleccionar materia</option>
                                    {materias.map((m) => <option key={m.id} value={m.id}>{m.sigla} - {m.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Docente *</label>
                                <select value={form.docente_id} onChange={(e) => setForm({ ...form, docente_id: e.target.value })} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Seleccionar docente</option>
                                    {docentes.map((d) => <option key={d.id} value={d.id}>{d.persona?.nombres} {d.persona?.paterno} - {d.especialidad || ""}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Periodo *</label>
                                <select value={form.periodo_id} onChange={(e) => setForm({ ...form, periodo_id: e.target.value })} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Seleccionar periodo</option>
                                    {periodos.map((p) => <option key={p.id} value={p.id}>{p.codigo} {p.estado ? "(Activo)" : "(Cerrado)"}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Paralelo *</label>
                                    <input type="text" value={form.paralelo} onChange={(e) => setForm({ ...form, paralelo: e.target.value })} required
                                        placeholder="Ej: A, B, C"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cupo</label>
                                    <input type="number" value={form.cupo} onChange={(e) => setForm({ ...form, cupo: e.target.value })}
                                        placeholder="30"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
                                <button type="submit" disabled={saving}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {editing ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Portal>
            )}

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Eliminar Grupo"
                message="¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer."
                onConfirm={() => { handleDelete(deleteId); setDeleteId(null); }}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
