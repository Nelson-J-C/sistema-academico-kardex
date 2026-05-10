import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import CarrerasView from "./pages/admin/CarrerasView";
import EstudiantesView from "./pages/admin/EstudiantesView";
import DocentesView from "./pages/admin/DocentesView";
import MateriasView from "./pages/admin/MateriasView";
import PeriodosView from "./pages/admin/PeriodosView";
import AdminGruposView from "./pages/admin/GruposView";

// Docente
import DocenteDashboard from "./pages/DocenteDashboard";
import GruposView from "./pages/docente/GruposView";
import CalificacionesView from "./pages/docente/CalificacionesView";

// Estudiante
import EstudianteDashboard from "./pages/EstudianteDashboard";
import KardexView from "./pages/estudiante/KardexView";
import InscripcionesView from "./pages/estudiante/InscripcionesView";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Default redirect */}
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        element={<DashboardLayout allowedRoles={["admin"]} />}
                    >
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route
                            path="/admin/carreras"
                            element={<CarrerasView />}
                        />
                        <Route
                            path="/admin/estudiantes"
                            element={<EstudiantesView />}
                        />
                        <Route
                            path="/admin/docentes"
                            element={<DocentesView />}
                        />
                        <Route
                            path="/admin/materias"
                            element={<MateriasView />}
                        />
                        <Route
                            path="/admin/periodos"
                            element={<PeriodosView />}
                        />
                        <Route
                            path="/admin/grupos"
                            element={<AdminGruposView />}
                        />
                    </Route>

                    {/* Docente Routes */}
                    <Route
                        element={<DashboardLayout allowedRoles={["docente"]} />}
                    >
                        <Route path="/docente" element={<DocenteDashboard />} />
                        <Route
                            path="/docente/grupos"
                            element={<GruposView />}
                        />
                        <Route
                            path="/docente/calificaciones"
                            element={<CalificacionesView />}
                        />
                    </Route>

                    {/* Estudiante Routes */}
                    <Route
                        element={
                            <DashboardLayout allowedRoles={["estudiante"]} />
                        }
                    >
                        <Route
                            path="/estudiante"
                            element={<EstudianteDashboard />}
                        />
                        <Route
                            path="/estudiante/kardex"
                            element={<KardexView />}
                        />
                        <Route
                            path="/estudiante/inscripciones"
                            element={<InscripcionesView />}
                        />
                    </Route>

                    {/* Fallback */}
                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
