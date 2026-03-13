-- =============================================
-- CREATE ADMIN USER
-- =============================================
-- IMPORTANTE: Primero debes crear el usuario en Authentication > Users
-- con el email y contraseña que quieras usar.
-- Luego, copia el UUID del usuario y ejecuta este SQL:

-- Reemplaza 'TU_USER_ID' con el UUID del usuario que creaste
-- Reemplaza 'tu@email.com' con el email del usuario

-- INSERT INTO admin_users (id, email, role)
-- VALUES ('TU_USER_ID', 'tu@email.com', 'admin');

-- =============================================
-- EJEMPLO:
-- Si creaste un usuario con email admin@botandolatapa.com
-- y su UUID es 123e4567-e89b-12d3-a456-426614174000
-- =============================================
-- INSERT INTO admin_users (id, email, role)
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin@botandolatapa.com', 'admin');
