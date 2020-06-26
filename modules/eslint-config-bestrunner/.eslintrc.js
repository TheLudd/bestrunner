module.exports = {
  env: {
    mocha: true,
    node: true,
  },
  extends: 'eslint-config-airbnb-base',
  plugins: [ 'import' ],
  rules: {
    'array-bracket-spacing': [ 'warn', 'always' ],
    'arrow-body-style': 'warn',
    'arrow-parens': [ 'warn', 'always' ],
    'comma-dangle': [ 'warn', 'always-multiline' ],
    'import/named': 'error',
    'import/no-extraneous-dependencies': [
      'warn',
      {
        devDependencies: [
          '**/features/**/*.js',
          '**/test/**',
          '**/testfunctions/*.js',
          '**/spec/*.js',
          'rollup.config.js',
        ],
      },
    ],
    indent: [ 'warn', 2 ],
    'new-cap': 0,
    'no-multiple-empty-lines': [ 'warn', { max: 1, maxBOF: 0, maxEOF: 0 } ],
    'no-nested-ternary': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': [
      'warn',
      { allow: [ '_id' ] },
    ],
    'no-unexpected-multiline': 'error',
    'no-unused-vars': [ 'warn', {
      args: 'all',
      argsIgnorePattern: '^_',
      ignoreRestSiblings: false,
      vars: 'all',
    } ],
    semi: [ 'warn', 'never' ],
    'space-before-function-paren': [ 'warn', 'always' ],
  },
}
