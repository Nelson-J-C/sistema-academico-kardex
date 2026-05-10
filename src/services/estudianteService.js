import { supabase } from "../lib/supabaseClient";

/**
 * Servicio para operaciones CRUD sobre la tabla `estudiante`.
 */
const estudianteService = {
    /**
     * Obtener todos los estudiantes con datos de persona y carrera.
     */
    async getAll() {
        const { data, error } = await supabase
            .from("estudiante")
            .select(`
                *,
                persona:persona_id (*),
                carrera:carrera_id (id, nombre)
            `)
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    /**
     * Obtener un estudiante por ID con persona y carrera.
     */
    async getById(id) {
        const { data, error } = await supabase
            .from("estudiante")
            .select(`
                *,
                persona:persona_id (*),
                carrera:carrera_id (id, nombre)
            `)
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Obtener un estudiante por persona_id.
     */
    async getByPersonaId(personaId) {
        const { data, error } = await supabase
            .from("estudiante")
            .select(`
                *,
                persona:persona_id (*),
                carrera:carrera_id (id, nombre)
            `)
            .eq("persona_id", personaId)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Obtener estudiantes filtrados por carrera.
     */
    async getByCarreraId(carreraId) {
        const { data, error } = await supabase
            .from("estudiante")
            .select(`
                *,
                persona:persona_id (*),
                carrera:carrera_id (id, nombre)
            `)
            .eq("carrera_id", carreraId)
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    /**
     * Crear un nuevo estudiante (primero crea la persona).
     */
    async create({ personaData, estudianteData }) {
        // 1. Crear persona
        const { data: persona, error: personaError } = await supabase
            .from("persona")
            .insert(personaData)
            .select()
            .single();
        if (personaError) throw personaError;

        // 2. Crear estudiante vinculado a la persona
        const { data: estudiante, error: estError } = await supabase
            .from("estudiante")
            .insert({
                persona_id: persona.id,
                ...estudianteData,
            })
            .select(`
                *,
                persona:persona_id (*),
                carrera:carrera_id (id, nombre)
            `)
            .single();
        if (estError) throw estError;

        return estudiante;
    },

    /**
     * Actualizar un estudiante y su persona.
     */
    async update(id, { personaData, estudianteData }) {
        // Obtener persona_id del estudiante
        const { data: est, error: fetchErr } = await supabase
            .from("estudiante")
            .select("persona_id")
            .eq("id", id)
            .single();
        if (fetchErr) throw fetchErr;

        // Actualizar persona
        if (personaData && Object.keys(personaData).length > 0) {
            const { error: perErr } = await supabase
                .from("persona")
                .update(personaData)
                .eq("id", est.persona_id);
            if (perErr) throw perErr;
        }

        // Actualizar estudiante
        if (estudianteData && Object.keys(estudianteData).length > 0) {
            const { error: estErr } = await supabase
                .from("estudiante")
                .update(estudianteData)
                .eq("id", id);
            if (estErr) throw estErr;
        }

        return await this.getById(id);
    },

    /**
     * Eliminar un estudiante y su persona.
     */
    async delete(id) {
        const { data: est } = await supabase
            .from("estudiante")
            .select("persona_id")
            .eq("id", id)
            .single();

        const { error: estErr } = await supabase
            .from("estudiante")
            .delete()
            .eq("id", id);
        if (estErr) throw estErr;

        if (est?.persona_id) {
            const { error: perErr } = await supabase
                .from("persona")
                .delete()
                .eq("id", est.persona_id);
            if (perErr) throw perErr;
        }
    },

    /**
     * Contar total de estudiantes.
     */
    async count() {
        const { count, error } = await supabase
            .from("estudiante")
            .select("*", { count: "exact", head: true });
        if (error) throw error;
        return count;
    },
};

export default estudianteService;
