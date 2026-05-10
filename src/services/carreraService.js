import { supabase } from "../lib/supabaseClient";

/**
 * Servicio para operaciones CRUD sobre la tabla `carrera`.
 */
const carreraService = {
    /**
     * Obtener todas las carreras con conteos de materias y estudiantes.
     */
    async getAll() {
        const { data, error } = await supabase
            .from("carrera")
            .select(`
                *,
                materia (id),
                estudiante (id)
            `)
            .order("id", { ascending: true });
        if (error) throw error;

        return data.map((c) => ({
            ...c,
            materiasCount: c.materia?.length || 0,
            estudiantesCount: c.estudiante?.length || 0,
        }));
    },

    /**
     * Obtener una carrera por ID.
     */
    async getById(id) {
        const { data, error } = await supabase
            .from("carrera")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Crear una nueva carrera.
     */
    async create(carreraData) {
        const { data, error } = await supabase
            .from("carrera")
            .insert(carreraData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Actualizar una carrera.
     */
    async update(id, carreraData) {
        const { data, error } = await supabase
            .from("carrera")
            .update(carreraData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Eliminar una carrera.
     */
    async delete(id) {
        const { error } = await supabase
            .from("carrera")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
};

export default carreraService;
