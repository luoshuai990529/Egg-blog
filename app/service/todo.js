'use strict';

const Service = require('egg').Service;

class TodoService extends Service {

  // 创建新的待办事件
  async createEventService(data) {
    const conn = await this.ctx.app.mysql.beginTransaction();
    try {
      const { todoType, description, open, priority, tags } = data;
      let start_time = '';
      let end_time = '';
      switch (todoType) {
        case 0:
          start_time = this.ctx.helper.parseTime(new Date(new Date().toLocaleDateString()).getTime(), '{y}-{m}-{d} {h}:{i}:{s}'); // 获取当天0点时间戳
          end_time = this.ctx.helper.parseTime(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1000, '{y}-{m}-{d} {h}:{i}:{s}');// 当天23:59
          break;
        case 1:
          start_time = this.ctx.helper.parseTime(this.ctx.helper.getWeekStartDateAndEndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}'); // 获取当天0点时间戳
          end_time = this.ctx.helper.parseTime(this.ctx.helper.getWeekStartDateAndEndDateRange()[1], '{y}-{m}-{d} {h}:{i}:{s}');// 当天23:59
          break;
        case 2:
          start_time = this.ctx.helper.parseTime(this.ctx.helper.getMonthStartDateAndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}'); // 获取当天0点时间戳
          end_time = this.ctx.helper.parseTime(this.ctx.helper.getMonthStartDateAndDateRange()[1], '{y}-{m}-{d} {h}:{i}:{s}');// 当天23:59
          break;
        case 3:
          start_time = this.ctx.helper.parseTime(this.ctx.helper.getYearStartDateAndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}'); // 获取当天0点时间戳
          end_time = this.ctx.helper.parseTime(this.ctx.helper.getYearStartDateAndDateRange()[1], '{y}-{m}-{d} {h}:{i}:{s}');// 当天23:59
          break;
        default:
          break;
      }
      const secSql = `SELECT
                        id 
                      FROM
                        agenda_date 
                      WHERE
                        COMMIT = '0' 
                        AND date_type = '${todoType}' 
                        AND start_time = '${start_time}' `;
      const secRes = await this.ctx.app.mysql.query(secSql);
      let date_id = null;
      if (secRes.length === 0) {
        const sql1 = `INSERT INTO agenda_date ( start_time, end_time , date_type , commit)
        VALUES ( '${start_time}','${end_time}','${todoType}','0')`;
        const res1 = await conn.query(sql1);
        date_id = res1.insertId;
      } else {
        date_id = secRes[0].id;
      }
      const sql2 = `INSERT INTO agenda ( date_id, description, open, priority, tags, complete )
      VALUES (${date_id},'${description}','${open}','${priority}','${tags}','0' )
      `;
      const res2 = await conn.query(sql2);
      await conn.commit(); // 提交事务
      if (res2.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '新增成功' };
      }
    } catch (error) {
      await conn.rollback();
      return { code: 200, success: 'no', message: '新增失败' };
    }
  }

}

module.exports = TodoService;
