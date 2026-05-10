import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, UserCircle, Save, Mail, Phone, Lock, Loader2 } from "lucide-react";
import personaService from "../services/personaService";

export default function ProfileModal({ isOpen, onClose }) {
    const { user, setUser } = useAuth();

    const [formData, setFormData] = useState({
        nombres: user?.nombres || "",
        paterno: user?.paterno || "",
        materno: user?.materno || "",
        correo: user?.correo || "",
        telefono: user?.telefono || "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!isOpen || !user) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await personaService.update(user.persona_id, {
                nombres: formData.nombres,
                paterno: formData.paterno,
                materno: formData.materno,
                correo: formData.correo,
                telefono: formData.telefono,
            });
            // Update local user state
            const updatedUser = {
                ...user,
                nombres: formData.nombres,
                paterno: formData.paterno,
                materno: formData.materno,
                correo: formData.correo,
                telefono: formData.telefono,
            };
            setUser(updatedUser);
            localStorage.setItem("kardex_session", JSON.stringify(updatedUser));
            setSuccess("Datos actualizados correctamente");
            setTimeout(() => { setSuccess(""); onClose(); }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in relative z-10 border border-white">
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                            <UserCircle className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight">Mi Perfil</h2>
                            <p className="text-primary-100 text-sm opacity-90">
                                Actualiza tu información personal
                            </p>
                            <p className="text-primary-200 text-xs mt-1">
                                Usuario: {user.username} • Rol: {user.rol}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>
                    )}
                    {success && (
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm border border-emerald-100">{success}</div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Nombres
                        </label>
                        <input
                            type="text"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-slate-800"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Ap. Paterno
                            </label>
                            <input
                                type="text"
                                name="paterno"
                                value={formData.paterno}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Ap. Materno
                            </label>
                            <input
                                type="text"
                                name="materno"
                                value={formData.materno}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-slate-800"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> Correo Electrónico
                        </label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> Teléfono
                        </label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-slate-800"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-primary-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
