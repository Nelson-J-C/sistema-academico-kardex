import { supabase } from "../lib/supabaseClient";

const docenteService = {
    async getAll() {
        const { data, error } = await supabase
            .from("docente")
            .select("*, persona:persona_id (*)")
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from("docente")
            .select("*, persona:persona_id (*)")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    async getByPersonaId(personaId) {
        const { data, error } = await supabase
            .from("docente")
            .select("*, persona:persona_id (*)")
            .eq("persona_id", personaId)
            .single();
        if (error) throw error;
        return data;
    },

    async create({ personaData, docenteData }) {
        const { data: persona, error: pErr } = await supabase
            .from("persona").insert(personaData).select().single();
        if (pErr) throw pErr;
        const { data: docente, error: dErr } = await supabase
            .from("docente")
            .insert({ persona_id: persona.id, ...docenteData })
            .select("*, persona:persona_id (*)")
            .single();
        if (dErr) throw dErr;
        return docente;
    },

    async update(id, { personaData, docenteData }) {
        const { data: doc } = await supabase
            .from("docente").select("persona_id").eq("id", id).single();
        if (personaData) {
            await supabase.from("persona").update(personaData).eq("id", doc.persona_id);
        }
        if (docenteData) {
            await supabase.from("docente").update(docenteData).eq("id", id);
        }
        return await this.getById(id);
    },

    async delete(id) {
        const { data: doc } = await supabase
            .from("docente").select("persona_id").eq("id", id).single();
        await supabase.from("docente").delete().eq("id", id);
        if (doc?.persona_id) {
            await supabase.from("persona").delete().eq("id", doc.persona_id);
        }
    },

    async count() {
        const { count, error } = await supabase
            .from("docente").select("*", { count: "exact", head: true });
        if (error) throw error;
        return count;
    },
};

export default docenteService;
