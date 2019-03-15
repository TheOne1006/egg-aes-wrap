'use strict';

const assert = require('assert');
const crypto = require('crypto');

// const Base64 = require('js-base64').Base64;
// const cookie = require('cookie');
const mock = require('egg-mock');
// const bigData = require('./big-data');

describe('test/aes-wrap.test.js', () => {
  let app;
  let genSign;
  let deSign;

  before(async () => {
    app = mock.app({
      baseDir: 'apps/aes-wrap-test',
    });
    await app.ready();

    const options = app.config.aesWrap;

    const outputEncoding = options.outputEncoding || 'hex';
    const inputEncoding = options.inputEncoding || 'hex';

    const algorithm = options.algorithm;
    const key = options.key;
    const iv = options.iv;
    // 加密
    genSign = function genSign(src) {
      let sign = '';
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      sign += cipher.update(src, 'utf8', outputEncoding);
      sign += cipher.final(outputEncoding);
      return sign;
    };

    // 解密
    deSign = function deSign(sign) {
      let src = '';
      const cipher = crypto.createDecipheriv(algorithm, key, iv);
      src += cipher.update(sign, inputEncoding, 'utf8');
      src += cipher.final('utf8');
      return src;
    };
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, aesWrap')
      .expect(200);
  });

  it('should GET /testIgnorePath', () => {
    return app.httpRequest()
      .get('/testIgnorePath?q=t')
      .set('content-type', 'application/json')
      .expect({
        test: 'ok',
        q: 't',
      })
      .expect(200);
  });

  it('should GET /testIgnoreFunc', () => {
    return app.httpRequest()
      .get('/testIgnoreFunc?q=t')
      .set('content-type', 'application/json')
      .expect({
        test: 'ok',
        q: 't',
      })
      .expect(200);
  });

  it('should GET /ignoreExportFunc', () => {
    return app.httpRequest()
      .get('/ignoreExportFunc')
      .set('content-type', 'application/json')
      .expect({
        test: 'ok',
      })
      .expect(200);
  });


  it('should GET /test with query', async () => {
    const param = { username: '12138 中文', age: 1 };

    const paramText = encodeURIComponent(JSON.stringify(param));
    const encryptedHexStr = genSign(paramText);
    // console.log('encryptedHexStr');
    // console.log(encryptedHexStr);

    const reqObj = await app.httpRequest()
      .get(`/test?spayload=${encryptedHexStr}`)
      .set('content-type', 'application/json')
      .expect(200);


    const payload = reqObj.body.spayload;
    const decryptedText = deSign(payload);

    const body = JSON.parse(decodeURIComponent(decryptedText));

    const expectdBody = [{
      userId: 1,
    }, {
      username: '12138 中文',
      age: 1,
    }];

    assert.deepStrictEqual(expectdBody, body);
  });

  it('should POST /testPost with query', async () => {
    const param = { username: '12138', age: 1, filter: { where: { userId: 1 } } };
    const bodyInput = {
      payload: 'mysql',
      type: 'select',
      array: [{
        userId: 1,
      }],
      num: 2,
    };

    const paramText = encodeURIComponent(JSON.stringify(param));
    // query
    const queryEncryptedHexStr = genSign(paramText);
    // console.log('encryptedHexStr');
    // console.log(encryptedHexStr);

    // body
    const bodyText = JSON.stringify(bodyInput);
    const bodyEncryptedHexStr = genSign(bodyText);

    app.mockCsrf();
    const reqObj = await app.httpRequest()
      .post(`/testPost?spayload=${queryEncryptedHexStr}`)
      .set('content-type', 'application/json')
      .send({
        spayload: bodyEncryptedHexStr,
      })
      .expect(200);


    const payload = reqObj.body.spayload;
    const decryptedText = deSign(payload);

    const body = JSON.parse(decodeURIComponent(decryptedText));

    const expectdBody = {
      query: 'o',
      username: '12138',
      type: 'select',
      array: [{
        userId: 1,
      }],
      age: 1,
      num: 2,
    };

    assert.deepStrictEqual(body, expectdBody);
  });


  // it('encrypt large data', () => {

  //   const bodyPublicRsaStr = app.rsaObj.publicKey.encrypt(
  //     JSON.stringify(bigData),
  //     'utf8',
  //     'base64',
  //     ursa.RSA_NO_PADDING
  //   );

  //   const bodyStr = app.rsaObj.publicKey.publicDecrypt(bodyPublicRsaStr, 'base64', 'utf8', ursa.RSA_NO_PADDING);
  //   const body = JSON.parse(bodyStr);

  //   assert.deepEqual(body, bigData);

  // });
});
