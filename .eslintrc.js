module.exports = {
  env: {
    es6: true,
    node: true,
    es2017: true,
    jest: true
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'semi': 'off',
    '@typescript-eslint/semi': ['error'],
    'quotes': ['error', 'single', { 'avoidEscape': true}]
  }
};