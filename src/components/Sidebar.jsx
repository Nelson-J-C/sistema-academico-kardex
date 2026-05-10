import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    GraduationCap,
    FileText,
    Briefcase,
    Layers,
    LogOut,
} from "lucide-react";
import { cn } from "../utils/cn";

export default function Sidebar() {
    const { user, logout } = useAuth();

    const adminLinks = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Carreras", path: "/admin/carreras", icon: Briefcase },
        { name: "Estudiantes", path: "/admin/estudiantes", icon: Users },
        { name: "Docentes", path: "/admin/docentes", icon: GraduationCap },
        { name: "Materias", path: "/admin/materias", icon: BookOpen },
        { name: "Periodos", path: "/admin/periodos", icon: Calendar },
        { name: "Grupos", path: "/admin/grupos", icon: Layers },
    ];

    const docenteLinks = [
        { name: "Dashboard", path: "/docente", icon: LayoutDashboard },
        { name: "Mis Grupos", path: "/docente/grupos", icon: Users },
        {
            name: "Calificaciones",
            path: "/docente/calificaciones",
            icon: FileText,
        },
    ];

    const estudianteLinks = [
        { name: "Dashboard", path: "/estudiante", icon: LayoutDashboard },
        { name: "Mi Kardex", path: "/estudiante/kardex", icon: FileText },
        {
            name: "Inscripciones",
            path: "/estudiante/inscripciones",
            icon: Calendar,
        },
    ];

    let links = [];
    if (user?.rol === "admin") links = adminLinks;
    if (user?.rol === "docente") links = docenteLinks;
    if (user?.rol === "estudiante") links = estudianteLinks;

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-xl">
                    SA
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-tight">Sistema</h2>
                    <p className="text-xs text-slate-400">
                        Académico Profesional
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
                    Menú Principal
                </p>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === `/${user?.rol}`}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary-600 text-white shadow-lg shadow-primary-900/50"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white",
                                    )
                                }
                            >
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                                    )}
                                />
                                <span className="font-medium">{link.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
