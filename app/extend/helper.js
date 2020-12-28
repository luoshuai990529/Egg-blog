'use strict';
const crypto = require('crypto');
module.exports = {
  // md5加密方式
  md5: password => {
    // 1.指定加密方式
    const md5 = crypto.createHash('md5');
    // 2.指定需要加密的内容和加密之后输出的格式
    const hash = md5.update(password) // 指定需要加密的内容
      .digest('hex'); // 指定加密之后输出的格式
    return hash;
  },
  // 随机创建用户名
  createUserName: () => {
    const chars = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    let username = '';
    for (let i = 0; i < 4; i++) {
      const randomCount = Math.floor(Math.random() * (25 + 1));
      username += chars[randomCount] + randomCount;
    }
    return username;
  },
  // 时间转换
  parseTime: (time, cFormat) => {
    if (arguments.length === 0 || !time) {
      return null;
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
    let date;
    if (typeof time === 'object') {
      date = time;
    } else {
      if ((typeof time === 'string')) {
        if ((/^[0-9]+$/.test(time))) {
          // support "1548221490638"
          time = parseInt(time);
        } else {
          // support safari
          // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
          time = time.replace(new RegExp(/-/gm), '/');
        }
      }

      if ((typeof time === 'number') && (time.toString().length === 10)) {
        time = time * 1000;
      }
      date = new Date(time);
    }
    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay(),
    };
    const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
      const value = formatObj[key];
      // Note: getDay() returns 0 on Sunday
      if (key === 'a') { return [ '日', '一', '二', '三', '四', '五', '六' ][value ]; }
      return value.toString().padStart(2, '0');
    });
    return time_str;
  },
  // 获取当前周 周一和周日的日期
  getWeekStartDateAndEndDateRange: () => {
    const oneDayLong = 24 * 60 * 60 * 1000;
    const now = new Date();
    const mondayTime = new Date(now.toLocaleDateString()).getTime() - (now.getDay() - 1) * oneDayLong;
    const sundayTime = new Date(now.toLocaleDateString()).getTime() + (8 - now.getDay()) * oneDayLong - 1000;
    const monday = new Date(mondayTime);
    const sunday = new Date(sundayTime);
    const weekRange = [ monday, sunday ];
    return weekRange;
  },
  // 获取当前月 起始日和结束日的日期
  getMonthStartDateAndDateRange: () => {
    const now = new Date();
    const year = now.getFullYear();
    const monthStartDate = new Date(year, now.getMonth(), 1);// 当前月1号
    const nextMonthStartDate = new Date(year, now.getMonth() + 1, 1);// 下个月1号
    // const days = new Date(year, now.getMonth() + 1, 0).getDate(); // 计算当前月份的天数
    const monthEndDate = nextMonthStartDate.getTime() - 1000; // 月底最后一天 23:59:59
    const monthRange = [ monthStartDate, monthEndDate ];
    return monthRange;
  },
  // 获取当前年 起始日和结束日的日期
  getYearStartDateAndDateRange: () => {
    const now = new Date();
    const year = now.getFullYear();
    const yearStartTime = new Date(new Date(year, 0, 1).toLocaleDateString()).getTime();
    const yearEndTime = new Date(new Date(year + 1, 0, 1).toLocaleDateString()).getTime() - 1000;
    const yearRange = [ yearStartTime, yearEndTime ];
    return yearRange;
  },
};
