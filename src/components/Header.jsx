import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, Search, UserCircle, ChevronDown } from "lucide-react";
import ProfileModal from "./ProfileModal";

export default function Header() {
    const { user } = useAuth();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm transition-all">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex-1 flex items-center">
                        <div className="relative w-full max-w-md group">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                <Search className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all focus:bg-white shadow-inner"
                                placeholder="Buscar..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200"></div>

                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 leading-none">
                                    {user?.nombres} {user?.paterno}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 capitalize">
                                    {user?.rol}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-md">
                                <UserCircle className="w-5 h-5" />
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </header>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
}
