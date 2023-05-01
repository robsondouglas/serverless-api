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

const exec = async(event:any, hnd:(app:App, body:any)=>any)=>{
   try
   { return success(await hnd(new App(), JSON.parse(event.body))); }
   catch(ex)
   { return fail(ex); }
}



export const add     = async (event) => await exec(event, (app, body) => app.add(body));
export const append  = async (event) => await exec(event, (app, body) => app.append(body));
export const read    = async (event) => await exec(event, (app, body) => app.read(body));
export const list    = async (event) => await exec(event, (app, body) => app.list(body));
export const answer  = async (event) => await exec(event, (app, body) => app.answer(body));