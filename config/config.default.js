/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/

  const config = exports = {
    // security: {
    //   csrf: {
    //     ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    //   },
    // },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1592213709118_461';
  // 配置需要的中间件，数组顺序即为中间件的加载顺序
  // config.middleware = [ 'clientCheck.js' ];
  // 给clinetCheck传参
  // config.clientCheck = {
  //   ua: /Chrome/,
  // };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',

  };
  // 单数据库信息配置
  config.mysql = {
  // 单数据库信息配置
    client: {
      // host
      host: '127.0.0.1',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: 'root',
      // 数据库名
      database: 'blog_testdb',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };
  return {
    ...config,
    ...userConfig,
  };
};
