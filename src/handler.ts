import { App } from "./app/app";
import { CognitoJwtVerifier } from "aws-jwt-verify";

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
  const tokenValue = event.authorizationToken?.split(' ')[1];

  if(!tokenValue)
  {
    callback('Unauthorized');
  }
  else
  {
    // Verifier that expects valid access tokens:
    const verifier = CognitoJwtVerifier.create({
      userPoolId: 'sa-east-1_28VaLNwAP',
      clientId:   '7joob4d238qo57i2gdmnkpava2',
      tokenUse: "access"    
    });

    try {
      const payload = await verifier.verify(tokenValue);
      callback(null, generatePolicy(payload.sub, 'Allow', event.methodArn, payload));

    } catch 
    { callback('Unauthorized'); }
  }
  
}

const success = (body:any)=>({
  isBase64Encoded: false,
  statusCode: 200,
  body: JSON.stringify(body),
  headers: { "content-type": "application/json"}
});

const fail = (err:Error)=>({
  isBase64Encoded: false,
  statusCode: 500,
  body: err.message,
  headers: { "content-type": "application/json"}
});

const exec = async(event:any, hnd:(app:App, data:any)=>any)=>{
  const data = {
    ...JSON.parse(event.body), 
    IdOwner: event.requestContext.authorizer.sub //IdOwner preenchido pelos access_token
  };
  
  try
  { return success(await hnd(new App(), data)); }
  catch(ex)
  { return fail(ex); }
}

export const addTask     = async (event) => await exec(event, (app, body) => app.addTask({...body, StartTime: new Date(body.StartTime), EndTime: new Date(body.EndTime) }));
export const readTask    = async (event) => await exec(event, (app, body) => app.getTask(body));
export const listTasks   = async (event) => await exec(event, (app, body) => app.listTasks({...body, minDate: new Date(body.minDate), maxDate: new Date(body.maxDate)}));
export const removeTask  = async (event) => await exec(event, (app, body) => app.deleteTask(body));

export const addImg           = async (event) => await exec(event, (app, body) => app.addImage(body));
export const listImgs         = async (event) => await exec(event, (app, body) => app.listImages(body));
export const requestPostImage = async (event) => await exec(event, (app, _) => app.requestPostImage());

export const wsConn = async(event, _, callback) => {
  const successfullResponse = {
    statusCode: 200,
    body: 'Success'
  }

  console.log(event);
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
