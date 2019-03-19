'use strict';

const _ = require('lodash');
const crypto = require('crypto');
// const Base64 = require('js-base64').Base64;


module.exports = options => {
  const middle = async (ctx, next) => {
    const ignorePaths = options.ignorePaths || [];
    const ignoreFunction = options.ignore;
    const ignoreExportFunc = options.ignoreExport;

    const outputEncoding = options.outputEncoding || 'hex';
    const inputEncoding = options.inputEncoding || 'hex';

    const algorithm = options.algorithm;
    const key = options.key;
    const iv = options.iv;

    let ignoreParse = false;
    let ignoreExport = false;

    const ignorePathsLen = ignorePaths.length;


    // 加密
    function genSign(src) {
      let sign = '';

      if (typeof src === 'string') {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        sign += cipher.update(src, 'utf8', outputEncoding);
        sign += cipher.final(outputEncoding);
      }
      
      return sign;
    }

    // 解密
    function deSign(sign) {
      let src = '';
      const cipher = crypto.createDecipheriv(algorithm, key, iv);
      src += cipher.update(sign, inputEncoding, 'utf8');
      src += cipher.final('utf8');
      return src;
    }

    for (let index = 0; index < ignorePathsLen; index++) {
      const path = ignorePaths[index];
      const isStr = typeof path === 'string';
      if (isStr && path === ctx.path) {
        ignoreParse = true;
        ignoreExport = true;
        break;
      }

      const isReg = path instanceof RegExp;
      if (isReg && path.test(ctx.path)) {
        ignoreParse = true;
        ignoreExport = true;
        break;
      }
    }

    // 没有修改, 执行 ignoreFunction
    if (!ignoreParse && !ignoreExport && typeof ignore === 'function') {
      const allIgnore = await ignoreFunction(ctx);
      if (allIgnore) {
        ignoreParse = true;
        ignoreExport = true;
      }
    }

    if (!ignoreParse) {
      // 解析query
      const queryEncryptedStr = ctx.query && ctx.query.spayload || '';
      let extendQuery = {};
      if (queryEncryptedStr) {
        try {
          const decryptedText = deSign(queryEncryptedStr);

          // query 时使用 encodeURIComponent
          const decryptedTextDecodeURI = decodeURIComponent(decryptedText);

          extendQuery = JSON.parse(decryptedTextDecodeURI);

        } catch (error) {
          // ignore
          // console.error(error);
        }

        _.extend(ctx.query, extendQuery);
      }

      let extendBody = {};
      // 解析body
      const bodyEncryptedStr = ctx.request.body && ctx.request.body.spayload || '';

      if (bodyEncryptedStr) {
        try {
          const decryptedText = deSign(bodyEncryptedStr);
          extendBody = JSON.parse(decryptedText);
        } catch (error) {
          // ignore
          // console.error(error);
        }

        _.extend(ctx.request.body, extendBody);
      }
    }

    await next();

    if (!ignoreExport && typeof ignoreExportFunc === 'function') {
      ignoreExport = await ignoreExportFunc(ctx);
    }

    // console.log(ctx.body);

    const body = ctx.body;

    if (body && !ignoreExport) {
      let bodyText = body;
      if (_.isObject(body)) {
        bodyText = JSON.stringify(body);
      }
      const encryptedStr = genSign(bodyText);
      // const encryptedStr = aesjs.utils.hex.fromBytes(encryptedBytes);

      // debug
      // const utf8PayloadExpected = aesjs.utils.utf8.fromBytes(encryptedBytes);
      // console.log('wrap utf8PayloadExpected:');
      // console.log(utf8PayloadExpected);

      ctx.body = {
        spayload: encryptedStr,
      };
    }

  };
  return middle;
};
