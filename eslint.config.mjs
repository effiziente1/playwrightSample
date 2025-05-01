
import playwright from 'eslint-plugin-playwright';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

// Import recommended config objects for flat config
const tsRecommended = tseslint.configs.recommended;
const playwrightRecommended = playwright.configs['flat/recommended'];

export default [
    {
        ...playwrightRecommended,
        //Ignores some config files and custom reporters
        ignores: [
            'checkly.config.ts',
            'eslint.config.mjs', 
            'report/', 
            'steps-reports/',
            'test-results/',
            'blob-report/'
        ],
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        // Explicitly declare both plugins for the rules below
        plugins: {
            '@typescript-eslint': tseslint,
            'playwright': playwright
        },
        rules: {
            ...playwrightRecommended.rules,
            ...tsRecommended.rules,
            //Code formats
            indent: ['error', 4, { SwitchCase: 1 }],
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
        },
    }
];
