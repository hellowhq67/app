/** @type {import('prettier').Config} */
const prettierConfig = {
  endOfLine: 'lf',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '^(expo/(.*)$)|^(expo$)',
    '^(app/(.*)$)|^(app$)',
    '<THIRD_PARTY_MODULES>',
    '^@/components/(.*)$',
    '^@/lib/(.*)$',
    '^@/hooks/(.*)$',
    '^@/styles/(.*)$',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
}

export default prettierConfig
