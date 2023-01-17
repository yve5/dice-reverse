module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  ignorePatterns: ['**/*.test.jsx'],
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

    // to remove
    eqeqeq: 'off',
    'no-unused-vars': 'off',
    'nonblock-statement-body-position': 'off',
    'one-var-declaration-per-line': 'off',
    'one-var': 'off',
    'comma-dangle': 'off',
    'no-multi-assign': 'off',
    'new-cap': 'off',
    'no-new-func': 'off',
    'no-array-constructor': 'off',
    'func-names': 'off',
    'no-undef': 'off',
    'prefer-template': 'off',
    'prefer-const': 'off',
    'no-useless-return': 'off',
    'no-use-before-define': 'off',
    'no-continue': 'off',
    'prefer-destructuring': 'off',
    'no-restricted-globals': 'off',
    'no-new-object': 'off',

    // to check
    camelcase: 'off',
  },
};
