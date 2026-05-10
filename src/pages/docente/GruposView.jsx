import React, { useState, useEffect } from "react";
import { Users, BookOpen, Clock, ChevronRight, Loader2, FileDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import grupoService from "../../services/grupoService";
import inscripcionService from "../../services/inscripcionService";
import { generarReporteInscritosPorMateria } from "../../utils/pdfReports";

export default function GruposView() {
    const { user } = useAuth();
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    const handleDownloadLista = async (grupo) => {
        setDownloading(grupo.id);
        try {
            const inscs = await inscripcionService.getByGrupoId(grupo.id);
            generarReporteInscritosPorMateria(grupo, inscs, user);
        } catch (err) { console.error(err); }
        finally { setDownloading(null); }
    };

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                setLoading(true);
                if (user?.docente_id) {
                    const data = await grupoService.getByDocenteId(user.docente_id);
                    setGrupos(data.filter((g) => g.periodo?.estado === true));
                }
            } catch (err) {
                console.error("Error cargando grupos:", err);
            } finally { setLoading(false); }
        };
        fetchGrupos();
    }, [user?.docente_id]);

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary-600" /> Mis Grupos Asignados
                </h1>
                <p className="text-slate-500 mt-1">Gestiona los estudiantes inscritos en tus materias</p>
            </div>

            {grupos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">No tienes grupos asignados en este periodo</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grupos.map((grupo) => (
                        <div key={grupo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                                        Grupo {grupo.paralelo}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                                        {grupo.periodo?.codigo || ""}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{grupo.materia?.nombre}</h3>
                                        <p className="text-sm text-slate-500 font-mono">{grupo.materia?.sigla}</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><Users className="w-4 h-4" /> Inscritos</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="bg-primary-500 h-full rounded-full" style={{ width: `${grupo.cupo ? (grupo.inscritosCount / grupo.cupo) * 100 : 0}%` }}></div>
                                            </div>
                                            <span className="font-medium text-slate-700">{grupo.inscritosCount}/{grupo.cupo || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="flex items-center gap-1 text-sm font-bold text-primary-600">
                                    {grupo.inscritosCount} estudiantes inscritos
                                </span>
                                <button
                                    onClick={() => handleDownloadLista(grupo)}
                                    disabled={downloading === grupo.id}
                                    className="text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                                >
                                    {downloading === grupo.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                                    Lista PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
