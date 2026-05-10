-- ═══════════════════════════════════════════════════════
-- RESETEAR SECUENCIAS DE POSTGRESQL
-- Ejecutar en Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════
-- Esto sincroniza el auto-incremento (SERIAL) con el
-- máximo ID existente en cada tabla, evitando errores
-- de "duplicate key" al insertar nuevos registros.
-- ═══════════════════════════════════════════════════════

SELECT setval('persona_id_seq', COALESCE((SELECT MAX(id) FROM persona), 0) + 1, false);
SELECT setval('rol_id_seq', COALESCE((SELECT MAX(id) FROM rol), 0) + 1, false);
SELECT setval('usuario_id_seq', COALESCE((SELECT MAX(id) FROM usuario), 0) + 1, false);
SELECT setval('carrera_id_seq', COALESCE((SELECT MAX(id) FROM carrera), 0) + 1, false);
SELECT setval('materia_id_seq', COALESCE((SELECT MAX(id) FROM materia), 0) + 1, false);
SELECT setval('periodo_id_seq', COALESCE((SELECT MAX(id) FROM periodo), 0) + 1, false);
SELECT setval('estudiante_id_seq', COALESCE((SELECT MAX(id) FROM estudiante), 0) + 1, false);
SELECT setval('docente_id_seq', COALESCE((SELECT MAX(id) FROM docente), 0) + 1, false);
SELECT setval('grupo_id_seq', COALESCE((SELECT MAX(id) FROM grupo), 0) + 1, false);
SELECT setval('inscripcion_id_seq', COALESCE((SELECT MAX(id) FROM inscripcion), 0) + 1, false);
SELECT setval('evaluacion_id_seq', COALESCE((SELECT MAX(id) FROM evaluacion), 0) + 1, false);
SELECT setval('nota_id_seq', COALESCE((SELECT MAX(id) FROM nota), 0) + 1, false);
