import React, { useState, useEffect } from "react";
import { Calendar, Plus, Edit, Lock, Unlock, X, Save, Loader2, AlertCircle, Trash2, FileDown } from "lucide-react";
import periodoService from "../../services/periodoService";
import { generarReportePeriodos } from "../../utils/pdfReports";
import ConfirmDialog from "../../components/ConfirmDialog";
import Portal from "../../components/Portal";

export default function PeriodosView() {
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ codigo: "", descripcion: "", fecha_inicio: "", fecha_fin: "", estado: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    const fetchPeriodos = async () => {
        try {
            setLoading(true);
            const data = await periodoService.getAll();
            setPeriodos(data);
        } catch (err) { setError("Error: " + err.message); } finally { setLoading(false); }
    };

    useEffect(() => { fetchPeriodos(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ codigo: "", descripcion: "", fecha_inicio: "", fecha_fin: "", estado: true });
        setModalOpen(true);
    };

    const openEdit = (per) => {
        setEditing(per);
        setForm({ codigo: per.codigo, descripcion: per.descripcion || "", fecha_inicio: per.fecha_inicio || "", fecha_fin: per.fecha_fin || "", estado: per.estado });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            if (editing) { await periodoService.update(editing.id, form); }
            else { await periodoService.create(form); }
            setModalOpen(false);
            await fetchPeriodos();
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    const handleToggle = async (id, currentEstado) => {
        try {
            await periodoService.toggleEstado(id, !currentEstado);
            await fetchPeriodos();
        } catch (err) { setError(err.message); }
    };

    const handleDelete = async (id) => {
        try { await periodoService.delete(id); await fetchPeriodos(); }
        catch (err) { setError(err.message); }
    };

    const formatDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("es-BO") : "-";

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary-600" /> Gestión de Periodos
                    </h1>
                    <p className="text-slate-500 mt-1">Apertura y cierre de semestres o gestiones</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button onClick={() => generarReportePeriodos(periodos)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 text-sm">
                        <FileDown className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Exportar</span> PDF
                    </button>
                    <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/30 flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Aperturar</span> Periodo
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
                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                                    <th className="px-6 py-4">Código</th>
                                    <th className="px-6 py-4">Descripción</th>
                                    <th className="px-6 py-4">Fechas</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {periodos.map((per) => (
                                    <tr key={per.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{per.codigo}</td>
                                        <td className="px-6 py-4 text-slate-600">{per.descripcion}</td>
                                        <td className="px-6 py-4 text-slate-500">{formatDate(per.fecha_inicio)} - {formatDate(per.fecha_fin)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${per.estado ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-300"}`}>
                                                {per.estado ? "Activo" : "Cerrado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => openEdit(per)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleToggle(per.id, per.estado)} className={`${per.estado ? "text-amber-600 hover:text-amber-800" : "text-slate-400 hover:text-slate-600"} transition-colors`} title={per.estado ? "Cerrar" : "Reabrir"}>
                                                    {per.estado ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => setDeleteId(per.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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
            <Portal>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-scale-in max-h-[90vh] flex flex-col">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                            <h2 className="text-xl font-bold">{editing ? "Editar Periodo" : "Nuevo Periodo"}</h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Código</label>
                                    <input type="text" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" required placeholder="I/2026" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Estado</label>
                                    <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value === "true" })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800">
                                        <option value="true">Activo</option>
                                        <option value="false">Cerrado</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descripción</label>
                                <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha Inicio</label>
                                    <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha Fin</label>
                                    <input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
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
            </Portal>
            )}

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Eliminar Periodo"
                message="¿Estás seguro de que deseas eliminar este periodo? Esta acción no se puede deshacer."
                onConfirm={() => { handleDelete(deleteId); setDeleteId(null); }}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
