import React, { useState, useEffect } from "react";
import { BookOpen, GraduationCap, Award, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import kardexService from "../services/kardexService";
import inscripcionService from "../services/inscripcionService";
import notaService from "../services/notaService";
import evaluacionService from "../services/evaluacionService";

export default function EstudianteDashboard() {
    const { user } = useAuth();
    const [kardex, setKardex] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [notasActuales, setNotasActuales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (!user?.estudiante_id) return;
                const [kd, inscs] = await Promise.all([
                    kardexService.getByEstudianteId(user.estudiante_id),
                    inscripcionService.getByEstudianteId(user.estudiante_id),
                ]);
                setKardex(kd || []);
                // Only active period inscriptions
                const activas = inscs.filter((i) => i.estado === "activo" && i.grupo?.periodo?.estado === true);
                setInscripciones(activas);
                // Fetch notas for active inscriptions
                const notasArr = [];
                for (const insc of activas) {
                    const notas = await notaService.getByInscripcionId(insc.id);
                    notasArr.push({ inscripcion: insc, notas });
                }
                setNotasActuales(notasArr);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user?.estudiante_id]);

    const totalKardex = kardex.length;
    const aprobadas = kardex.filter((k) => parseFloat(k.nota_final) >= 51).length;
    const promedioGlobal = totalKardex > 0
        ? (kardex.reduce((s, k) => s + (parseFloat(k.nota_final) || 0), 0) / totalKardex).toFixed(1)
        : "0.0";

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mi Portal Estudiantil</h1>
                <p className="text-slate-500 mt-1">Bienvenido, {user?.nombres} {user?.paterno}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-primary-100 font-medium mb-1">Promedio General</p>
                            <h3 className="text-3xl font-bold">{promedioGlobal}</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Materias Aprobadas</p>
                            <h3 className="text-2xl font-bold text-slate-800">{aprobadas} / {totalKardex}</h3>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    {totalKardex > 0 && (
                        <>
                            <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(aprobadas / totalKardex) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-right">{((aprobadas / totalKardex) * 100).toFixed(0)}% aprobadas</p>
                        </>
                    )}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Materias Inscritas</p>
                            <h3 className="text-2xl font-bold text-slate-800">{inscripciones.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4">Periodo Actual</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Materias en Curso</h2>
                {inscripciones.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No estás inscrito en materias actualmente</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-sm font-medium text-slate-500">
                                    <th className="pb-3 font-semibold pl-2">Materia</th>
                                    <th className="pb-3 font-semibold">Docente</th>
                                    <th className="pb-3 font-semibold">Grupo</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-50">
                                {inscripciones.map((insc) => (
                                    <tr key={insc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 font-medium text-slate-800 pl-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <span>{insc.grupo?.materia?.nombre}</span>
                                                    <p className="text-xs text-slate-400 font-mono">{insc.grupo?.materia?.sigla}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-slate-600">
                                            {insc.grupo?.docente?.persona?.nombres} {insc.grupo?.docente?.persona?.paterno}
                                        </td>
                                        <td className="py-3 text-slate-600">
                                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">
                                                {insc.grupo?.paralelo}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
