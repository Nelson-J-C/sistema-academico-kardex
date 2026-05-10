import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, User, Loader2 } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-primary-500/50 mb-6 rotate-3 hover:rotate-6 transition-transform">
                SA
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Bienvenido de nuevo
            </h1>
            <p className="text-slate-500 mb-8 text-center">
                Ingresa tus credenciales para acceder al sistema académico.
            </p>

            {error && (
                <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center justify-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Usuario
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <User className="h-5 w-5" />
                        </div>
                        <input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 backdrop-blur-sm transition-all outline-none"
                            placeholder="tu_usuario"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Contraseña
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 backdrop-blur-sm transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "Iniciar Sesión"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-500">
                <p>Ingresa con tu nombre de usuario y contraseña registrados.</p>
            </div>
        </div>
    );
}
