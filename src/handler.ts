import { App } from "./app/app";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { requestUpload } from "./libs/utils";

const generatePolicy = (principalId, effect, resource, data) => {
  const authResponse = {
      principalId: principalId,
      policyDocument: {
          Version: '2012-10-17',
          Statement: [{
              Action: 'execute-api:Invoke',
              Effect: effect,
              Resource: resource
          }]
      },
      context: data
  };
  return authResponse;
};

export const auth    = async(event, _, callback)=> {
  const tokenValue = (event.authorizationToken || event.headers['Authorization'])?.split(' ')[1] ;

  if(!tokenValue)
  { 
    console.log('Token não informado')
    callback('Unauthorized'); 
  }
  else
  {
    try {
      const verifier = CognitoJwtVerifier.create({
        userPoolId: 'sa-east-1_28VaLNwAP',
        clientId:   '7joob4d238qo57i2gdmnkpava2',
        tokenUse: "access"    
      });
      console.log('Verificando token')
      const payload = await verifier.verify(tokenValue);
      console.log('Token autorizado!')
      callback(null, generatePolicy(payload.sub, 'Allow', event.methodArn, payload));
    } 
    catch(e)
    {
      console.log('Erro ao validar token', e); 
      callback('Unauthorized'); 
    }
  }
  
}

const success = (body:any)=>({
  isBase64Encoded: false,
  statusCode: 200,
  headers: {
    "content-type": "application/json",
    "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  },
  body: JSON.stringify(body),
  
});

const fail = (err:Error)=>({
  isBase64Encoded: false,
  statusCode: 500,
  body: err.message,
  headers: {
    "content-type": "application/json",
    "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  },
});

const exec = async(event:any, hnd:(app:App, data:any)=>any)=>{
  
  const owner = {IdOwner: event.requestContext?.authorizer?.jwt?.claims?.sub}; //IdOwner preenchido pelos access_token 
  const body = event?.body && JSON.parse(event.body)
  const data =  Array.isArray(body) ? body.map(m=> ({ ...m, ...owner })) : { ...body, ...owner };
  
  console.log(owner);

  try
  { return success(await hnd(new App(), data)); }
  catch(ex)
  { return fail(ex); }
}

const execS3 = async(event:any, hnd:(app:App, data:any)=>any)=>{
  

  try
  { 
    console.log(JSON.stringify(event));
    const app = new App()
    for(const r of event.Records){
      console.log(JSON.stringify(r))
      await hnd(app, r);
    }

    return success({}) ; 
  }
  catch(ex)
  { return fail(ex); }
}


export const addTask     = async (event) => await exec(event, (app, body) => app.addTask(body));
export const readTask    = async (event) => await exec(event, (app, body) => app.getTask(body));
export const listTasks   = async (event) => await exec(event, (app, body) => app.listTasks(body));
export const removeTask  = async (event) => await exec(event, (app, body) => app.deleteTask(body));

export const addImg            = async (event) => await exec(event, (app, body) => app.addImage(body));
export const listImgs          = async (event) => await exec(event, (app, body) => app.listImages(body));
export const requestPostImage  = async ()      => await requestUpload();
export const processImage      = async (event) => await execS3(event, (app, itm) => app.processImage(itm.s3.object.key));      

export const enqueueSchedules  = async (event) => await exec(event, (app, _) => app.enqueueSchedules());
export const scheduledRun      = async (event) => await exec(event, (app, _) => app.runSchedules(event.Records.map( ({Body})=> JSON.parse(Body))));
export const subscribe         = async (event) => await exec(event, (app, body) => app.subscribe(body));
export const unsubscribe       = async (event) => await exec(event, (app, body) => app.unsubscribe(body));
  

export const wsConn = async(_, __, callback) => {
  const successfullResponse = {
    statusCode: 200,
    body: 'Success'
  }

  callback(null, successfullResponse)
  
}

export const wsDisc = async(event, _, callback) => {
  const successfullResponse = {
    statusCode: 200,
    body: 'Success'
  }

  console.log(event);
  callback(null, successfullResponse)
  
}

export const wsDefault = async(event, _, callback) => {
  const successfullResponse = {
    statusCode: 200,
    body: 'Success'
  }

  console.log(event);
  callback(null, successfullResponse)
  
}
