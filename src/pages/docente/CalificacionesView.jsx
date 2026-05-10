import React, { useState, useEffect } from "react";
import { FileText, Save, CheckCircle2, Loader2, AlertCircle, FileDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import grupoService from "../../services/grupoService";
import inscripcionService from "../../services/inscripcionService";
import evaluacionService from "../../services/evaluacionService";
import notaService from "../../services/notaService";
import { generarReporteCalificaciones } from "../../utils/pdfReports";

export default function CalificacionesView() {
    const { user } = useAuth();
    const [grupos, setGrupos] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
    const [evalSeleccionada, setEvalSeleccionada] = useState("");
    const [estudiantes, setEstudiantes] = useState([]);
    const [notas, setNotas] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchInit = async () => {
            try {
                setLoading(true);
                const [grps, evals] = await Promise.all([
                    user?.docente_id ? grupoService.getByDocenteId(user.docente_id) : [],
                    evaluacionService.getAll(),
                ]);
                setGrupos(grps.filter((g) => g.periodo?.estado === true));
                setEvaluaciones(evals);
                if (evals.length > 0) setEvalSeleccionada(String(evals[0].id));
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchInit();
    }, [user?.docente_id]);

    useEffect(() => {
        if (!grupoSeleccionado) { setEstudiantes([]); return; }
        const fetchEstudiantes = async () => {
            try {
                setLoadingNotas(true);
                const inscs = await inscripcionService.getByGrupoId(parseInt(grupoSeleccionado));
                setEstudiantes(inscs);
                // Load existing notas for all inscripciones
                const notasMap = {};
                for (const insc of inscs) {
                    const notasInsc = await notaService.getByInscripcionId(insc.id);
                    notasInsc.forEach((n) => {
                        notasMap[`${insc.id}_${n.evaluacion_id}`] = n.nota;
                    });
                }
                setNotas(notasMap);
            } catch (err) { setError(err.message); }
            finally { setLoadingNotas(false); }
        };
        fetchEstudiantes();
    }, [grupoSeleccionado]);

    const handleNotaChange = (inscId, evalId, value) => {
        const numVal = value === "" ? "" : Math.min(100, Math.max(0, parseFloat(value) || 0));
        setNotas({ ...notas, [`${inscId}_${evalId}`]: numVal });
    };

    const handleSave = async () => {
        setSaving(true); setError(""); setSuccess("");
        try {
            const notasToSave = [];
            for (const est of estudiantes) {
                for (const ev of evaluaciones) {
                    const key = `${est.id}_${ev.id}`;
                    if (notas[key] !== undefined && notas[key] !== "") {
                        notasToSave.push({
                            inscripcion_id: est.id,
                            evaluacion_id: ev.id,
                            nota: parseFloat(notas[key]),
                        });
                    }
                }
            }
            await notaService.bulkUpsert(notasToSave);
            setSuccess("Calificaciones guardadas correctamente");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    const calcFinal = (inscId) => {
        let total = 0;
        evaluaciones.forEach((ev) => {
            const nota = parseFloat(notas[`${inscId}_${ev.id}`]) || 0;
            total += nota * (parseFloat(ev.porcentaje) / 100);
        });
        return total.toFixed(1);
    };

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary-600" /> Registro de Calificaciones
                </h1>
                <p className="text-slate-500 mt-1">Ingresa y modifica las notas de tus estudiantes</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}
            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{success}</div>}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Seleccionar Grupo</label>
                        <select value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">-- Seleccione un grupo --</option>
                            {grupos.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.materia?.sigla} | Grupo {g.paralelo} | {g.materia?.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 sm:ml-auto">
                        {grupoSeleccionado && estudiantes.length > 0 && (
                            <button
                                onClick={() => {
                                    const grupo = grupos.find((g) => String(g.id) === grupoSeleccionado);
                                    if (grupo) generarReporteCalificaciones(grupo, estudiantes, evaluaciones, notas, user);
                                }}
                                className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                                <FileDown className="w-5 h-5" />
                                Exportar PDF
                            </button>
                        )}
                        <button onClick={handleSave} disabled={saving || !grupoSeleccionado}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/30 flex items-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Guardar Cambios
                        </button>
                    </div>
                </div>

                {grupoSeleccionado ? (
                    loadingNotas ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                    ) : estudiantes.length === 0 ? (
                        <div className="p-12 text-center"><p className="text-slate-500">No hay estudiantes inscritos en este grupo</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                                        <th className="px-6 py-4">Estudiante</th>
                                        {evaluaciones.map((ev) => (
                                            <th key={ev.id} className="px-6 py-4 text-center">
                                                {ev.nombre} ({ev.porcentaje}%)
                                            </th>
                                        ))}
                                        <th className="px-6 py-4 text-right">Nota Final</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-200">
                                    {estudiantes.map((est) => (
                                        <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">
                                                    {est.estudiante?.persona?.nombres} {est.estudiante?.persona?.paterno}
                                                </div>
                                                <div className="text-xs text-slate-500 font-mono">{est.estudiante?.persona?.carnet}</div>
                                            </td>
                                            {evaluaciones.map((ev) => (
                                                <td key={ev.id} className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="0" max="100" step="0.1"
                                                        value={notas[`${est.id}_${ev.id}`] ?? ""}
                                                        onChange={(e) => handleNotaChange(est.id, ev.id, e.target.value)}
                                                        className="w-20 mx-auto block text-center border border-slate-200 rounded p-1.5 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-slate-800 text-lg">{calcFinal(est.id)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Ningún grupo seleccionado</h3>
                        <p className="text-slate-500 mt-1 max-w-sm mx-auto">Selecciona un grupo para comenzar a registrar notas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
