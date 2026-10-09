/**
 * Ningún color, tamaño, radio, sombra o z-index "a pelo" fuera de tokens.css:
 * siempre var(--token). Ver CLAUDE.md § Estructura.
 */
const tokenized = [
  '/color$/',
  'fill',
  'stroke',
  'font-size',
  'font-family',
  'font-weight',
  'line-height',
  'letter-spacing',
  '/^border-radius/',
  'box-shadow',
  'z-index',
  'transition-duration',
  'transition-timing-function',
  'animation-duration',
  'animation-timing-function',
  'gap',
  'row-gap',
  'column-gap',
  '/^padding/',
  '/^margin/',
  'backdrop-filter',
];

const config = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    // Globales (layout.css, utilities.css) en kebab-case; módulos en camelCase (override).
    'selector-class-pattern': '^[a-z][a-z0-9-]*$',
    'custom-property-empty-line-before': null,
    'custom-property-pattern': '^[a-z][a-z0-9-]*$',
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    'import-notation': 'string',
    'scale-unlimited/declaration-strict-value': [
      tokenized,
      {
        ignoreValues: [
          '0',
          'auto',
          'none',
          'inherit',
          'initial',
          'unset',
          'currentcolor',
          'currentColor',
          'transparent',
          'normal',
          '1',
          '100%',
          '/^-?calc\\(/',
          '/^env\\(/',
          '/^max\\(/',
          '/^min\\(/',
          '/^clamp\\(/',
          '/^color-mix\\(/',
          '/^-?var\\(/',
        ],
        disableFix: true,
        message:
          'Usa un token (var(--…)) para "${property}"; los valores "a pelo" solo viven en tokens.css.',
      },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.module.css'],
      rules: {
        'selector-class-pattern': [
          '^[a-z][a-zA-Z0-9]*$',
          { message: 'Las clases de los módulos CSS van en camelCase.' },
        ],
      },
    },
    {
      // Los valores literales solo pueden definirse aquí.
      files: ['src/styles/tokens.css', 'src/styles/reset.css', 'src/styles/utilities.css'],
      rules: { 'scale-unlimited/declaration-strict-value': null },
    },
  ],
};

export default config;
