import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'

const typescriptResolvesIdentifiers = {
  rules: {
    'no-undef': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
}

const pugTemplatesAreInvisibleToUsageChecks = {
  files: ['**/*.vue'],
  languageOptions: { parserOptions: { parser: ts.parser } },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
  },
}

export default function createEslintConfig() {
  return ts.config(
    {
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.nuxt/**',
        '**/.output/**',
        '**/*.config.{ts,mjs}',
      ],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    ...vue.configs['flat/recommended'],
    typescriptResolvesIdentifiers,
    pugTemplatesAreInvisibleToUsageChecks,
  )
}
