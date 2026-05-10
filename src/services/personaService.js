import { supabase } from "../lib/supabaseClient";

/**
 * Servicio para operaciones CRUD sobre la tabla `persona`.
 */
const personaService = {
    /**
     * Obtener todas las personas.
     */
    async getAll() {
        const { data, error } = await supabase
            .from("persona")
            .select("*")
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    /**
     * Obtener una persona por su ID.
     */
    async getById(id) {
        const { data, error } = await supabase
            .from("persona")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Crear una nueva persona.
     */
    async create(personaData) {
        const { data, error } = await supabase
            .from("persona")
            .insert(personaData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Actualizar los datos de una persona.
     */
    async update(id, personaData) {
        const { data, error } = await supabase
            .from("persona")
            .update(personaData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Eliminar una persona por su ID.
     */
    async delete(id) {
        const { error } = await supabase
            .from("persona")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
};

export default personaService;
