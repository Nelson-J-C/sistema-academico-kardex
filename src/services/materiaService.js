import { supabase } from "../lib/supabaseClient";

/**
 * Servicio para operaciones CRUD sobre la tabla `materia`.
 */
const materiaService = {
    /**
     * Obtener todas las materias con el nombre de la carrera.
     */
    async getAll() {
        const { data, error } = await supabase
            .from("materia")
            .select(`
                *,
                carrera:carrera_id (id, nombre)
            `)
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    /**
     * Obtener materias filtradas por carrera.
     */
    async getByCarreraId(carreraId) {
        const { data, error } = await supabase
            .from("materia")
            .select(`
                *,
                carrera:carrera_id (id, nombre)
            `)
            .eq("carrera_id", carreraId)
            .order("sigla", { ascending: true });
        if (error) throw error;
        return data;
    },

    /**
     * Obtener una materia por ID.
     */
    async getById(id) {
        const { data, error } = await supabase
            .from("materia")
            .select(`
                *,
                carrera:carrera_id (id, nombre)
            `)
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Crear una nueva materia.
     */
    async create(materiaData) {
        const { data, error } = await supabase
            .from("materia")
            .insert(materiaData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Actualizar una materia.
     */
    async update(id, materiaData) {
        const { data, error } = await supabase
            .from("materia")
            .update(materiaData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Eliminar una materia.
     */
    async delete(id) {
        const { error } = await supabase
            .from("materia")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
};

export default materiaService;
