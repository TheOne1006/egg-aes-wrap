'use strict';

module.exports = () => {
  const config = {
    aesWrap: {
      ignorePaths: [ '/', /^\/testIgnore.ath$/ ],
      algorithm: 'aes-128-cbc',
      key: '0111011111111111', // 16位
      iv: '0111011111111111', // 16位
      outputEncoding: 'hex', // 输出编码
      inputEncoding: 'hex', // 输入编码
      ignore: ctx => {
        return ctx.path === '/testIgnoreFunc';
      },
      ignoreExport: ctx => {
        return ctx.path === '/ignoreExportFunc';
      },
    },
  };

  config.middleware = [
    'aesWrap',
  ];

  return config;
};
