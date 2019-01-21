'use strict';

const _ = require('lodash');
const aesjs = require('aes-js');
// const Base64 = require('js-base64').Base64;


module.exports = options => {

  const exportByteFormat = (outputEncoding, Bytes) => {
    switch (outputEncoding) {
      case 'base64':
        return new Buffer(Bytes).toString('base64');
      case 'utf8':
        return aesjs.utils.utf8.fromBytes(Bytes);
      case 'hex':
        return aesjs.utils.hex.fromBytes(Bytes);
      default:
        return Bytes;
    }
  };


  const inputStrToByte = (inputEncoding, inputStr) => {
    switch (inputEncoding) {
      case 'base64':
        return new Buffer(inputStr, 'utf8');
      case 'utf8':
        return aesjs.utils.utf8.toBytes(inputStr);
      case 'hex':
        return aesjs.utils.hex.toBytes(inputStr);
      default:
        return inputStr;
    }
  };


  const middle = async (ctx, next) => {
    const ignorePaths = options.ignorePaths;
    const ignoreFunction = options.ignore;
    const ignoreExportFunc = options.ignoreExport;

    const outputEncoding = options.outputEncoding;
    const inputEncoding = options.inputEncoding;

    const key = options.key;
    const counter = options.counter;

    let ignoreParse = false;
    let ignoreExport = false;

    const ignorePathsLen = ignorePaths.length;

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
    if (!ignoreParse && !ignoreExport) {
      const allIgnore = await ignoreFunction(ctx);
      if (allIgnore) {
        ignoreParse = true;
        ignoreExport = true;
      }
    }

    if (!ignoreExport) {
      ignoreExport = await ignoreExportFunc(ctx);
    }

    if (!ignoreParse) {
      // 解析query
      const queryEncryptedStr = ctx.query && ctx.query.spayload || '';
      let extendQuery = {};
      if (queryEncryptedStr) {
        try {
          const encryptedBytes = inputStrToByte(inputEncoding, queryEncryptedStr);
          // const encryptedBytes = aesjs.utils.hex.toBytes(queryEncryptedStr);
          const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
          const decryptedBytes = aesCtr.decrypt(encryptedBytes);

          const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
          extendQuery = JSON.parse(decryptedText);

        } catch (error) {
          // ignore
          // console.error(error);
        }

        ctx.query = Object.assign(
          ctx.query,
          extendQuery
        );
      }

      let extendBody = {};
      // 解析body
      const bodyEncryptedStr = ctx.request.body && ctx.request.body.spayload || '';

      if (bodyEncryptedStr) {
        try {
          const encryptedBytes = inputStrToByte(inputEncoding, bodyEncryptedStr);
          // const encryptedBytes = aesjs.utils.hex.toBytes(bodyEncryptedStr);
          const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
          const decryptedBytes = aesCtr.decrypt(encryptedBytes);

          const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
          extendBody = JSON.parse(decryptedText);
        } catch (error) {
          // ignore
          // console.error(error);
        }

        ctx.request.body = Object.assign(
          ctx.request.body,
          extendBody
        );
      }
    }

    await next();

    // console.log(ctx.body);

    const body = ctx.body;

    if (body && !ignoreExport) {
      let bodyText = body;
      if (_.isObject(body)) {
        bodyText = JSON.stringify(body);
      }
      const bodyTextBytes = aesjs.utils.utf8.toBytes(bodyText);
      const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));

      const encryptedBytes = aesCtr.encrypt(bodyTextBytes);
      const encryptedStr = exportByteFormat(outputEncoding, encryptedBytes);
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
