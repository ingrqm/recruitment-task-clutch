module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['perfectionist'],
  rules: {
    'perfectionist/sort-imports': [
      'error',
      {
        type: 'natural',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type',
        ],
        internalPattern: ['^~/.*'],
        newlinesBetween: 'always',
      },
    ],
    'perfectionist/sort-named-imports': ['error', { type: 'natural' }],
    'perfectionist/sort-named-exports': ['error', { type: 'natural' }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
  ],
};
