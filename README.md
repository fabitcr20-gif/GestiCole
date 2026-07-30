# GestiCole

Software de gestión docente de uso personal: notas por porcentajes, planeamientos
didácticos, generación de pruebas e integración con Google Workspace (Drive, Gmail,
Classroom). Diseñado con un enfoque de **accesibilidad "sin fricción"** para docentes
con poco dominio tecnológico: botones grandes, texto claro, alto contraste y una
tarea a la vez por pantalla.

## Arquitectura

| Capa | Tecnología |
| --- | --- |
| Frontend / Backend | Next.js 16 (App Router, TypeScript, Server Actions) |
| Estilos | Tailwind CSS v4 + `lucide-react` |
| Base de datos | PostgreSQL (compatible con Google Cloud SQL) vía Prisma ORM |
| Autenticación | Auth.js / NextAuth v5 con Google OAuth 2.0 |
| Importación/Exportación | `papaparse` (CSV), `xlsx` (Excel/JSON), `jspdf` + `jspdf-autotable` (PDF) |
| Integración Google | `googleapis` (Drive, Gmail, Classroom) |

### Estructura de carpetas

```
prisma/schema.prisma        Modelos: Teacher, Section, Student, GradeComponent, Grade,
                             LessonPlan, Exam
prisma/seed.ts               Datos de ejemplo para desarrollo
src/app/                     Rutas (App Router): dashboard, secciones, planeamientos,
                              pruebas, ajustes, endpoints /api/*
src/components/               Componentes de UI (incluye src/components/ui para el
                              sistema de diseño accesible)
src/lib/                      Lógica de negocio: cálculo de notas, acciones de
                              servidor, importación de archivos, integración con Google
```

## Modo demostración vs. modo con Google

La app funciona de dos formas:

- **Sin credenciales de Google configuradas** (por defecto): se activa un *modo
  demostración* con un único docente local. Todas las pantallas (notas, secciones,
  planeamientos, pruebas, importar/exportar) funcionan sin necesidad de iniciar sesión,
  para poder probar la aplicación de inmediato.
- **Con credenciales de Google configuradas**: se exige inicio de sesión con Google y
  se activan las integraciones con Drive (respaldo de archivos), Gmail (envío de
  reportes) y Classroom (importar listas de estudiantes).

## Requisitos

- Node.js 20+
- PostgreSQL 14+ (local, o una instancia de Google Cloud SQL para producción)

## Instalación local

```bash
npm install

# Configure las variables de entorno
cp .env.example .env
# Edite .env con los datos de su base de datos y (opcionalmente) sus credenciales de Google

# Cree las tablas en la base de datos
npx prisma migrate dev

# (Opcional) Cargue datos de ejemplo
npm run db:seed

# Inicie el servidor de desarrollo
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Vea `.env.example` para la lista completa. Las más importantes:

```bash
DATABASE_URL="postgresql://usuario:contrasena@localhost:5432/gesticole?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genere-un-valor-aleatorio-largo"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Genere `NEXTAUTH_SECRET` con:

```bash
openssl rand -base64 32
```

## Configurar Google Cloud (OAuth, Drive, Gmail, Classroom)

1. Cree un proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Habilite las siguientes APIs (menú **APIs y servicios → Biblioteca**):
   - Google Drive API
   - Gmail API
   - Google Classroom API
3. Configure la **pantalla de consentimiento OAuth** (tipo "Externo" si es una cuenta
   personal de Gmail) y agregue su propio correo como usuario de prueba mientras la
   app no esté verificada por Google.
4. Cree credenciales: **APIs y servicios → Credenciales → Crear credenciales → ID de
   cliente de OAuth**, tipo "Aplicación web".
   - Orígenes autorizados de JavaScript: `http://localhost:3000` (y el dominio de
     producción cuando lo tenga).
   - URI de redirección autorizado: `http://localhost:3000/api/auth/callback/google`
     (y el equivalente en producción).
5. Copie el **ID de cliente** y el **secreto** a `GOOGLE_CLIENT_ID` y
   `GOOGLE_CLIENT_SECRET` en su `.env`.
6. Reinicie el servidor. Al iniciar sesión, Google mostrará los permisos solicitados:
   crear/leer archivos que la app respalda en Drive, enviar correos con Gmail y leer
   sus cursos/listas de Classroom.

## Base de datos: PostgreSQL local o Google Cloud SQL

### Desarrollo local

Cualquier PostgreSQL sirve. Ejemplo rápido con el servicio del sistema:

```bash
sudo service postgresql start
sudo -u postgres psql -c "CREATE DATABASE gesticole;"
```

### Producción con Google Cloud SQL

