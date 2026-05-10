import React, { useState, useEffect } from "react";
import { Users, Search, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, FileDown } from "lucide-react";
import estudianteService from "../../services/estudianteService";
import carreraService from "../../services/carreraService";
import { generarReporteEstudiantes } from "../../utils/pdfReports";

export default function EstudiantesView() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCarrera, setFilterCarrera] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ carnet: "", nombres: "", paterno: "", materno: "", correo: "", telefono: "", registro_universitario: "", carrera_id: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ests, cars] = await Promise.all([estudianteService.getAll(), carreraService.getAll()]);
            setEstudiantes(ests);
            setCarreras(cars);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ carnet: "", nombres: "", paterno: "", materno: "", correo: "", telefono: "", registro_universitario: "", carrera_id: "" });
        setModalOpen(true);
    };

    const openEdit = (est) => {
        setEditing(est);
        setForm({
            carnet: est.persona?.carnet || "", nombres: est.persona?.nombres || "",
            paterno: est.persona?.paterno || "", materno: est.persona?.materno || "",
            correo: est.persona?.correo || "", telefono: est.persona?.telefono || "",
            registro_universitario: est.registro_universitario || "",
            carrera_id: est.carrera_id || "",
        });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const personaData = { carnet: form.carnet, nombres: form.nombres, paterno: form.paterno, materno: form.materno, correo: form.correo, telefono: form.telefono };
            const estudianteData = { registro_universitario: form.registro_universitario, carrera_id: parseInt(form.carrera_id) || null };
            if (editing) {
                await estudianteService.update(editing.id, { personaData, estudianteData });
            } else {
                await estudianteService.create({ personaData, estudianteData });
            }
            setModalOpen(false);
            await fetchData();
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este estudiante?")) return;
        try { await estudianteService.delete(id); await fetchData(); }
        catch (err) { setError(err.message); }
    };

    const filtered = estudiantes.filter((est) => {
        const name = `${est.persona?.nombres || ""} ${est.persona?.paterno || ""} ${est.persona?.materno || ""}`.toLowerCase();
        const carnet = est.persona?.carnet?.toLowerCase() || "";
        const correo = est.persona?.correo?.toLowerCase() || "";
        const matchSearch = name.includes(search.toLowerCase()) || carnet.includes(search.toLowerCase()) || correo.includes(search.toLowerCase());
        const matchCarrera = !filterCarrera || String(est.carrera_id) === filterCarrera;
        const matchEstado = !filterEstado || (filterEstado === "activo" ? est.persona?.estado !== false : est.persona?.estado === false);
        return matchSearch && matchCarrera && matchEstado;
    });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary-600" /> Gestión de Estudiantes
                    </h1>
                    <p className="text-slate-500 mt-1">Administra el registro y acceso de los estudiantes</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => generarReporteEstudiantes(filtered)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                        <FileDown className="w-5 h-5" /> Exportar PDF
                    </button>
                    <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/30 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Nuevo Estudiante
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
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative max-w-md w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search className="w-5 h-5" /></span>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            placeholder="Buscar por nombre, carnet o correo..." />
                    </div>
                    <div className="flex gap-2">
                        <select value={filterCarrera} onChange={(e) => setFilterCarrera(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Todas las carreras</option>
                            {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Estado</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                                        <th className="px-6 py-4">Carnet</th>
                                        <th className="px-6 py-4">Estudiante</th>
                                        <th className="px-6 py-4">Carrera</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-200">
                                    {filtered.map((est) => (
                                        <tr key={est.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-slate-500">{est.persona?.carnet || "-"}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-800">{est.persona?.nombres} {est.persona?.paterno} {est.persona?.materno}</div>
                                                <div className="text-xs text-slate-500">{est.persona?.correo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{est.carrera?.nombre || "-"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${est.persona?.estado !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                                    {est.persona?.estado !== false ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(est)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(est.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-sm text-slate-500">
                            Mostrando {filtered.length} de {estudiantes.length} estudiantes
                        </div>
                    </>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-scale-in">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                            <h2 className="text-xl font-bold">{editing ? "Editar Estudiante" : "Nuevo Estudiante"}</h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 bg-slate-50 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Carnet</label>
                                    <input type="text" value={form.carnet} onChange={(e) => setForm({ ...form, carnet: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Reg. Universitario</label>
                                    <input type="text" value={form.registro_universitario} onChange={(e) => setForm({ ...form, registro_universitario: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombres</label>
                                <input type="text" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ap. Paterno</label>
                                    <input type="text" value={form.paterno} onChange={(e) => setForm({ ...form, paterno: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ap. Materno</label>
                                    <input type="text" value={form.materno} onChange={(e) => setForm({ ...form, materno: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Correo</label>
                                    <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Teléfono</label>
                                    <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Carrera</label>
                                <select value={form.carrera_id} onChange={(e) => setForm({ ...form, carrera_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800">
                                    <option value="">-- Seleccionar --</option>
                                    {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
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
