import { handlerPath } from './libs/handler-resolver';

export const auth = {
  handler: `${handlerPath(__dirname)}/handler.auth`,
  description: 'MIDLEWARE PARA AUTORIZAÇÃO DOS SERVIÇOS DE API',
  memorySize: 128,
  timeout: 3
}

export const addTask = {
  handler: `${handlerPath(__dirname)}/handler.addTask`,
  description: "Incluir um compromisso da agenda.", 
  memorySize: 128,
  timeout: 3,
  
  events: [
    {
      http: {
        method: 'post',
        authorizer: 'auth',
        path: 'task/add',
      },
    },
  ],
};

export const readTask = {
  handler: `${handlerPath(__dirname)}/handler.readTask`,
  description: "Obter um compromisso da agenda.", 
  memorySize: 128,
  timeout: 3,
  events: [
    {
      http: {
        method: 'post',
        authorizer: 'auth',
        path: 'task/read',
      },
    },
  ],
};

export const listTask = {
  handler: `${handlerPath(__dirname)}/handler.listTasks`,
  description: "Lista de compromissos na agenda, filtrando por data de inicio e fim.", 
  memorySize: 128,
  timeout: 3,
  events: [
    {
      http: {
        method: 'post',
        authorizer: 'auth',
        path: 'task/list',
      },
    },
  ],
};

export const removeTask = {
  handler: `${handlerPath(__dirname)}/handler.removeTask`,
  description: "Remover um compromisso da agenda.", 
  memorySize: 128,
  timeout: 3,
  events: [
    {
      http: {
        method: 'post',
        authorizer: 'auth',
        path: 'task/remove',
      },
    },
  ],
};


export const addImage = {
  handler: `${handlerPath(__dirname)}/handler.addImg`,
  description: "Incluir uma imagem na galeria do usuario.", 
  memorySize: 128,
  timeout: 3,
  
  events: [
    {
      http: {
        method: 'post',
        authorizer: 'auth',
        path: 'img/add',
      },
    },
  ],
};


export const listImages = {
  handler: `${handlerPath(__dirname)}/handler.listImgs`,
  description: "Lista de imagens do usuario", 
  memorySize: 128,
  timeout: 3,
  events: [
    {
      http: {
        method: 'post',
        authorizer: 'auth',
        path: 'img/list',
      },
    },
  ],
};