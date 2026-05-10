import { supabase } from "../lib/supabaseClient";

const notaService = {
    async getByInscripcionId(inscripcionId) {
        const { data, error } = await supabase
            .from("nota")
            .select("*, evaluacion:evaluacion_id (id, nombre, porcentaje)")
            .eq("inscripcion_id", inscripcionId)
            .order("evaluacion_id", { ascending: true });
        if (error) throw error;
        return data;
    },

    async getByGrupoId(grupoId) {
        const { data, error } = await supabase
            .from("nota")
            .select(`
                *,
                evaluacion:evaluacion_id (id, nombre, porcentaje),
                inscripcion:inscripcion_id (
                    id, estudiante_id, grupo_id,
                    estudiante:estudiante_id (
                        id, registro_universitario,
                        persona:persona_id (id, carnet, nombres, paterno, materno)
                    )
                )
            `)
            .eq("inscripcion.grupo_id", grupoId);
        if (error) throw error;
        return data.filter((n) => n.inscripcion !== null);
    },

    async upsert(notaData) {
        // Check if nota exists
        const { data: existing } = await supabase
            .from("nota")
            .select("id")
            .eq("inscripcion_id", notaData.inscripcion_id)
            .eq("evaluacion_id", notaData.evaluacion_id)
            .maybeSingle();

        if (existing) {
            const { data, error } = await supabase
                .from("nota")
                .update({ nota: notaData.nota })
                .eq("id", existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from("nota")
                .insert(notaData)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    async bulkUpsert(notasArray) {
        const results = [];
        for (const nota of notasArray) {
            const result = await this.upsert(nota);
            results.push(result);
        }
        return results;
    },
};

export default notaService;
