import { supabase } from "../lib/supabaseClient";

const kardexService = {
    async getByEstudianteId(estudianteId) {
        const { data, error } = await supabase
            .from("kardex")
            .select("*")
            .eq("estudiante_id", estudianteId);
        if (error) throw error;
        return data;
    },
};

export default kardexService;
