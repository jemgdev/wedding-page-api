module.exports = {
  root: true,
  extends: ['standard-with-typescript'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    'test/**'
  ],
  rules: {
    // estilo de punto y coma
    semi: ['error', 'never'],

    // permitir expresiones booleanas estrictas pero tolerar objetos nulos
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      { allowNullableObject: true }
    ],

    // desactivar reglas que no aplican bien a clases utilitarias o mappers
    '@typescript-eslint/method-signature-style': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',

    // imports absolutos desde paths definidos en tsconfig
    'import/no-unresolved': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      { ts: 'never', js: 'never' }
    ]
  }
}
