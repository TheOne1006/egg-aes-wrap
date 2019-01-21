'use strict';

const aesjs = require('aes-js');
const assert = require('assert');

// const Base64 = require('js-base64').Base64;
// const cookie = require('cookie');
const mock = require('egg-mock');
// const bigData = require('./big-data');

describe('test/aes-wrap.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/aes-wrap-test',
    });
    return app.ready();
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
    const param = { username: '12138 中文' };

    const aesConfig = app.config.aesWrap;
    const counter = aesConfig.counter;
    const key = aesConfig.key;


    const paramText = JSON.stringify(param);
    const paramTextBytes = aesjs.utils.utf8.toBytes(paramText);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
    const encryptedBuffer = aesCtr.encrypt(paramTextBytes);

    const encryptedHexStr = aesjs.utils.hex.fromBytes(encryptedBuffer);
    // console.log('encryptedHexStr');
    // console.log(encryptedHexStr);

    const reqObj = await app.httpRequest()
      .get(`/test?spayload=${encryptedHexStr}`)
      .set('content-type', 'application/json')
      .expect(200);


    const payload = reqObj.body.spayload;

    // parse
    const payloadByte = aesjs.utils.hex.toBytes(payload);

    const aesCtrParse = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
    const decryptedBytes = aesCtrParse.decrypt(payloadByte);

    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

    const body = JSON.parse(decryptedText);

    const expectdBody = [{
      userId: 1,
    }, {
      username: '12138 中文',
    }];

    assert.deepEqual(expectdBody, body);
  });

  it('should POST /testPost with query', async () => {

    const aesConfig = app.config.aesWrap;
    const counter = aesConfig.counter;
    const key = aesConfig.key;

    const param = { username: '12138', age: 1, filter: { where: { userId: 1 } } };
    const bodyInput = {
      payload: 'mysql',
      type: 'select',
      array: [{
        userId: 1,
      }],
    };

    const paramText = JSON.stringify(param);
    const paramTextBytes = aesjs.utils.utf8.toBytes(paramText);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
    const encryptedBuffer = aesCtr.encrypt(paramTextBytes);

    // query
    const queryEncryptedHexStr = aesjs.utils.hex.fromBytes(encryptedBuffer);
    // console.log('encryptedHexStr');
    // console.log(encryptedHexStr);

    // body
    const bodyText = JSON.stringify(bodyInput);
    const bodyTextBytes = aesjs.utils.utf8.toBytes(bodyText);
    const aesCtr2 = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
    const bodyEncryptedBuffer = aesCtr2.encrypt(bodyTextBytes);
    const bodyEncryptedHexStr = aesjs.utils.hex.fromBytes(bodyEncryptedBuffer);

    app.mockCsrf();
    const reqObj = await app.httpRequest()
      .post(`/testPost?spayload=${queryEncryptedHexStr}`)
      .set('content-type', 'application/json')
      .send({
        spayload: bodyEncryptedHexStr,
      })
      .expect(200);


    const payload = reqObj.body.spayload;


    // parse
    const payloadByte = aesjs.utils.hex.toBytes(payload);

    const aesCtrParse = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
    const decryptedBytes = aesCtrParse.decrypt(payloadByte);

    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

    const body = JSON.parse(decryptedText);

    const expectdBody = {
      query: 'o',
      username: '12138',
      type: 'select',
      array: [{
        userId: 1,
      }],
      age: 1,
    };

    assert.deepEqual(body, expectdBody);
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
