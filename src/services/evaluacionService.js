import { supabase } from "../lib/supabaseClient";

const evaluacionService = {
    async getAll() {
        const { data, error } = await supabase
            .from("evaluacion")
            .select("*")
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from("evaluacion")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(evalData) {
        const { data, error } = await supabase
            .from("evaluacion")
            .insert(evalData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id, evalData) {
        const { data, error } = await supabase
            .from("evaluacion")
            .update(evalData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase.from("evaluacion").delete().eq("id", id);
        if (error) throw error;
    },
};

export default evaluacionService;
