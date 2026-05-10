import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Portal from "./Portal";

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }) {
    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel}></div>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 animate-scale-in overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-7 h-7 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{title || "Confirmar eliminación"}</h3>
                        <p className="text-sm text-slate-500">{message || "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."}</p>
                    </div>
                    <div className="flex border-t border-slate-100">
                        <button onClick={onCancel} className="flex-1 px-4 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                        <button onClick={onConfirm} className="flex-1 px-4 py-3.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">Eliminar</button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
