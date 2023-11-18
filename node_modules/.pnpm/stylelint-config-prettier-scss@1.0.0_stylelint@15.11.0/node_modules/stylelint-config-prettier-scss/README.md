# stylelint-config-prettier-scss

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url]

Turns off all CSS and SCSS rules that are unnecessary or might conflict with Prettier (extends [`stylelint-config-prettier`](https://npmjs.org/package/stylelint-config-prettier)). This lets you use your favorite shareable config without letting its stylistic choices get in the way when using Prettier.

## Installation

Install `stylelint-config-prettier-scss`:

```
npm install --save-dev stylelint-config-prettier-scss
```

Then, append `stylelint-config-prettier-scss` to the [`extends` array](https://stylelint.io/user-guide/configuration/#extends) in your `.stylelintrc.*` file. Make sure to put it **last,** so it will override other configs.

```js
{
  "extends": [
    // other configs ...
    "stylelint-config-prettier-scss"
  ]
}
```

## CLI helper tool

`stylelint-config-prettier-scss` is shipped with a little CLI tool to help you check if your configuration contains any rules that are in conflict with Prettier.

In order to execute the CLI tool, first add a script for it to `package.json`:

```json
{
  "scripts": {
    "stylelint-scss-check": "stylelint-config-prettier-scss-check"
  }
}
```

Then run `npm run stylelint-scss-check`.

## Attribution

- Inspired by [`eslint-config-prettier`](https://npm.im/eslint-config-prettier).
- CLI helper inspired by [`tslint-config-prettier`](https://github.com/alexjoverm/tslint-config-prettier).
- Original disabled ruleset copied from [`prettier-stylelint`](https://npm.im/prettier-stylelint).

----

[MIT](LICENSE.md)

[downloads-img]: https://img.shields.io/npm/dm/stylelint-config-prettier-scss.svg?style=flat-square
[npm-img]:       https://img.shields.io/npm/v/stylelint-config-prettier-scss.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/stylelint-config-prettier-scss
