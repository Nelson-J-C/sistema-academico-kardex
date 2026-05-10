import React, { useState, useEffect } from "react";
import { FileText, Download, Award, CheckCircle2, XCircle, Loader2, FileDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import kardexService from "../../services/kardexService";
import inscripcionService from "../../services/inscripcionService";
import { generarHistorialAcademico } from "../../utils/pdfReports";

export default function KardexView() {
    const { user } = useAuth();
    const [kardexData, setKardexData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKardex = async () => {
            try {
                setLoading(true);
                if (user?.estudiante_id) {
                    const data = await kardexService.getByEstudianteId(user.estudiante_id);
                    setKardexData(data || []);
                }
            } catch (err) {
                console.error("Error cargando kardex:", err);
            } finally { setLoading(false); }
        };
        fetchKardex();
    }, [user?.estudiante_id]);

    // Agrupar por periodo
    const periodos = {};
    kardexData.forEach((item) => {
        const p = item.periodo || "Sin periodo";
        if (!periodos[p]) periodos[p] = [];
        periodos[p].push(item);
    });

    const totalMaterias = kardexData.length;
    const materiasAprobadas = kardexData.filter((k) => parseFloat(k.nota_final) >= 51).length;
    const promedioGlobal = totalMaterias > 0
        ? (kardexData.reduce((sum, k) => sum + (parseFloat(k.nota_final) || 0), 0) / totalMaterias).toFixed(1)
        : "0.0";

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                        <FileText className="w-8 h-8 text-primary-600" /> Kardex Académico Oficial
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Historial completo y certificado de calificaciones</p>
                </div>
                <button
                    onClick={() => generarHistorialAcademico(kardexData, user)}
                    className="relative z-10 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2"
                >
                    <FileDown className="w-5 h-5" />
                    Descargar Historial PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-lg shadow-primary-600/30 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <Award className="w-32 h-32" />
                    </div>
                    <p className="text-primary-100 font-medium mb-1 relative z-10">Promedio Ponderado Global</p>
                    <h3 className="text-5xl font-black relative z-10">{promedioGlobal}</h3>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Materias Cursadas</p>
                        <h3 className="text-3xl font-bold text-slate-800">{totalMaterias}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Materias Aprobadas</p>
                        <h3 className="text-3xl font-bold text-slate-800">{materiasAprobadas} <span className="text-sm text-slate-400 font-normal">/ {totalMaterias}</span></h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {Object.keys(periodos).length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">No hay registros en tu kardex aún</p>
                </div>
            ) : (
                <div className="space-y-8 mt-8">
                    {Object.entries(periodos).map(([periodo, materias], idx) => {
                        const promPeriodo = materias.length > 0
                            ? (materias.reduce((s, m) => s + (parseFloat(m.nota_final) || 0), 0) / materias.length).toFixed(1)
                            : "0.0";
                        return (
                            <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                                    <h2 className="font-bold text-xl text-slate-800 tracking-tight">Periodo: {periodo}</h2>
                                    <span className="bg-primary-100 text-primary-800 text-sm font-bold px-3 py-1 rounded-full">
                                        Promedio: {promPeriodo}
                                    </span>
                                </div>
                                <div className="overflow-x-auto p-4">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Asignatura</th>
                                                <th className="px-6 py-4 text-center">Nota Final</th>
                                                <th className="px-6 py-4 text-right">Resultado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-slate-50">
                                            {materias.map((mat, i) => {
                                                const nota = parseFloat(mat.nota_final) || 0;
                                                const aprobado = nota >= 51;
                                                return (
                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-800">{mat.materia}</td>
                                                        <td className="px-6 py-4 text-center font-black text-lg text-slate-900">{nota.toFixed(1)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${aprobado ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                                                {aprobado ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                                {aprobado ? "Aprobado" : "Reprobado"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
