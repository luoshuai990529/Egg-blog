'use strict';

module.exports = {
  setCurrentUid(id) {
    this.currentUid = id;
    console.log('调用扩展方法setCurrentUid', this);
  },
  getCurrentUid() {
    console.log('调用扩展方法getCurrentUid');
    // this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
    return this.currentUid;
  },

};
