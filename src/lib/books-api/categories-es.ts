/** Traducción de las categorías BISAC más habituales (GOOGLE-BOOKS § 5). */
const CATEGORIAS: Record<string, string> = {
  fiction: 'Ficción',
  'literary fiction': 'Ficción literaria',
  'juvenile fiction': 'Ficción juvenil',
  'young adult fiction': 'Ficción juvenil',
  'biography & autobiography': 'Biografía',
  history: 'Historia',
  poetry: 'Poesía',
  drama: 'Teatro',
  'literary criticism': 'Crítica literaria',
  philosophy: 'Filosofía',
  'social science': 'Ciencias sociales',
  science: 'Ciencia',
  'political science': 'Ciencia política',
  psychology: 'Psicología',
  travel: 'Viajes',
  'true crime': 'Crónica negra',
  humor: 'Humor',
  'family & relationships': 'Familia y relaciones',
  'body, mind & spirit': 'Cuerpo y mente',
  'comics & graphic novels': 'Cómic y novela gráfica',
  'foreign language study': 'Idiomas',
  'language arts & disciplines': 'Lengua',
  'self-help': 'Autoayuda',
  'business & economics': 'Economía y empresa',
  religion: 'Religión',
  'performing arts': 'Artes escénicas',
  art: 'Arte',
  music: 'Música',
  nature: 'Naturaleza',
  cooking: 'Cocina',
  'health & fitness': 'Salud',
  education: 'Educación',
  ficción: 'Ficción',
};

export function translateCategory(category: string): string {
  const principal = category.split('/')[0]!.trim();
  return CATEGORIAS[principal.toLowerCase()] ?? principal;
}

export function translateCategories(categories: readonly string[] = []): string[] {
  return [...new Set(categories.map(translateCategory))];
}