1. Cree una instancia de **Cloud SQL para PostgreSQL** en Google Cloud Console.
2. Cree una base de datos (por ejemplo `gesticole`) y un usuario.
3. Use el [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/connect-auth-proxy)
   para conectarse de forma segura, o habilite una IP autorizada.
4. Configure `DATABASE_URL` apuntando a la instancia, por ejemplo:

   ```bash
   DATABASE_URL="postgresql://usuario:contrasena@127.0.0.1:5432/gesticole?schema=public"
   ```

5. Ejecute las migraciones contra la base de datos de producción:

   ```bash
   npx prisma migrate deploy
   ```

## Desplegar en Vercel

GestiCole (Next.js) se despliega en Vercel sin configuración especial, pero hay un
punto importante de arquitectura: las funciones de Vercel son **serverless** (cada
solicitud puede correr en una instancia nueva y de corta duración), así que no pueden
mantener corriendo un proceso como el **Cloud SQL Auth Proxy**. Elija una de estas dos
opciones para la base de datos en producción:

- **Opción recomendada — Postgres serverless** (Vercel Postgres/Neon, Supabase, etc.):
  funciona de inmediato con conexiones cortas y pooling integrado. Cree la base desde
  la pestaña **Storage** de su proyecto en Vercel (o cree una cuenta en Neon/Supabase),
  copie el `DATABASE_URL` con pooling que le den, y péguelo como variable de entorno en
  Vercel.
- **Google Cloud SQL directo**: habilite una **IP pública** en la instancia, fuerce SSL,
  y autorice el rango `0.0.0.0/0` en "Redes autorizadas" (las funciones de Vercel no
  tienen una IP fija salvo que pague el add-on de IP fija). Use
  `DATABASE_URL="postgresql://usuario:contrasena@IP_PUBLICA:5432/gesticole?sslmode=require&connection_limit=5"`.
  El límite bajo de conexiones (`connection_limit`) evita agotar las conexiones de
  Cloud SQL cuando hay varias funciones ejecutándose a la vez.

### Pasos

1. En [vercel.com](https://vercel.com), **Add New → Project** e importe el repositorio
   de GitHub `fabitcr20-gif/GestiCole` (rama a desplegar: `main` después de fusionar el
   Pull Request, o la rama de la feature para una vista previa).
2. Vercel detecta Next.js automáticamente; no hace falta cambiar el comando de build.
3. Agregue las variables de entorno del proyecto (**Settings → Environment
   Variables**), las mismas de `.env.example`:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` → la URL pública que le dé Vercel (o su dominio propio)
   - `NEXTAUTH_SECRET` → genere uno con `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (opcional; recuerde agregar la URL de
     Vercel a los orígenes/redirecciones autorizados en Google Cloud Console)
4. Antes del primer despliegue (o tras cada cambio de esquema), ejecute las migraciones
   contra la base de datos de producción desde su máquina:
   ```bash
   DATABASE_URL="<su-database-url-de-produccion>" npx prisma migrate deploy
   ```
5. Despliegue. El script `postinstall` del proyecto ejecuta `prisma generate`
   automáticamente en cada build de Vercel.

## Funcionalidades principales

- **Secciones y estudiantes**: cree grupos, agregue estudiantes manualmente o
  impórtelos desde CSV/Excel/JSON (detecta automáticamente columnas de nombre,
  código y correo; compatible con exportaciones del SEA del MEP).
- **Porcentajes de nota**: defina rubros (Cotidiano, Tareas, Pruebas, Proyecto,
  Asistencia, etc.) con su peso por periodo; la app avisa si no suman 100%.
- **Ingresar notas**: planilla tipo hoja de cálculo con navegación por teclado
  (flechas/Enter), cálculo automático del promedio ponderado e indicadores de color
  (aprobado/reprobado).
- **Exportar**: PDF listo para imprimir, Excel (.xlsx) y CSV.
- **Planeamientos didácticos**: objetivos, estrategias de mediación, criterios de
  evaluación; vista de impresión y respaldo en Drive.
- **Pruebas**: generador de exámenes con preguntas de desarrollo, selección única y
  respuesta corta; vista de impresión y respaldo en Drive.
- **Google Workspace**: respaldo de planeamientos/pruebas en una carpeta de Drive,
  envío de reportes de notas por Gmail, e importación de listas de estudiantes desde
  Google Classroom.

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # compilación de producción
npm run start     # servidor de producción
npm run lint      # lint
npm run db:seed   # cargar datos de ejemplo
```

## Notas de accesibilidad

El sistema de diseño (`src/components/ui`) usa tipografía grande (18px base),
alto contraste, botones con texto e íconos, un único tema claro (sin modo oscuro
automático, para máxima predictibilidad visual) y una navegación simple sin menús
desplegables. Cada pantalla está enfocada en una sola tarea.
