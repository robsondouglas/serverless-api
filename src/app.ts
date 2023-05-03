//import {DeleteItemCommand, DeleteItemCommandInput, DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput} from '@aws-sdk/client-dynamodb';
import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand} from '@aws-sdk/client-dynamodb';
import { flatDate } from './libs/utils';
import { IRequestAdd, IRequestAddBatch } from './models';
import { GetObjectCommand, S3Client, CopyObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const ddb = new DynamoDBClient({ region: "sa-east-1"  })//({ region: "local", endpoint: "http://localhost:8000"  });
const s3 = new S3Client({ region: "sa-east-1" });
        
const tblTask = process.env.tblTask;
const tblImg = process.env.tblImg;
const bktTmp  = process.env.bktTmp;
const bktPriv = process.env.bktPriv;


export class App{

    private mdl2db = (mdl:any)=>({
        IdOwner:   {S: mdl.IdOwner},
        DayTask:   {N: mdl.Day.valueOf().toString()},
        Tasks:     {L: mdl.Tasks.map( (m) => ({
            M: {
                IdTask:    {S: m.IdTask },
                StartTime: {N: m.StartTime.valueOf().toString()},
                EndTime:   {N: m.EndTime.valueOf().toString()},
                GroupId:   {N: m.GroupId.toString()},
                IsAllDay:  {BOOL: m.IsAllDay},
                Subject:   {S: m.Subject}    
               }
            }))
        }
    })

    private db2mdl = (itm:any)=>({
        IdOwner:   itm.IdOwner.S,
        Day:       new Date( Number.parseInt(itm.DayTask.N) ),
        Tasks:     itm.Tasks.L.map( ({M:m}:any)=> ({
            IdTask:    m.IdTask.S,
            StartTime: new Date( Number.parseInt(m.StartTime.N) ),
            EndTime:   new Date( Number.parseInt(m.EndTime.N) ),
            GroupId:   Number.parseInt(m.GroupId.N),
            IsAllDay:  m.IsAllDay.BOOL,
            Subject:   m.Subject.S
        }))
    });

    async addTaskBatch(itm:IRequestAddBatch){
        await ddb.send( new PutItemCommand({
            TableName: tblTask,
            Item: this.mdl2db(itm)
        }));
    }
    
    async addTask({IdOwner, ...itm}:IRequestAdd){
        const key = { IdOwner:IdOwner, Day: flatDate(itm.StartTime) };
        const curr = await this.getTask(key)
        if(curr)
        { 
            curr.Tasks.push(itm)
            await this.addTaskBatch(curr); 
        } 
        else
        {
            await this.addTaskBatch({
                ...key,
                Tasks: [itm]
            });
        }
    }

    async getTask(key:{ IdOwner:string, Day: Date }){
        const {Item} = await ddb.send( new GetItemCommand({
            TableName: tblTask,
            Key: {  
                IdOwner:   {S: key.IdOwner},
                DayTask:   {N: key.Day.valueOf().toString()}
            }             
        }));
        
        return Item ? this.db2mdl(Item) : null;
    }

    async listTasks(filter: { IdOwner:string, minDate:Date, maxDate:Date }){
        const {Items} = await ddb.send(new QueryCommand({
            TableName: tblTask,
            KeyConditionExpression: 'IdOwner=:v1 AND DayTask BETWEEN :d1 AND :d2',
            ExpressionAttributeValues: {
                ":v1": {S: filter.IdOwner}, 
                ":d1": {N: filter.minDate.valueOf().toString()},
                ":d2": {N: filter.maxDate.valueOf().toString()},
            },
        }));

        return Items.map(m=>this.db2mdl(m));
    }

    async removeTask(key:{ IdOwner:string, Day: Date }){
        console.log('remove', key)
    }


    async requestPostImage(){
        const id = randomUUID();
        const cmd = new PutObjectCommand({Bucket: bktTmp, Key: id });
        const url = await getSignedUrl(s3, cmd, { expiresIn: 15 * 60 });
        
        return { id, url };
    }

    async addImage(key:{IdFile:string, IdOwner:string}){
        const arq = `photo/${key.IdFile}`;
        const copy = new CopyObjectCommand({  CopySource: `${bktTmp}/${key.IdFile}`, Bucket: bktPriv, Key: arq });
        await s3.send(copy)

        const rmv = new DeleteObjectCommand({ Bucket: bktTmp, Key: key.IdFile });
        await s3.send(rmv);
        
        const cmd = new GetObjectCommand({Bucket: bktPriv, Key: arq });
        const url = await getSignedUrl(s3, cmd, { expiresIn: 10 * 24 * 60 * 60 });
        
        await ddb.send( new PutItemCommand({
            TableName: tblImg,
            Item: {
                IdOwner:  {S: key.IdOwner},
                IdFile:   {S: key.IdFile},
                Url:      {S: url}
            }
        }));
    }

    async listImages(filter: { IdOwner:string }){
        const {Items} = await ddb.send(new QueryCommand({
            TableName: tblImg,
            KeyConditionExpression: 'IdOwner=:v1',
            ExpressionAttributeValues: {
                ":v1": {S: filter.IdOwner}, 
            },
        }));

        return Items.map(m=>({ IdFile: m.IdFile.S, Url: m.Url.S }));
    }

}