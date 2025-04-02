import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config(
    { ignores: ['dist', 'node_modules'] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            prettierConfig,
        ],
        files: ['**/*.ts'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
        },
        plugins: {
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
);
