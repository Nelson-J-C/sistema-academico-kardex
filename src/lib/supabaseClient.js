import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
        "Revisa tu archivo .env en la raíz del proyecto."
    );
}

/**
 * Cliente de Supabase configurado para toda la aplicación.
 * Importa este cliente en cualquier archivo donde necesites
 * interactuar con la base de datos o la autenticación de Supabase.
 *
 * Ejemplo de uso:
 *   import { supabase } from "../lib/supabaseClient";
 *   const { data, error } = await supabase.from("tabla").select("*");
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
