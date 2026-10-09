'use client';

import { useRef, type KeyboardEvent } from 'react';
import styles from './SegmentedControl.module.css';

export type Segment<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  /** Prefijo de ids: pestañas `${id}-tab-${value}` y panel `${id}-panel`. */
  id: string;
  label: string;
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Control segmentado tipo iOS con el patrón de pestañas ARIA (flechas, Inicio, Fin). */
export function SegmentedControl<T extends string>({
  id,
  label,
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    segments.findIndex((s) => s.value === value),
  );

  const select = (index: number) => {
    const segment = segments[index];
    if (!segment) return;
    onChange(segment.value);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const last = segments.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  return (
    <div role="tablist" aria-label={label} className={styles.control}>
      {segments.map((segment, index) => {
        const selected = index === current;
        return (
          <button
            key={segment.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${segment.value}`}
            aria-selected={selected}
            aria-controls={`${id}-panel`}
            tabIndex={selected ? 0 : -1}
            className={styles.segment}
            onClick={() => select(index)}
            onKeyDown={onKeyDown}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
