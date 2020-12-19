'use strict';

// app.js
class AppBootHook {
  constructor(app) {
    this.app = app;
  }
  // 这个方法会在EggJS程序启动完毕之后执行
  async serverDidReady() {
    // console.log('启动程序自动执行serverDidReady');
    // 注意点: 这里传递的不是方法名称, 而是需要被执行的那个定时任务文件的名称
    // await this.app.runSchedule('updateMessage');
  }
}

module.exports = AppBootHook;
