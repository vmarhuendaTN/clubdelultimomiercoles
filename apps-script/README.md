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

El script crea solo las pestañas o columnas que falten (`Lecturas`, `Propuestas`, `Equipo`).
No borres ni cambies la columna `id`: el panel la usa para saber qué fila es cada libro o propuesta.

## Comprobar que responde

Abre `…/exec?accion=estado` en el navegador: debe decir `"version":7`. `…/exec?accion=publico` devuelve las lecturas que se publicarán.
