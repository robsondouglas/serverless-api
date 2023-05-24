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
      httpApi: {
        method: 'post',
        authorizer: {name: 'auth'},
        path: '/task/add',
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
      httpApi: {
        method: 'post',
        authorizer: {name: 'auth'},
        path: '/task/read',
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
      httpApi: {
        method: 'post',
        authorizer: {name: 'auth'},
        path: '/task/list',
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
      httpApi: {
        method: 'post',
        authorizer: {name: 'auth'},
        path: '/task/remove',
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
      httpApi: {
        method: 'post',
        authorizer: {name: 'auth'},
        path: '/img/add',
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
      httpApi: {
        method: 'post',
        authorizer: {name: 'auth'},
        path: '/img/list',
      },
    },
  ],
};

export const requestPostImage = {
  handler: `${handlerPath(__dirname)}/handler.requestPostImage`,
  description: "Solicita upload de imagem", 
  memorySize: 128,
  timeout: 3,
  events: [
    {
      httpApi: {
        method: 'post',
        authorizer: {name: 'auth'},
        path: '/img/requestUpload',
      },
    },
  ],
};


export const processImage = (bucketName:string)=>({
  handler: `${handlerPath(__dirname)}/handler.processImage`,
  description: "Processa as imagens originais e as salva no diretórios de destino", 
  memorySize: 512,
  timeout: 5,
  events: [
    {
      s3: {
        bucket: bucketName,
        existing: true,
        event: 's3:ObjectCreated:*',
        rules: [{prefix: 'original/'}]
      },
    },
  ], 
})

export const wsConn = {
  handler: `${handlerPath(__dirname)}/handler.wsConn`,
  description: "WebSocket", 
  events: [ { websocket: {authorizer: {name: 'auth'}, route: '$connect'} }],
};

export const wsDisc = {
  handler: `${handlerPath(__dirname)}/handler.wsDisc`,
  description: "WebSocket", 
  events: [ { websocket: {route: '$disconnect'} } ],
};

export const wsDefault = {
  handler: `${handlerPath(__dirname)}/handler.wsDefault`,
  description: "WebSocket", 
  events: [ { websocket: {route: '$default'} } ],
};

export const enqueueSchedules = (evtName)=>({
  handler: `${handlerPath(__dirname)}/handler.enqueueSchedules`,
  description: "Enfileira as tarefas para serem executadas", 
  memorySize: 128,
  timeout: 3,
  events: [{ 
    schedule: {
      name:evtName, 
      rate: ["rate(1 minute)"]
  }}],
});

export const runSchedules = (sqsName)=>({
  handler: `${handlerPath(__dirname)}/handler.runSchedules`,
  description: "Executa os alertas das tarefas enfileiradas", 
  memorySize: 128,
  timeout: 3,
  events: [{
    sqs: { 
      arn: {"Fn::GetAtt": [sqsName, 'Arn']},
      batchSize: 30,
      maximumBatchingWindow: 5 
  }}]
})
