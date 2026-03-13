# Despliegue en Vercel - Botando la Tapa Licors

## Variables de entorno (Vercel)

En el proyecto de Vercel ve a **Settings → Environment Variables** y agrega:

| Variable | Valor | Entorno |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kftjglskwdaaqxvduglw.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key de Supabase | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu Service Role Key de Supabase | Production, Preview |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `573176614939` | Production, Preview |

**Importante:** Nunca subas `SUPABASE_SERVICE_ROLE_KEY` al repositorio. Solo en Vercel (y en `.env.local` en local, que está en `.gitignore`).

---

## Pasos para desplegar

1. **Conectar el repositorio**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión.
   - Importa el repo de GitHub: `Evillada/BotandolatapaLicors`.
   - Si ya está conectado, cada push a `main` puede desplegar automáticamente.

2. **Configurar variables**
   - En el proyecto de Vercel: **Settings → Environment Variables**.
   - Añade las 4 variables de la tabla anterior para **Production** (y opcionalmente Preview).

3. **Deploy**
   - **Deployments → Redeploy** (o haz push a `main` si tienes deploy automático).
   - Espera a que el build termine.

4. **Dominio**
   - Vercel asigna una URL tipo `tu-proyecto.vercel.app`.
   - En **Settings → Domains** puedes añadir un dominio propio.

---

## Seguridad aplicada

- **API protegida por rol admin:** Solo usuarios en la tabla `admin_users` pueden:
  - Crear/editar/eliminar productos.
  - Ver todos los pedidos y cambiar su estado.
  - Usar `?all=true` en productos.
  - Subir imágenes (`/api/upload`).
- **Claves:** `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor (API routes y middleware). No se expone al cliente.
- **Validación:** Los bodies de las peticiones se validan y sanitizan en productos y pedidos.
- **RLS en Supabase:** Las políticas de la base de datos siguen activas; la API usa service role solo donde hace falta.

---

## Después del deploy

1. **Probar la tienda:** Abre la URL de Vercel, verifica catálogo, carrito y envío por WhatsApp.
2. **Probar el admin:** Entra a `https://tu-dominio.vercel.app/admin/login` con el usuario admin.
3. **Supabase (opcional):** En Supabase → Authentication → URL Configuration, añade la URL de producción en "Redirect URLs" si usas flujos con redirect.

---

## Build local

```bash
cd premium-liquor-landing-page
pnpm install
pnpm build
pnpm start
```

El build ya se ejecutó correctamente; el proyecto está listo para producción.
