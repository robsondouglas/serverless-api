import { handlerPath } from './libs/handler-resolver';

export const add = {
  handler: `${handlerPath(__dirname)}/handler.add`,
  events: [
    {
      http: {
        method: 'post',
        path: 'add',
      },
    },
  ],
};

export const append = {
  handler: `${handlerPath(__dirname)}/handler.append`,
  events: [
    {
      http: {
        method: 'post',
        path: 'append',
      },
    },
  ],
};


export const read = {
  handler: `${handlerPath(__dirname)}/handler.read`,
  events: [
    {
      http: {
        method: 'post',
        path: 'read',
      },
    },
  ],
};

export const list = {
  handler: `${handlerPath(__dirname)}/handler.list`,
  events: [
    {
      http: {
        method: 'post',
        path: 'list',
      },
    },
  ],
};

export const answer = {
  handler: `${handlerPath(__dirname)}/handler.answer`,
  events: [
    {
      http: {
        method: 'post',
        path: 'answer',
      },
    },
  ],
};
