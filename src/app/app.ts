//import {DeleteItemCommand, DeleteItemCommandInput, DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput} from '@aws-sdk/client-dynamodb';
import { IData as ITaskData, IPK as ITaskPK, IFIlter as ITaskFilter } from './task/models';
import { GetObjectCommand, S3Client, CopyObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { Task } from './task/task';
  

//const s3 = new S3Client({ region: "sa-east-1" });
        
// const tblImg = process.env.tblImg;
// const bktTmp  = process.env.bktTmp;
// const bktPriv = process.env.bktPriv;


export class App{

    
    
    async addTask(itm:ITaskData[]){
        const task = new Task();
        await task.post(itm);
        
        
    }

    async getTask(pk:ITaskPK){
        const task = new Task();
        await task.get(pk);
    }

    async listTasks(filter: ITaskFilter){
        const task = new Task();
        await task.list(filter);
    }

    async deleteTask(key:ITaskPK){
        const task = new Task();
        await task.del(key);
    }

    async requestPostImage(){
        // const id = randomUUID();
        // const cmd = new PutObjectCommand({Bucket: bktTmp, Key: id });
        // const url = await getSignedUrl(s3, cmd, { expiresIn: 15 * 60 });
        
        // return { id, url };
    }

    async addImage(key:{IdFile:string, IdOwner:string}){
        
        // const arq = `photo/${key.IdFile}`;
        // const copy = new CopyObjectCommand({  CopySource: `${bktTmp}/${key.IdFile}`, Bucket: bktPriv, Key: arq });
        // await s3.send(copy)

        // const rmv = new DeleteObjectCommand({ Bucket: bktTmp, Key: key.IdFile });
        // await s3.send(rmv);
        
        // const cmd = new GetObjectCommand({Bucket: bktPriv, Key: arq });
        // const url = await getSignedUrl(s3, cmd, { expiresIn: 10 * 24 * 60 * 60 });
        
        // await ddb.send( new PutItemCommand({
        //     TableName: tblImg,
        //     Item: {
        //         IdOwner:  {S: key.IdOwner},
        //         IdFile:   {S: key.IdFile},
        //         Url:      {S: url}
        //     }
        // }));
    }

    async listImages(filter: { IdOwner:string }){
        // const {Items} = await ddb.send(new QueryCommand({
        //     TableName: tblImg,
        //     KeyConditionExpression: 'IdOwner=:v1',
        //     ExpressionAttributeValues: {
        //         ":v1": {S: filter.IdOwner}, 
        //     },
        // }));

        // return Items.map(m=>({ IdFile: m.IdFile.S, Url: m.Url.S }));
    }

}