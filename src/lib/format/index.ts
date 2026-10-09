const fechaLarga = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2025-11-26" → "26 de noviembre de 2025" */
export function formatFecha(iso: string): string {
  return fechaLarga.format(new Date(`${iso}T00:00:00Z`));
}

/** 1536000 → "1,5 MB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB`;
}
