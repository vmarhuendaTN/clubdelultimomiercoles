import { FlatCompat } from '@eslint/eslintrc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** Cada feature expone su API pública por index.ts: prohibido entrar en sus carpetas internas. */
const featureInternals = {
  group: ['@/features/*/*', '!@/features/*/server'],
  message:
    'Importa la feature por su API pública (@/features/<nombre> o @/features/<nombre>/server), no sus rutas internas.',
};

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'public/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // eslint-config-next ya registra el plugin jsx-a11y; añadimos su configuración estricta.
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,
      // role="list" explícito: Safari quita la semántica de lista con list-style: none.
      'jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
      // Las regiones desplazables deben poder enfocarse con teclado (regla de axe).
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
      'no-restricted-imports': ['error', { patterns: [featureInternals] }],
      'react/forbid-dom-props': ['error', { forbid: ['style'] }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Rutas de app/: solo componen features; nada de clientes de infraestructura directos.
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            featureInternals,
            {
              group: ['@/lib/sheets*', '@/lib/books-api*', '@/lib/instagram-api*'],
              message: 'app/ no contiene lógica de negocio: usa los servicios de features/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.ts', '**/*.test.{ts,tsx}', 'e2e/**/*.ts', '*.config.{ts,mjs}'],
    rules: { 'react/forbid-dom-props': 'off' },
  },
  prettier,
];

export default config;
