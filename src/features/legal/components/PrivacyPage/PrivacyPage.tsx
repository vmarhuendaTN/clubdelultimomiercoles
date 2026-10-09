import { PageHeader } from '@/components/layout';
import { site } from '@/config/site';
import styles from './PrivacyPage.module.css';

const ACTUALIZADA = 'octubre de 2026';
const AEPD = 'https://www.aepd.es';

/**
 * Política de privacidad conforme al RGPD (UE 2016/679), la LOPDGDD (LO 3/2018) y el
 * art. 22.2 de la LSSI. Describe lo que la web hace realmente: si cambia (p. ej. llega el
 * área de miembros o Instagram), actualizar este texto y la fecha.
 */
export function PrivacyPage() {
  const { responsable } = site;
  const email = <a href={`mailto:${responsable.email}`}>{responsable.email}</a>;
  return (
    <div className="contenedor">
      <PageHeader titulo="Privacidad" subtitulo={`Última actualización: ${ACTUALIZADA}.`} />
      <div className={styles.texto}>
        <p className={styles.resumen}>
          En resumen: puedes leer toda la web sin dar ningún dato y sin cookies. Solo tratamos datos
          personales si inicias sesión con Google para valorar una lectura o si nos escribes. Nunca
          publicamos tu email ni vendemos ni cedemos tus datos.
        </p>

        <section aria-labelledby="responsable">
          <h2 id="responsable">1. Quién es el responsable</h2>
          <ul role="list" className={styles.lista}>
            <li>
              <strong>Responsable:</strong> {responsable.nombre}.
            </li>
            <li>
              <strong>Contacto para cualquier cuestión de privacidad:</strong> {email}.
            </li>
          </ul>
        </section>

        <section aria-labelledby="datos">
          <h2 id="datos">2. Qué datos tratamos, para qué y con qué base legal</h2>

          <h3>Si solo navegas por la web</h3>
          <p>
            No te pedimos datos, no usamos cookies ni herramientas de analítica o publicidad. El
            servicio que aloja la web (GitHub Pages) registra, como cualquier servidor, la dirección
            IP y datos técnicos de la conexión para entregar las páginas y por seguridad. Las
            portadas de los libros se cargan desde Google Libros, por lo que tu navegador se conecta
            a los servidores de Google al verlas. Las tipografías se sirven desde la propia web.
          </p>
          <p>
            <strong>Base legal:</strong> interés legítimo en mostrar la web de forma segura (art.
            6.1.f RGPD).
          </p>

          <h3>Si valoras una lectura</h3>
          <p>
            Para poner estrellas y escribir una opinión inicias sesión con tu cuenta de Google.
            Google nos facilita tu nombre, tu email, un identificador de cuenta y, si la tienes, la
            dirección de tu foto de perfil. Guardamos además tus valoraciones (estrellas, opinión y
            fechas).
          </p>
          <ul role="list" className={styles.lista}>
            <li>
              <strong>Finalidad:</strong> identificarte para que solo tú puedas crear, editar o
              borrar tus valoraciones, y publicarlas en la ficha del libro.
            </li>
            <li>
              <strong>Qué se publica:</strong> tu nombre y la inicial de tu primer apellido (por
              ejemplo, «Ana G.»), las estrellas, tu opinión y la fecha. Tu email y tu foto nunca se
              publican.
            </li>
            <li>
              <strong>Base legal:</strong> tu consentimiento, que das al iniciar sesión y publicar
              (art. 6.1.a RGPD). Puedes retirarlo en cualquier momento borrando tus valoraciones o
              pidiéndonos que eliminemos tu cuenta.
            </li>
          </ul>

          <h3>Si nos escribes</h3>
          <p>
            Usamos tu email y lo que nos cuentes solo para responderte (por ejemplo, a una propuesta
            de lectura). <strong>Base legal:</strong> tu consentimiento y nuestro interés legítimo
            en atender tu mensaje (art. 6.1.a y 6.1.f RGPD).
          </p>
        </section>

        <section aria-labelledby="conservacion">
          <h2 id="conservacion">3. Cuánto tiempo los guardamos</h2>
          <ul role="list" className={styles.lista}>
            <li>
              <strong>Valoraciones y cuenta:</strong> mientras no las borres o nos pidas eliminar tu
              cuenta. Al eliminar la cuenta se borran también todas tus valoraciones.
            </li>
            <li>
              <strong>Correos:</strong> el tiempo necesario para atender tu mensaje y, como máximo,
              un año después.
            </li>
            <li>
              <strong>Registros técnicos del alojamiento:</strong> los plazos que fija el proveedor
              por motivos de seguridad.
            </li>
          </ul>
        </section>

        <section aria-labelledby="destinatarios">
          <h2 id="destinatarios">4. Con quién se comparten</h2>
          <p>
            No cedemos tus datos a nadie salvo obligación legal. Para que la web funcione usamos
            estos proveedores, que tratan los datos por cuenta nuestra o como servicios
            independientes:
          </p>
          <ul role="list" className={styles.lista}>
            <li>
              <strong>Supabase</strong> (base de datos y acceso de usuarios): los datos se guardan
              en servidores de la Unión Europea (París).
            </li>
            <li>
              <strong>GitHub</strong> (alojamiento de la web).
            </li>
            <li>
              <strong>Google</strong> (inicio de sesión con Google, portadas de Google Libros y
              correo del club). El uso de tu cuenta de Google se rige también por la{' '}
              <a href="https://policies.google.com/privacy?hl=es" rel="noopener noreferrer">
                política de privacidad de Google
              </a>
              .
            </li>
          </ul>
          <p>
            Algunos de estos proveedores son empresas de Estados Unidos. Las transferencias
            internacionales se amparan en el Marco de Privacidad de Datos UE-EE. UU. y en las
            cláusulas contractuales tipo aprobadas por la Comisión Europea (art. 45 y 46 RGPD).
          </p>
        </section>

        <section aria-labelledby="cookies">
          <h2 id="cookies">5. Cookies y almacenamiento en tu navegador</h2>
          <p>
            No usamos cookies. Si inicias sesión con Google, tu navegador guarda la sesión en su
            almacenamiento local para que no tengas que volver a entrar en cada página. Es
            estrictamente necesario para el servicio que pides, por lo que no requiere
            consentimiento (art. 22.2 de la LSSI), y se borra al pulsar «Salir». Para que la web
            cargue más rápido, también se guardan en tu navegador copias de sus archivos (no
            contienen datos personales).
          </p>
        </section>

        <section aria-labelledby="derechos">
          <h2 id="derechos">6. Tus derechos</h2>
          <p>
            Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión,
            oposición, limitación del tratamiento y portabilidad, y retirar tu consentimiento, sin
            que ello afecte a lo tratado antes. Escríbenos a {email} indicando qué derecho quieres
            ejercer; te responderemos en el plazo máximo de un mes. Para proteger tus datos podremos
            pedirte que acredites que eres la persona titular.
          </p>
          <p>
            Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia
            Española de Protección de Datos (
            <a href={AEPD} rel="noopener noreferrer">
              www.aepd.es
            </a>
            ).
          </p>
        </section>

        <section aria-labelledby="menores">
          <h2 id="menores">7. Menores</h2>
          <p>
            Para iniciar sesión y publicar valoraciones hay que tener al menos 14 años (art. 7
            LOPDGDD). Si eres menor de esa edad, necesitas el consentimiento de tu madre, padre o
            tutor.
          </p>
        </section>

        <section aria-labelledby="seguridad">
          <h2 id="seguridad">8. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas para proteger tus datos: conexiones cifradas (HTTPS), acceso
            a la base de datos limitado por reglas que solo permiten a cada persona modificar sus
            propias valoraciones, y ningún dato privado en el código público de la web.
          </p>
        </section>

        <section aria-labelledby="cambios">
          <h2 id="cambios">9. Cambios en esta política</h2>
          <p>
            Si cambiamos cómo tratamos los datos (por ejemplo, al abrir un área de miembros), lo
            actualizaremos aquí con su fecha.
          </p>
        </section>
      </div>
    </div>
  );
}
