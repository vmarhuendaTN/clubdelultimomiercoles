'use client';

import { useCallback, useEffect, useState } from 'react';
import { guardarPreferencia, leerPreferencia } from '@/lib/dom/preferencias';

/**
 * Estado que este navegador recuerda (sección del panel, club elegido…). Empieza con el valor
 * por defecto y, ya en el navegador, recupera el guardado si es válido.
 */
export function usePreferencia<T extends string>(
  clave: string,
  porDefecto: T,
  valido: (v: string) => v is T,
): [T, (v: T) => void] {
  const [valor, setValor] = useState<T>(porDefecto);
  useEffect(() => {
    const guardado = leerPreferencia(clave);
    if (guardado !== null && valido(guardado)) setValor(guardado);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, [clave]);
  const cambiar = useCallback(
    (v: T) => {
      setValor(v);
      guardarPreferencia(clave, v);
    },
    [clave],
  );
  return [valor, cambiar];
}
