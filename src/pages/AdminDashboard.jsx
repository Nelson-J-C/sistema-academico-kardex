import React, { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, Calendar, TrendingUp, ChevronDown, Award, Loader2 } from "lucide-react";
import estudianteService from "../services/estudianteService";
import docenteService from "../services/docenteService";
import materiaService from "../services/materiaService";
import grupoService from "../services/grupoService";
import periodoService from "../services/periodoService";

const StatCard = ({ title, value, icon: Icon, colorClass, loading }) => (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-7 h-7" />
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : value}
                </h3>
            </div>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({ estudiantes: 0, docentes: 0, materias: 0, grupos: 0 });
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [estCount, docCount, mats, grpCount, pers] = await Promise.all([
                    estudianteService.count(),
                    docenteService.count(),
                    materiaService.getAll(),
                    grupoService.count(),
                    periodoService.getAll(),
                ]);
                setStats({
                    estudiantes: estCount || 0,
                    docentes: docCount || 0,
                    materias: mats?.length || 0,
                    grupos: grpCount || 0,
                });
                setPeriodos(pers || []);
            } catch (err) { console.error("Error stats:", err); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Administrativo</h1>
                    <p className="text-slate-500 mt-1 font-medium">Estadísticas e índices de la gestión académica</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer hover:bg-slate-100 shadow-sm">
                            {periodos.map((p) => <option key={p.id} value={p.codigo}>{p.descripcion || p.codigo}</option>)}
                            {periodos.length === 0 && <option>Sin periodos</option>}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Estudiantes" value={stats.estudiantes} icon={Users} loading={loading}
                    colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700" />
                <StatCard title="Docentes" value={stats.docentes} icon={GraduationCap} loading={loading}
                    colorClass="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700" />
                <StatCard title="Materias" value={stats.materias} icon={BookOpen} loading={loading}
                    colorClass="bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700" />
                <StatCard title="Grupos" value={stats.grupos} icon={Calendar} loading={loading}
                    colorClass="bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Periodos Académicos</h2>
                <p className="text-slate-500 text-sm mb-6">Lista de gestiones registradas en el sistema</p>
                {periodos.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No hay periodos registrados</p>
                ) : (
                    <div className="space-y-3">
                        {periodos.map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div>
                                    <span className="font-bold text-slate-800">{p.codigo}</span>
                                    <span className="text-slate-500 ml-3 text-sm">{p.descripcion}</span>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${p.estado ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-300"}`}>
                                    {p.estado ? "Activo" : "Cerrado"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
