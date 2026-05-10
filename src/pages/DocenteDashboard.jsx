import React, { useState, useEffect } from "react";
import { Users, FileText, Clock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import grupoService from "../services/grupoService";

export default function DocenteDashboard() {
    const { user } = useAuth();
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                if (user?.docente_id) {
                    const data = await grupoService.getByDocenteId(user.docente_id);
                    setGrupos(data);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [user?.docente_id]);

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Portal Docente</h1>
                <p className="text-slate-500 mt-1">Bienvenido, {user?.nombres} {user?.paterno}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-500" /> Mis Grupos Actuales
                        </h2>
                        {grupos.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No tienes grupos asignados</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {grupos.map((grupo) => (
                                    <div key={grupo.id} className="border border-slate-200 rounded-xl p-4 hover:border-primary-300 transition-colors group cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded">
                                                Grupo {grupo.paralelo}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">{grupo.materia?.sigla}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 leading-tight mb-1">{grupo.materia?.nombre}</h3>
                                        <p className="text-sm text-slate-500">{grupo.periodo?.codigo}</p>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                            <span className="text-sm font-medium text-slate-600">{grupo.inscritosCount} estudiantes</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-amber-500" /> Resumen
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3">
                                <span className="text-sm text-slate-600">Total Grupos</span>
                                <span className="font-bold text-slate-800">{grupos.length}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3">
                                <span className="text-sm text-slate-600">Total Estudiantes</span>
                                <span className="font-bold text-slate-800">
                                    {grupos.reduce((s, g) => s + g.inscritosCount, 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
