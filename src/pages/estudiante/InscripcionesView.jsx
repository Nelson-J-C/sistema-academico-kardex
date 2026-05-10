import React, { useState, useEffect } from "react";
import { Calendar, Check, AlertCircle, X, Loader2, Trash2, FileDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import grupoService from "../../services/grupoService";
import inscripcionService from "../../services/inscripcionService";
import periodoService from "../../services/periodoService";
import kardexService from "../../services/kardexService";
import estudianteService from "../../services/estudianteService";
import { generarBoletaInscripcion } from "../../utils/pdfReports";

export default function InscripcionesView() {
    const { user } = useAuth();
    const [gruposDisponibles, setGruposDisponibles] = useState([]);
    const [misInscripciones, setMisInscripciones] = useState([]);
    const [periodoActivo, setPeriodoActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inscribiendo, setInscribiendo] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const periodo = await periodoService.getActivo();
            setPeriodoActivo(periodo);
            if (periodo && user?.estudiante_id) {
                // Obtener carrera_id directamente de la BD
                const estudiante = await estudianteService.getById(user.estudiante_id);
                const carreraId = estudiante?.carrera_id ? Number(estudiante.carrera_id) : null;

                const [grupos, inscripciones, kardex] = await Promise.all([
                    grupoService.getByPeriodoId(periodo.id),
                    inscripcionService.getByEstudianteId(user.estudiante_id),
                    kardexService.getByEstudianteId(user.estudiante_id),
                ]);

                // IDs y nombres de materias ya aprobadas (nota >= 51)
                const aprobadasIds = new Set();
                const aprobadasNombres = new Set();
                (kardex || []).forEach((k) => {
                    if (parseFloat(k.nota_final) >= 51) {
                        if (k.materia_id) aprobadasIds.add(Number(k.materia_id));
                        if (k.materia) aprobadasNombres.add(k.materia.toLowerCase().trim());
                    }
                });

                // Filtrar: solo carrera del estudiante + no aprobadas
                const gruposFiltrados = grupos.filter((g) => {
                    // Filtrar por carrera
                    const matchCarrera = !carreraId || Number(g.materia?.carrera_id) === carreraId;
                    // Verificar si ya fue aprobada
                    const aprobadaPorId = g.materia_id && aprobadasIds.has(Number(g.materia_id));
                    const aprobadaPorNombre = g.materia?.nombre && aprobadasNombres.has(g.materia.nombre.toLowerCase().trim());
                    return matchCarrera && !aprobadaPorId && !aprobadaPorNombre;
                });

                setGruposDisponibles(gruposFiltrados);
                setMisInscripciones(inscripciones.filter((i) => i.grupo?.periodo?.id === periodo.id && i.estado === "activo"));
            }
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [user?.estudiante_id]);

    const isInscrito = (grupoId) => misInscripciones.some((i) => i.grupo_id === grupoId);

    const handleInscribir = async (grupoId) => {
        setInscribiendo(grupoId); setError(""); setSuccess("");
        try {
            await inscripcionService.create({ estudiante_id: user.estudiante_id, grupo_id: grupoId });
            setSuccess("Inscripción realizada correctamente");
            setTimeout(() => setSuccess(""), 3000);
            await fetchData();
        } catch (err) { setError(err.message); }
        finally { setInscribiendo(null); }
    };

    const handleDesinscribir = async (inscripcionId) => {
        if (!confirm("¿Quitar esta inscripción?")) return;
        try {
            await inscripcionService.delete(inscripcionId);
            await fetchData();
        } catch (err) { setError(err.message); }
    };

    // Agrupar por materia
    const materiaGroups = {};
    gruposDisponibles.forEach((g) => {
        const key = g.materia?.id || g.id;
        if (!materiaGroups[key]) {
            materiaGroups[key] = { materia: g.materia, grupos: [] };
        }
        materiaGroups[key].grupos.push(g);
    });

    const totalCreditos = misInscripciones.reduce((s, i) => s + (i.grupo?.materia?.creditos || 0), 0);

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary-600" /> Inscripción de Materias
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {periodoActivo ? `Periodo ${periodoActivo.codigo} - ${periodoActivo.descripcion}` : "No hay periodo activo"}
                    </p>
                </div>
                {misInscripciones.length > 0 && (
                    <button
                        onClick={() => generarBoletaInscripcion(misInscripciones, user, periodoActivo)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2"
                    >
                        <FileDown className="w-5 h-5" />
                        Boleta PDF
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button></div>}
            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2"><Check className="w-5 h-5" />{success}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800">Materias Ofertadas</h2>
                    {Object.values(materiaGroups).length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500">No hay materias ofertadas en este periodo</p>
                        </div>
                    ) : (
                        Object.values(materiaGroups).map(({ materia, grupos }) => (
                            <div key={materia?.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                                    <h3 className="font-bold text-lg text-slate-800">{materia?.nombre}</h3>
                                    <p className="text-sm text-slate-500 font-mono">{materia?.sigla} • {materia?.creditos} Créditos</p>
                                </div>
                                <div className="p-4 divide-y divide-slate-100">
                                    {grupos.map((grupo) => {
                                        const cuposDisp = (grupo.cupo || 0) - grupo.inscritosCount;
                                        const yaInscrito = isInscrito(grupo.id);
                                        return (
                                            <div key={grupo.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">Grupo {grupo.paralelo}</span>
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {grupo.docente?.persona?.nombres} {grupo.docente?.persona?.paterno}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className={`text-sm font-bold ${cuposDisp > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                            {cuposDisp > 0 ? `${cuposDisp} cupos` : "Lleno"}
                                                        </p>
                                                        <p className="text-xs text-slate-400">de {grupo.cupo} en total</p>
                                                    </div>
                                                    {yaInscrito ? (
                                                        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Inscrito ✓
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleInscribir(grupo.id)}
                                                            disabled={cuposDisp <= 0 || inscribiendo === grupo.id}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${cuposDisp > 0 ? "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                                                        >
                                                            {inscribiendo === grupo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : cuposDisp > 0 ? "Inscribir" : "Lleno"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div>
                    <div className="bg-white rounded-2xl border border-primary-200 shadow-md shadow-primary-500/10 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                            Mis Inscripciones Actuales
                        </h2>
                        {misInscripciones.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No tienes inscripciones aún</p>
                        ) : (
                            <div className="space-y-4 mb-6">
                                {misInscripciones.map((insc) => (
                                    <div key={insc.id} className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-800">{insc.grupo?.materia?.nombre}</p>
                                            <p className="text-xs text-slate-500">Grupo {insc.grupo?.paralelo} • {insc.grupo?.materia?.creditos} Créditos</p>
                                        </div>
                                        <button onClick={() => handleDesinscribir(insc.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="border-t border-slate-100 pt-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Total Créditos:</span>
                                <span className="font-bold text-slate-800">{totalCreditos}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-2">
                                <span className="text-slate-500">Materias:</span>
                                <span className="font-bold text-slate-800">{misInscripciones.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
