import js from '@eslint/js';
import globals from 'globals';
import { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'public/**', '.vercel/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      // Essential rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-duplicate-imports': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-object-spread': 'error',
      
      // TypeScript-specific rules that now work with core ESLint
      'no-empty-function': ['error', { 
        allow: ['arrowFunctions', 'methods', 'privateConstructors', 'protectedConstructors'] 
      }],
      'no-invalid-this': 'error',
      'no-loop-func': 'error',
      'no-unused-expressions': 'error',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      // React specific rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
    },
  },
];

export default config;
