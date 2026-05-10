import { supabase } from "../lib/supabaseClient";

const inscripcionService = {
    async getByEstudianteId(estudianteId) {
        const { data, error } = await supabase
            .from("inscripcion")
            .select(`
                *,
                grupo:grupo_id (
                    id, paralelo, cupo,
                    materia:materia_id (id, sigla, nombre, creditos),
                    docente:docente_id (id, persona:persona_id (nombres, paterno)),
                    periodo:periodo_id (id, codigo, descripcion, estado)
                )
            `)
            .eq("estudiante_id", estudianteId)
            .order("fecha_inscripcion", { ascending: false });
        if (error) throw error;
        return data;
    },

    async getByGrupoId(grupoId) {
        const { data, error } = await supabase
            .from("inscripcion")
            .select(`
                *,
                estudiante:estudiante_id (
                    id, registro_universitario,
                    persona:persona_id (id, carnet, nombres, paterno, materno, correo)
                )
            `)
            .eq("grupo_id", grupoId)
            .eq("estado", "activo")
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    async create(inscripcionData) {
        const { data, error } = await supabase
            .from("inscripcion")
            .insert(inscripcionData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase.from("inscripcion").delete().eq("id", id);
        if (error) throw error;
    },

    async updateEstado(id, estado) {
        const { data, error } = await supabase
            .from("inscripcion")
            .update({ estado })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
};

export default inscripcionService;
