/** Rutas de la web (en español, con barra final por la exportación estática). */
export const routes = {
  inicio: '/',
  lecturas: '/lecturas/',
  elClub: '/el-club/',
  documentos: '/documentos/',
  galeria: '/galeria/',
  entrar: '/entrar/',
  miembros: '/miembros/',
  perfil: '/miembros/perfil/',
  admin: '/admin/',
  estilo: '/estilo/',
  privacidad: '/privacidad/',
  /** Enlaces para compartir por WhatsApp (con el código del club). */
  votar: '/votar/',
  proponer: '/proponer/',
} as const;

export type Route = (typeof routes)[keyof typeof routes];
