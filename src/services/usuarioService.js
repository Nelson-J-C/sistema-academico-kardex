import { supabase } from "../lib/supabaseClient";

/**
 * Servicio para operaciones sobre la tabla `usuario`.
 * Incluye autenticación propia (sin Supabase Auth).
 */
const usuarioService = {
    /**
     * Login: buscar usuario por username, validar password.
     * Retorna el usuario con persona y rol, o lanza error.
     */
    async login(username, password) {
        const { data, error } = await supabase
            .from("usuario")
            .select(`
                *,
                persona:persona_id (*),
                rol:rol_id (*)
            `)
            .eq("username", username)
            .eq("estado", true)
            .single();

        if (error || !data) {
            throw new Error("Usuario o contraseña incorrectos");
        }

        // Comparación directa del password (en producción usar hashing)
        if (data.password_hash !== password) {
            throw new Error("Usuario o contraseña incorrectos");
        }

        // Actualizar ultimo_login
        await supabase
            .from("usuario")
            .update({ ultimo_login: new Date().toISOString() })
            .eq("id", data.id);

        return {
            id: data.id,
            persona_id: data.persona_id,
            username: data.username,
            rol: data.rol?.nombre || "estudiante",
            rol_id: data.rol_id,
            nombres: data.persona?.nombres || "",
            paterno: data.persona?.paterno || "",
            materno: data.persona?.materno || "",
            correo: data.persona?.correo || "",
            telefono: data.persona?.telefono || "",
            direccion: data.persona?.direccion || "",
            carnet: data.persona?.carnet || "",
            foto_perfil: data.persona?.foto_perfil || "",
            estado: data.estado,
        };
    },

    /**
     * Obtener usuario por persona_id con joins.
     */
    async getByPersonaId(personaId) {
        const { data, error } = await supabase
            .from("usuario")
            .select(`
                *,
                persona:persona_id (*),
                rol:rol_id (*)
            `)
            .eq("persona_id", personaId)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Obtener todos los usuarios con sus personas y roles.
     */
    async getAll() {
        const { data, error } = await supabase
            .from("usuario")
            .select(`
                *,
                persona:persona_id (*),
                rol:rol_id (*)
            `)
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    /**
     * Crear un nuevo usuario.
     */
    async create(usuarioData) {
        const { data, error } = await supabase
            .from("usuario")
            .insert(usuarioData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Actualizar un usuario.
     */
    async update(id, usuarioData) {
        const { data, error } = await supabase
            .from("usuario")
            .update(usuarioData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
};

export default usuarioService;
