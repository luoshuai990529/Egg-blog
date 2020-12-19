'use strict';
const crypto = require('crypto');
module.exports = {
  md5: password => {
    // 1.指定加密方式
    const md5 = crypto.createHash('md5');
    // 2.指定需要加密的内容和加密之后输出的格式
    const hash = md5.update(password) // 指定需要加密的内容
      .digest('hex'); // 指定加密之后输出的格式
    return hash;
  },
  createUserName: () => {
    const chars = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    let username = '';
    for (let i = 0; i < 4; i++) {
      const randomCount = Math.floor(Math.random() * (25 + 1));
      username += chars[randomCount] + randomCount;
    }
    return username;
  },
};
