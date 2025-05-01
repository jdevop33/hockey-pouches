module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', '.next/', '.vercel/'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'drizzle'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-update-with-where': 'error',
    'drizzle/enforce-schema-imports': [
      'error',
      {
        preferIndividualImports: true,
        disallowNamespaceImports: true,
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': process.env.NODE_ENV === 'production' ? 'warn' : [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': process.env.NODE_ENV === 'production' ? 'warn' : 'error',
    'react-hooks/exhaustive-deps': process.env.NODE_ENV === 'production' ? 'warn' : 'error',
    // Add any additional custom rules here
  },
  overrides: [
    {
      files: ['app/api/**/*.ts', 'app/lib/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'no-console': 'off',
        'no-unused-expressions': 'off',
      },
    },
    // For production builds, relax rules that are causing the most issues
    ...(process.env.NODE_ENV === 'production' ? [
      {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-unused-vars': 'warn',
          'react-hooks/exhaustive-deps': 'warn',
        },
      },
    ] : []),
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.eslint.json',
      },
    },
  },
};
