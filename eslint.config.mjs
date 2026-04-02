import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
	eslint.configs.recommended,
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				project: './tsconfig.json',
				sourceType: 'module'
			}
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			...tseslint.configs.recommended.rules,

			// Braces — Allman style
			'brace-style': ['warn', 'allman', { allowSingleLine: true }],

			// No semicolons
			'semi': ['warn', 'never'],

			// Tabs
			'indent': ['warn', 'tab', { SwitchCase: 1 }],

			// Single quotes
			'quotes': ['warn', 'single', { avoidEscape: true }],

			// No trailing spaces
			'no-trailing-spaces': ['warn', { ignoreComments: true }],

			// Object curly spacing
			'object-curly-spacing': ['warn', 'always'],

			// No console
			'no-console': 'warn',

			// Disable no-undef — TypeScript handles this
			'no-undef': 'off',

			// No unused vars — use TS version
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}],

			// No explicit any — warn (not error, infrastructure boundaries allow it)
			'@typescript-eslint/no-explicit-any': 'warn',

			// Explicit return types on public methods
			'@typescript-eslint/explicit-function-return-type': 'off',

			// Allow empty functions (common in abstract classes)
			'@typescript-eslint/no-empty-function': 'off',

			// Downgrade to warn for legacy code — {} and Function types
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'warn'
		}
	},
	{
		ignores: ['dist/**', 'node_modules/**', '**/*.spec.ts']
	}
]
