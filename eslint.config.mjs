import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-component-properties-in-render': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react-hooks/static-components': 'off',
    },
  },
  {
    files: ['app/api/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            '@/lib/cube/cfop-solver-cubejs',
            '@/lib/cube/cfop-solver',
            '@/lib/cube/cfop-solver-v3',
            '@/lib/cube/cfop-complete-solver',
            '@/lib/cube/cfop-web-solver',
            '@/lib/cube/cfop-tiered-f2l',
            '@/lib/cube/cfop-solver-coordinate',
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'scripts/**',
    '.tmp-tests/**',
    'backup-ocr-feature/**',
    'lib/**/archive/**',
  ]),
])

export default eslintConfig
