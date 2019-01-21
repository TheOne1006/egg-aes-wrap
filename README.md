# egg-aes-wrap

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-aes-wrap.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-aes-wrap
[travis-image]: https://img.shields.io/travis/eggjs/egg-aes-wrap.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-aes-wrap
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-aes-wrap.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-aes-wrap?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-aes-wrap.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-aes-wrap
[snyk-image]: https://snyk.io/test/npm/egg-aes-wrap/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-aes-wrap
[download-image]: https://img.shields.io/npm/dm/egg-aes-wrap.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-aes-wrap

<!--
Description here.
-->

## Install

```bash
$ npm i egg-aes-wrap --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.aesWrap = {
  enable: true,
  package: 'egg-aes-wrap',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.aesWrap = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
