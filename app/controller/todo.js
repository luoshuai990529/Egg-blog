'use strict';

const Controller = require('egg').Controller;

class TodoController extends Controller {

  async createEventController() {
    const result = await this.ctx.service.todo.createEventService(this.ctx.request.body);
    this.ctx.body = result;
  }

  async queryEventController() {
    const result = await this.ctx.service.todo.queryEventService(this.ctx.query);
    this.ctx.body = result;
  }

  async completeEventController() {
    const body = this.ctx.request.body;
    const result = await this.ctx.service.todo.completeEventService(body);
    this.ctx.body = result;
  }

  async cancleEventController() {
    const body = this.ctx.request.body;
    const result = await this.ctx.service.todo.cancleEventService(body);
    this.ctx.body = result;
  }

  async deleteEventController() {
    const body = this.ctx.request.body;
    const result = await this.ctx.service.todo.deleteEventService(body);
    this.ctx.body = result;
  }

  async commitEventController() {
    const body = this.ctx.request.body;
    const result = await this.ctx.service.todo.commitEventService(body);
    this.ctx.body = result;
  }
}

module.exports = TodoController;

