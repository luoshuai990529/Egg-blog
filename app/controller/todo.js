'use strict';

const Controller = require('egg').Controller;

class TodoController extends Controller {

  async createEventController() {
    const result = await this.ctx.service.todo.createEventService(this.ctx.request.body);
    this.ctx.body = result;
  }

  async queryEventController() {
    const result = await this.ctx.service.todo.queryEventService();
    this.ctx.body = result;
  }
}

module.exports = TodoController;

