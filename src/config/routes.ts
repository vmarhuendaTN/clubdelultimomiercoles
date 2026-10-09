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
  avisoLegal: '/aviso-legal/',
  privacidad: '/privacidad/',
  cookies: '/cookies/',
  accesibilidad: '/accesibilidad/',
} as const;

export type Route = (typeof routes)[keyof typeof routes];
