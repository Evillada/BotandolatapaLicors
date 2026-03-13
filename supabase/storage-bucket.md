# Bucket de imágenes (Supabase Storage)

Para que la subida de imágenes funcione en el panel de productos:

1. Entra a tu proyecto: https://supabase.com/dashboard/project/kftjglskwdaaqxvduglw
2. Ve a **Storage** en el menú lateral.
3. Click en **New bucket**.
4. Nombre del bucket: **products**
5. Marca **Public bucket** (para que las imágenes se puedan ver en la tienda).
6. Click **Create bucket**.

Opcional: en **Policies** del bucket, puedes añadir una política que permita a usuarios autenticados (o al service role) subir archivos. Por defecto el backend usa la service role key y podrá subir sin políticas adicionales si el bucket existe.
