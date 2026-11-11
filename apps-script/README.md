# Apps Script del club

`Code.gs` es el backend de la web: vive dentro de la hoja **«CMS Club»** (Extensiones → Apps Script).
La que funciona es la copia desplegada en Google; esta es su referencia en el repositorio.

## Actualizar el script (cada vez que cambie `Code.gs`)

1. Abre «CMS Club» → **Extensiones → Apps Script**.
2. Borra todo el contenido de `Código.gs` y pega el de `apps-script/Code.gs`. Guarda (icono del disquete).
3. **Implementar → Gestionar implementaciones** → lápiz de la implementación activa → **Versión: Nueva versión** → **Implementar**.
   Así la URL `…/exec` no cambia y la web sigue apuntando al mismo sitio.
4. Si Google pide permisos (hoja, conexiones externas), acéptalos con la cuenta dueña de la hoja.

## Propiedades del script

Configuración del proyecto (rueda dentada) → **Propiedades del script**. Nunca en el código ni en el repositorio.

| Propiedad              | Para qué                                                                                                                                                                                                            | ¿Obligatoria?                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `GOOGLE_CLIENT_ID`     | ID de cliente OAuth (el mismo que usa la web) para comprobar quién entra al panel                                                                                                                                   | Sí                           |
| `CODIGO_CLUB`          | Código del club: es lo único que comprueba el formulario de propuestas (al abrirlo y al enviar). Sin ella, el formulario queda abierto                                                                              | Recomendada                  |
| `GOOGLE_BOOKS_API_KEY` | Clave de Google Books para el buscador del panel. Sin ella Google casi nunca deja buscar. En Google Cloud, restríngela solo a «Books API» y **sin** restricción de sitios web (la llama el script, no el navegador) | Sí, en la práctica           |
| `GH_DISPATCH_TOKEN`    | Token fino de GitHub solo para este repo con **Actions: Read and write**, para «Publicar ahora»                                                                                                                     | Para publicar desde el panel |
| `GH_REPO`              | `vmarhuendaTN/clubdelultimomiercoles` (valor por defecto)                                                                                                                                                           | No                           |

## Pestañas

El script crea solo las pestañas o columnas que falten (`Lecturas`, `Tintero`, `Propuestas`, `Votacion`, `Votos`, `Inscritas`, `Equipo`).

`Inscritas` guarda datos privados (teléfono, email): solo salen del script con sesión del equipo (`inscritas.listar`, `inscritas.guardar`). Al listarla, el script recalcula `participaciones_auto` (sesiones distintas con propuesta, casando nombre y apellidos sin tildes ni mayúsculas) y `participaciones` = `participaciones_auto` + `ajuste`; `ajuste` lo corrige a mano una administradora.

Para errores, el equipo puede borrar filas desde el panel: `propuestas.eliminar` (una propuesta por `id`) y `votos.eliminar` (todas las filas de los `voto_id` indicados).

`Valoraciones` (equipo: `valoraciones.listar`, `valoraciones.guardar`): una fila por inscrita y lectura con su nota (0 a 10). Al guardar, el script pone al día las medias en `Inscritas` (`valoraciones`, `media_valoraciones`) y en `Lecturas` (`valoraciones_club`, `media_club`, que no se publican).

**Dos clubs** (v12): `club` («1» o «2») en `Inscritas` y `Valoraciones` (se copia de la inscrita al guardar la nota), `fecha_sesion_2` en `Lecturas` (quedada del Club 2; sale en la web pública) y `media_club_1`/`media_club_2` en `Lecturas` (privadas).

`libros.ficha` trae un libro por su id de Google Books (la web lo usa al pegar una URL de Google Libros). Todas las llamadas a Google Books llevan `country=ES`: sin país, Google responde 403 «Cannot determine user location» desde los servidores de Apps Script.
No borres ni cambies la columna `id`: el panel la usa para saber qué fila es cada libro o propuesta.

## Comprobar que responde

Abre `…/exec?accion=estado` en el navegador: debe decir `"version":12`. `…/exec?accion=publico` devuelve las lecturas que se publicarán.

Al entrar al panel, la web compara esa versión con la que espera (`src/lib/apps-script/version.ts`) y, si la hoja va por detrás, lo avisa arriba. A las administradoras además les dice qué propiedades faltan y si Google Libros responde (acción `diagnostico`, que nunca devuelve valores de las propiedades).

## Si Google Libros da error

El panel muestra el motivo exacto. Los más habituales:

- **La clave no es válida** (error 400 «API key not valid»): se copió mal. En Google Cloud › APIs y servicios › Credenciales, copia la clave (empieza por `AIza`) y pégala de nuevo en `GOOGLE_BOOKS_API_KEY`, sin espacios ni comillas.
- **La Books API no está activada**: APIs y servicios › Biblioteca › «Books API» › Habilitar.
- **Restricciones**: en la clave, «Restricciones de aplicaciones» = Ninguna y «Restricciones de API» = solo Books API.
