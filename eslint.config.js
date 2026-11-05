import js from '@eslint/js';
import globals from 'globals';

export default [
  // Apply ESLint recommended rules to all JS files
  {
    files: ['js/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',   // plain <script> tags, not ES modules
      globals: {
        // Browser built-ins
        ...globals.browser,
        // App-level globals defined by the script-load order in index.html:
        //   data.js   → SN_DATA   (read-only seed data)
        //   storage.js → SN_STORAGE (localStorage layer)
        SN_DATA    : 'readonly',
        SN_STORAGE : 'readonly',
      },
    },
    rules: {
      // ── Possible problems ──────────────────────────────────────────────
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // ── Best practices ─────────────────────────────────────────────────
      'eqeqeq'         : ['error', 'always', { null: 'ignore' }],
      'no-var'         : 'warn',
      'prefer-const'   : 'warn',

      // ── Style (defer to Prettier for formatting) ───────────────────────
      'no-console'     : 'warn',
    },
  },
];
