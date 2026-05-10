import { supabase } from "../lib/supabaseClient";

/**
 * Servicio para operaciones CRUD sobre la tabla `periodo`.
 */
const periodoService = {
    /**
     * Obtener todos los periodos ordenados por fecha.
     */
    async getAll() {
        const { data, error } = await supabase
            .from("periodo")
            .select("*")
            .order("fecha_inicio", { ascending: false });
        if (error) throw error;
        return data;
    },

    /**
     * Obtener el periodo activo actual.
     */
    async getActivo() {
        const { data, error } = await supabase
            .from("periodo")
            .select("*")
            .eq("estado", true)
            .order("fecha_inicio", { ascending: false })
            .limit(1)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Obtener un periodo por ID.
     */
    async getById(id) {
        const { data, error } = await supabase
            .from("periodo")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Crear un nuevo periodo.
     */
    async create(periodoData) {
        const { data, error } = await supabase
            .from("periodo")
            .insert(periodoData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Actualizar un periodo.
     */
    async update(id, periodoData) {
        const { data, error } = await supabase
            .from("periodo")
            .update(periodoData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Cambiar estado de un periodo (abrir/cerrar).
     */
    async toggleEstado(id, estado) {
        const { data, error } = await supabase
            .from("periodo")
            .update({ estado })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Eliminar un periodo.
     */
    async delete(id) {
        const { error } = await supabase
            .from("periodo")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
};

export default periodoService;
