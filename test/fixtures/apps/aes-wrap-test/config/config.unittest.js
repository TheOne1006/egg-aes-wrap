'use strict';

module.exports = () => {
  const config = {
    aesWrap: {
      ignorePaths: [ '/', /^\/testIgnore.ath$/ ],
      key: [ 18, 2, 3, 4, 5, 6, 6, 10, 9, 10, 11, 12, 11, 14, 15, 11 ],
      counter: 6,
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
