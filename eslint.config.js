// @ts-check
import { builtinModules, createRequire } from 'node:module'
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint'
import pluginN from 'eslint-plugin-n'
import pluginImportX from 'eslint-plugin-import-x'
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import preferAllowFunction from 'eslint-plugin-prefer-arrow-functions';


export default tseslint.config(
  {
    ignores: ['tests/integration-tests/fixtures/**/*'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    name: 'main',
    files: ['**/*.ts'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.es2021,
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      n: pluginN,
      'import-x': pluginImportX,
      'prettier': eslintPluginPrettier,
      'prefer-arrow-functions': preferAllowFunction,
    },
    rules: {
      'n/no-exports-assign': 'error',
      'n/no-unpublished-bin': 'error',
      'n/no-unsupported-features/es-builtins': 'error',
      'n/no-unsupported-features/node-builtins': 'error',
      'n/process-exit-as-throw': 'error',
      'n/hashbang': 'error',

      eqeqeq: ['warn', 'always', { null: 'never' }],
      'prefer-const': [
        'warn',
        {
          destructuring: 'all',
        },
      ],

      'import-x/no-nodejs-modules': [
        'error',
        { allow: builtinModules.map((mod) => `node:${mod}`) },
      ],
      'import-x/no-duplicates': 'error',
      'import-x/order': 'error',

      "prefer-arrow-functions/prefer-arrow-functions": [
        "warn",
        {
          "allowNamedFunctions": false,
          "classPropertiesAllowed": false,
          "disallowPrototype": false,
          "returnStyle": "unchanged",
          "singleReturnOnly": false
        }
      ],

      ...eslintPluginPrettierRecommended.rules,
      'prettier/prettier': 'warn',
    },
  },
);
