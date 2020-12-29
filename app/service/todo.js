'use strict';

const Service = require('egg').Service;

class TodoService extends Service {
  // 抽取公共功能函数
  createNewObj(list, item) {
    const obj = {};
    obj.id = item.cid;
    obj.commit = item.commit;
    obj.start_time = item.start_time;
    obj.end_time = item.end_time;
    obj.date_type = item.date_type;
    obj.list = [ item ];
    list.push(obj);
  }
  addNewField(arr) {
    arr.forEach(item => {
      item.openDesc = item.open === '1' ? '是' : '否';
    });
    return arr;
  }
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
          start_time = this.ctx.helper.parseTime(this.ctx.helper.getWeekStartDateAndEndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}'); // 获取周开始日期
          end_time = this.ctx.helper.parseTime(this.ctx.helper.getWeekStartDateAndEndDateRange()[1], '{y}-{m}-{d} {h}:{i}:{s}');// 获取周结束日期
          break;
        case 2:
          start_time = this.ctx.helper.parseTime(this.ctx.helper.getMonthStartDateAndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}'); // 获取月开始日期
          end_time = this.ctx.helper.parseTime(this.ctx.helper.getMonthStartDateAndDateRange()[1], '{y}-{m}-{d} {h}:{i}:{s}');// 获取月结束日期
          break;
        case 3:
          start_time = this.ctx.helper.parseTime(this.ctx.helper.getYearStartDateAndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}'); // 获取年开始日期
          end_time = this.ctx.helper.parseTime(this.ctx.helper.getYearStartDateAndDateRange()[1], '{y}-{m}-{d} {h}:{i}:{s}');//  获取年结束日期
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

  // 查询正在进行的 日周月年 待办事件
  async queryEventService() {
    try {
      const dayTime = this.ctx.helper.parseTime(new Date(new Date().toLocaleDateString()).getTime(), '{y}-{m}-{d} {h}:{i}:{s}');
      const weekTime = this.ctx.helper.parseTime(this.ctx.helper.getWeekStartDateAndEndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}');
      const monthTime = this.ctx.helper.parseTime(this.ctx.helper.getMonthStartDateAndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}');
      const yearTime = this.ctx.helper.parseTime(this.ctx.helper.getYearStartDateAndDateRange()[0], '{y}-{m}-{d} {h}:{i}:{s}');
      const sql = `
                  SELECT
                  ad.id,
                  ad.description,
                  ad.open,
                  ad.tags,
                  ad.complete,
                  ad.priority,
                  adt.id as cid,
                  adt.start_time,
                  adt.end_time,
                  adt.date_type,
                  adt.commit 
                FROM
                  agenda ad
                  LEFT JOIN agenda_date adt ON ad.date_id = adt.id 
                WHERE
                  adt.start_time = '${dayTime}' 
                  AND adt.date_type = '0' 
                  OR start_time = '${weekTime}' 
                  AND adt.date_type = '1' 
                  OR start_time = '${monthTime}' 
                  AND adt.date_type = '2' 
                  OR start_time = '${yearTime}' 
                  AND adt.date_type = '3'
                  OR adt.COMMIT = '0'`;
      const result = await this.ctx.app.mysql.query(sql);
      const dayList = [];
      const weekList = [];
      const monthList = [];
      const yearList = [];
      const unCmtList = [];
      result.forEach(item => {
        const time_mark = this.ctx.helper.parseTime(new Date(item.start_time).getTime());
        let count = 0;
        time_mark === dayTime && item.date_type === '0' ? dayList.push(item) : count++;
        time_mark === weekTime && item.date_type === '1' ? weekList.push(item) : count++;
        time_mark === monthTime && item.date_type === '2' ? monthList.push(item) : count++;
        time_mark === yearTime && item.date_type === '3' ? yearList.push(item) : count++;
        if (count === 4) {
          unCmtList.push(item);
        }
      });
      const list = [];

      unCmtList.forEach(item => {
        if (list.length > 0) {
          let flag = true;
          list.forEach(item2 => {
            if (item.date_type === item2.date_type && item.start_time.toString() === item2.start_time.toString()) {
              item2.list.push(item);
              flag = false;
            }
          });
          if (flag) {
            this.createNewObj(list, item);
          }
        } else {
          this.createNewObj(list, item);
        }
      });
      return { code: 200, success: 'ok', message: '成功', data: { dayList: this.addNewField(dayList), weekList: this.addNewField(weekList), monthList: this.addNewField(monthList), yearList: this.addNewField(yearList), unCmtList: list } };
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }

  // 完成待办事件
  async completeEventService({ id }) {
    try {
      const sql = ` UPDATE agenda 
                    SET complete = '1' 
                    WHERE
                      id = ${id}`;
      const res = await this.ctx.app.mysql.query(sql);
      if (res.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '成功完成事件' };
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }

  // 撤销已完成的待办事件
  async cancleEventService({ id }) {
    try {
      const sql = ` UPDATE agenda 
                    SET complete = '0' 
                    WHERE
                      id = ${id}`;
      const res = await this.ctx.app.mysql.query(sql);
      if (res.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '撤销成功' };
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }

  // 删除创建的待办
  async deleteEventService({ id }) {
    try {
      const sql = ` DELETE 
                    FROM
                      agenda 
                    WHERE
                      id = ${id}`;
      const res = await this.ctx.app.mysql.query(sql);
      if (res.affectedRows === 1) {
        return { code: 200, success: 'ok', message: '删除成功' };
      }
    } catch (error) {
      return { code: 200, success: 'no', message: error };
    }
  }
}

module.exports = TodoService;
