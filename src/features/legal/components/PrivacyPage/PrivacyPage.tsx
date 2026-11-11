import { PageHeader } from '@/components/layout';
import { site } from '@/config/site';
import styles from './PrivacyPage.module.css';

const ACTUALIZADA = 'noviembre de 2026';
const AEPD = 'https://www.aepd.es';

/**
 * Política de privacidad (RGPD, LOPDGDD y art. 22.2 LSSI), limitada a lo que la web hace hoy.
 * Si cambia lo que se trata (p. ej. vuelven las valoraciones o llega el área de miembros),
 * actualizar este texto y la fecha.
 */
export function PrivacyPage() {
  const { responsable } = site;
  const email = <a href={`mailto:${responsable.email}`}>{responsable.email}</a>;
  return (
    <div className="contenedor">
      <PageHeader titulo="Privacidad" subtitulo={`Última actualización: ${ACTUALIZADA}.`} />
      <div className={styles.texto}>
        <p className={styles.resumen}>
          En resumen: puedes leer la web sin darnos ningún dato y no usamos cookies propias. Los
          datos del club (propuestas, votos y registro de personas) los ve solo el equipo del club,
          nunca se publican y no se ceden a nadie.
        </p>

        <section aria-labelledby="responsable">
          <h2 id="responsable">1. Responsable</h2>
          <p>
            {responsable.nombre}. Contacto: {email}.
          </p>
        </section>

        <section aria-labelledby="datos">
          <h2 id="datos">2. Qué datos tratamos y para qué</h2>
          <ul role="list" className={styles.lista}>
            <li>
              <strong>Propuestas y votación</strong> (solo para el club, con código): nombre,
              apellidos, grupo, tus propuestas o puntuaciones y lo que escribas. Sirven para elegir
              las próximas lecturas. Base legal: tu consentimiento al enviarlas (art. 6.1.a RGPD).
            </li>
            <li>
              <strong>Registro de personas del club</strong>: nombre, apellidos, teléfono, email,
              fecha de alta y número de participaciones (sesiones en las que has propuesto). Sirve
              para organizar el club y avisarte de las sesiones. Base legal: tu pertenencia al club
              (art. 6.1.b RGPD).
            </li>
            <li>
              <strong>Si nos escribes</strong> (también con «Quiero ser del club», que prepara un
              email desde tu correo): lo que nos cuentes, solo para responderte y valorar tu
              solicitud. Base legal: tu consentimiento (art. 6.1.a RGPD).
            </li>
            <li>
              <strong>Panel del equipo</strong>: al entrar con Google, tu email y tu nombre, solo
              para comprobar que formas parte del equipo. Base legal: interés legítimo (art. 6.1.f
              RGPD).
            </li>
          </ul>
        </section>

        <section aria-labelledby="conservacion">
          <h2 id="conservacion">3. Cuánto tiempo los guardamos</h2>
          <p>
            Mientras seas del club y, después, como máximo un año. Los datos de quien no llega a ser
            del club y los correos, como máximo un año.
          </p>
        </section>

        <section aria-labelledby="destinatarios">
          <h2 id="destinatarios">4. Proveedores</h2>
          <p>
            No cedemos datos a nadie salvo obligación legal. Los datos del club se guardan en Google
            Drive (Google). La web la aloja GitHub Pages (GitHub), que registra datos técnicos de
            conexión por seguridad. Las portadas se cargan desde Google Libros y la galería muestra
            el Instagram del club, que sirve Meta. Las transferencias a Estados Unidos se amparan en
            el Marco de Privacidad de Datos UE-EE. UU. y en cláusulas contractuales tipo (art. 45 y
            46 RGPD).
          </p>
        </section>

        <section aria-labelledby="cookies">
          <h2 id="cookies">5. Cookies y almacenamiento en tu navegador</h2>
          <p>
            No usamos cookies propias ni analítica. Tu navegador guarda el código del club, para no
            pedírtelo cada vez, y, si eres del equipo, la sesión del panel (se borra al pulsar
            «Salir»). Es lo estrictamente necesario para lo que pides, así que no requiere
            consentimiento (art. 22.2 LSSI). La página Galería carga contenido de Instagram, y Meta
            puede usar sus propias cookies según su{' '}
            <a href="https://privacycenter.instagram.com/policy" rel="noopener noreferrer">
              política de privacidad
            </a>
            ; si no quieres, no abras la galería o bloquea las cookies de terceros.
          </p>
        </section>

        <section aria-labelledby="derechos">
          <h2 id="derechos">6. Tus derechos</h2>
          <p>
            Puedes pedir acceso, rectificación, supresión, oposición, limitación o portabilidad de
            tus datos, o retirar tu consentimiento, escribiendo a {email}. Te responderemos en un
            mes como máximo. Si no quedas conforme, puedes reclamar ante la Agencia Española de
            Protección de Datos (
            <a href={AEPD} rel="noopener noreferrer">
              www.aepd.es
            </a>
            ).
          </p>
        </section>
      </div>
    </div>
  );
}
