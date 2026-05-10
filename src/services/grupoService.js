import { supabase } from "../lib/supabaseClient";

const grupoService = {
    async getAll() {
        const { data, error } = await supabase
            .from("grupo")
            .select(`
                *,
                materia:materia_id (id, sigla, nombre),
                docente:docente_id (id, persona:persona_id (nombres, paterno)),
                periodo:periodo_id (id, codigo, descripcion),
                inscripcion (id)
            `)
            .order("id", { ascending: true });
        if (error) throw error;
        return data.map((g) => ({
            ...g,
            inscritosCount: g.inscripcion?.length || 0,
        }));
    },

    async getByDocenteId(docenteId) {
        const { data, error } = await supabase
            .from("grupo")
            .select(`
                *,
                materia:materia_id (id, sigla, nombre),
                periodo:periodo_id (id, codigo, descripcion, estado),
                inscripcion (id)
            `)
            .eq("docente_id", docenteId)
            .order("id", { ascending: true });
        if (error) throw error;
        return data.map((g) => ({
            ...g,
            inscritosCount: g.inscripcion?.length || 0,
        }));
    },

    async getByPeriodoId(periodoId) {
        const { data, error } = await supabase
            .from("grupo")
            .select(`
                *,
                materia:materia_id (id, sigla, nombre, creditos, carrera_id),
                docente:docente_id (id, persona:persona_id (nombres, paterno)),
                periodo:periodo_id (id, codigo, descripcion),
                inscripcion (id)
            `)
            .eq("periodo_id", periodoId)
            .order("id", { ascending: true });
        if (error) throw error;
        return data.map((g) => ({
            ...g,
            inscritosCount: g.inscripcion?.length || 0,
        }));
    },

    async getById(id) {
        const { data, error } = await supabase
            .from("grupo")
            .select(`
                *,
                materia:materia_id (id, sigla, nombre),
                docente:docente_id (id, persona:persona_id (nombres, paterno)),
                periodo:periodo_id (id, codigo, descripcion),
                inscripcion (id)
            `)
            .eq("id", id)
            .single();
        if (error) throw error;
        return { ...data, inscritosCount: data.inscripcion?.length || 0 };
    },

    async create(grupoData) {
        const { data, error } = await supabase
            .from("grupo").insert(grupoData).select().single();
        if (error) throw error;
        return data;
    },

    async update(id, grupoData) {
        const { data, error } = await supabase
            .from("grupo").update(grupoData).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase.from("grupo").delete().eq("id", id);
        if (error) throw error;
    },

    async count() {
        const { count, error } = await supabase
            .from("grupo").select("*", { count: "exact", head: true });
        if (error) throw error;
        return count;
    },
};

export default grupoService;
