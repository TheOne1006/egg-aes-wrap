'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const bigData = require('./demo-resources/big-data.js');
const assert = require('assert');
const aesjs = require('aes-js');

const mock = require('egg-mock');

describe('test/crypto-demo.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/aes-wrap-test',
    });

    return app.ready();
  });

  after(() => app.close());


  it.skip('aes192 big data', async () => {
    const rsaPrivatePath = path.join(__dirname, 'demo-resources', 'rsa_private.key');
    const rsaKey = fs.readFileSync(rsaPrivatePath);
    const cipher = crypto.createCipher('aes192', rsaKey);
    cipher.update(JSON.stringify(bigData));
    // const result = cipher.final('hex');

    // console.log(result);

    // const deciper = crypto.createDecipher('aes192', rsaKey);
    // // 需要知道是用那种编码格式输出的
    // deciper.update(result, 'hex');
    // const sources = deciper.final('utf8');
    // const sourceJson = JSON.parse(sources);

    assert.deepEqual({}, bigData);

  });

  it('aesjs CTR', async () => {
    const key = [ 1, 2, 3, 4, 5, 6, 6, 10, 9, 10, 11, 12, 13, 14, 15, 16 ];

    // Convert text to bytes
    const text = JSON.stringify(bigData);
    const textBytes = aesjs.utils.utf8.toBytes(text);

    // The counter is optional, and if omitted will begin at 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    // console.log('encryptedHex>');
    // console.log(encryptedHex);
    // console.log('encryptedHex.len: %s', encryptedHex.length);
    // console.log('encryptedHex.toString(\'base64\')>');
    // const base64EncryptedBytes = new Buffer(encryptedBytes).toString('base64');
    // console.log(base64EncryptedBytes);
    // console.log('base64.len: %s', base64EncryptedBytes.length);
    // "a338eda3874ed884b6199150d36f49988c90f5c47fe7792b0cf8c7f77eeffd87
    //  ea145b73e82aefcf2076f881c88879e4e25b1d7b24ba2788"

    // When ready to decrypt the hex string, convert it back to bytes
    encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    const decryptedData = JSON.parse(decryptedText);

    assert.deepEqual(bigData, decryptedData);

  });

  it('aesjs CTR use base64', async () => {
    const key = [ 1, 2, 3, 4, 5, 6, 6, 10, 9, 10, 11, 12, 13, 14, 15, 16 ];

    // Convert text to bytes
    const text = JSON.stringify(bigData);
    const textBytes = aesjs.utils.utf8.toBytes(text);

    // The counter is optional, and if omitted will begin at 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    const encryptedBytes = aesCtr.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    // const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    // console.log(encryptedHex);
    // "a338eda3874ed884b6199150d36f49988c90f5c47fe7792b0cf8c7f77eeffd87
    //  ea145b73e82aefcf2076f881c88879e4e25b1d7b24ba2788"

    // When ready to decrypt the hex string, convert it back to bytes
    // encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    const decryptedData = JSON.parse(decryptedText);

    assert.deepEqual(bigData, decryptedData);

  });

  it('aes crypto aes-128-cbc genSign', async () => {
    const secretKey = '0111011111111111';
    const iv = '0111011111111111';
    const text = 'hello';

    const cipher = crypto.createCipheriv('aes-128-cbc', secretKey, iv);
    cipher.update(text, 'utf8', 'hex');

    const actual = cipher.final('hex');

    assert(actual === 'b046fa283cfff9cfb3513e0fce38d600');
  });

  it('aes crypto aes-128-cbc deSign', async () => {
    const secretKey = '0111011111111111';
    const text = 'b046fa283cfff9cfb3513e0fce38d600';
    const iv = '0111011111111111';

    const cipher = crypto.createDecipheriv('aes-128-cbc', secretKey, iv);
    cipher.update(text, 'hex', 'utf8');

    const actual = cipher.final('utf8');

    assert(actual === 'hello');
  });
});
