import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['build/**', 'node_modules/**', 'design-system/dist/**', 'server/**', 'shared/**', '.superpowers/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  { files: ['**/*.test.{ts,tsx}', 'src/test-utils/**'], languageOptions: { globals: { ...globals.node } } },
  { files: ['scripts/**', 'design-system/build.mjs', 'vite.config.ts', 'vitest.config.ts'], languageOptions: { globals: { ...globals.node } } },
);
