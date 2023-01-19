module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  ignorePatterns: ['**/*.test.jsx'],
  globals: {
    createjs: 'readonly',
    Game: 'readonly',
    location: 'writable',
    document: 'writable',
    window: 'writable',
    lib: 'writable',
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'object-curly-newline': 'off',
    'import/no-named-as-default': 'off',
    'operator-linebreak': ['error', 'after'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'implicit-arrow-linebreak': 'off',
    'linebreak-style': 'off',

    'no-restricted-globals': 'off',
    'comma-dangle': 'off',
    'no-continue': 'off',
    'func-names': 'off',
    'new-cap': 'off',
    'no-use-before-define': 'off',

    // to remove
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    curly: ['error', 'all'],

    // eqeqeq: 'off',
    // 'one-var': 'off',
    // 'no-multi-assign': 'off',
    // 'no-new-func': 'off',
    // 'no-array-constructor': 'off',
    // 'no-undef': 'off',
    // 'prefer-template': 'off',
    // 'prefer-const': 'off',
    // 'no-useless-return': 'off',
    // 'prefer-destructuring': 'off',
    // 'no-new-object': 'off',
    // camelcase: 'off',
  },
};
