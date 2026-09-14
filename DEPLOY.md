# Despliegue en Vercel - Botando la Tapa Licors

## Variables de entorno (igual en desarrollo y producción)

**Las mismas variables y los mismos valores** se usan en desarrollo (`.env.local`) y en producción (Vercel). Mismo proyecto de Supabase en ambos.

| Variable | Valor | Dónde |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kftjglskwdaaqxvduglw.supabase.co` | `.env.local` y Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key de Supabase (Dashboard → Settings → API) | `.env.local` y Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key de Supabase | `.env.local` y Vercel |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `573176614939` | `.env.local` y Vercel |

### Desarrollo local

1. En la carpeta **`premium-liquor-landing-page`** crea o edita **`.env.local`** con las 4 variables de la tabla.
2. Ejecuta desde esa misma carpeta: `pnpm dev`.
3. Si el login muestra "Configuración requerida", revisa que los nombres de las variables sean exactos (sin espacios) y que el archivo esté en `premium-liquor-landing-page/.env.local`.

### Producción (Vercel)

En el proyecto de Vercel: **Settings → Environment Variables** → agrega las mismas 4 variables para **Production** (y opcionalmente Preview).

**Importante:** Nunca subas `SUPABASE_SERVICE_ROLE_KEY` al repositorio. Solo en `.env.local` (local) y en Vercel (producción).

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

### Si el login funciona pero te devuelve al login o a la web (sin abrir el panel)

Tu usuario **debe estar en la tabla `admin_users`** en Supabase. Si no está, el middleware te redirige y no entras al panel.

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto.
2. **Authentication** → **Users** → localiza el usuario con el que inicias sesión (ej. sierrita1324@gmail.com) y **copia el User UID** (UUID).
3. **SQL Editor** → Nueva query → pega y **reemplaza** `TU_USER_UID` y `tu@email.com` por el UID y el email:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('TU_USER_UID', 'tu@email.com', 'admin')
ON CONFLICT (id) DO NOTHING;
```

4. Ejecuta (Run). Vuelve a entrar a `/admin/login` e inicia sesión; deberías entrar al panel.

### Si en los logs de Vercel aparece error 42P17 o "no encontrada" en `/api/products`

Ese error significa que en Supabase **falta la tabla `products` o alguna de sus columnas**.

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor**.
2. Si **no** has creado antes la base con el schema del proyecto: ejecuta el contenido de **`supabase/schema.sql`** (crea todas las tablas).
3. Si ya tenías la tabla pero falla la API: ejecuta **`supabase/fix-products-table.sql`** para añadir las columnas que falten.

- **Claves:** `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor (API routes y middleware). No se expone al cliente.
- **Validación:** Los bodies de las peticiones se validan y sanitizan en productos y pedidos.
- **RLS en Supabase:** Las políticas de la base de datos siguen activas; la API usa service role solo donde hace falta.

---

## Si el login o la base de datos no funcionan en Vercel

### 1. Variables de entorno y redeploy

- En Vercel → tu proyecto → **Settings → Environment Variables**.
- Debe haber **estas 4** con el **mismo nombre exacto**, y deben estar asignadas al entorno **Production** (marca el checkbox Production):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Si acabas de añadirlas o las cambiaste: **Deployments → los tres puntos del último deploy → Redeploy**. Sin redeploy, la producción sigue usando los valores anteriores (o vacíos).

### 2. Configurar la URL de producción en Supabase (obligatorio para el login)

Supabase solo acepta login desde URLs que tú autorizas. Si no configuras la URL de producción, el login en Vercel puede fallar o no guardar la sesión.

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto.
2. **Authentication** (menú izquierdo) → **URL Configuration**.
3. **Site URL:** pon la URL principal de tu sitio, por ejemplo:
   - `https://botandolatapalicors.com`
   - o si solo usas Vercel: `https://tu-proyecto.vercel.app`
4. **Redirect URLs:** añade (una por línea) las URLs que uses:
   - `https://botandolatapalicors.com/**`
   - `https://*.vercel.app/**`
   (El `**` permite cualquier ruta bajo ese dominio.)
5. Guarda los cambios.

Con esto, la base de datos y el login deberían funcionar en producción. Si sigue fallando, abre la consola del navegador (F12 → Console) en `/admin/login`, intenta iniciar sesión y revisa si sale algún error de red o de Supabase y compártelo.

---

## Después del deploy

1. **Probar la tienda:** Abre la URL de Vercel, verifica catálogo, carrito y envío por WhatsApp.
2. **Probar el admin:** Entra a `https://tu-dominio.vercel.app/admin/login` (o tu dominio) con el usuario admin.

---

## Build local

```bash
cd premium-liquor-landing-page
pnpm install
pnpm build
pnpm start
```

El build ya se ejecutó correctamente; el proyecto está listo para producción.
