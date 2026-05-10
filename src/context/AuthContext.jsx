import React, { createContext, useContext, useState, useEffect } from "react";
import usuarioService from "../services/usuarioService";
import estudianteService from "../services/estudianteService";
import docenteService from "../services/docenteService";

const AuthContext = createContext(null);

const SESSION_KEY = "kardex_session";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al montar, restaurar sesión desde localStorage
    useEffect(() => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem(SESSION_KEY);
            }
        }
        setLoading(false);
    }, []);

    /**
     * Iniciar sesión con username y password contra la tabla usuario.
     */
    const login = async (username, password) => {
        const profile = await usuarioService.login(username, password);

        // Obtener IDs específicos según rol
        let extra = {};
        if (profile.rol === "estudiante") {
            try {
                const est = await estudianteService.getByPersonaId(profile.persona_id);
                extra.estudiante_id = est.id;
                extra.carrera = est.carrera?.nombre || "";
                extra.carrera_id = est.carrera_id || null;
                extra.registro_universitario = est.registro_universitario || "";
                extra.carnet = est.persona?.carnet || "";
            } catch { /* puede no existir aún */ }
        } else if (profile.rol === "docente") {
            try {
                const doc = await docenteService.getByPersonaId(profile.persona_id);
                extra.docente_id = doc.id;
                extra.especialidad = doc.especialidad || "";
            } catch { /* puede no existir aún */ }
        }

        const fullUser = { ...profile, ...extra };
        setUser(fullUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(fullUser));
        return fullUser;
    };

    /**
     * Cerrar sesión.
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
    };

    // Pantalla de carga mientras se verifica la sesión
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};
